import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapPin, AlertCircle, RefreshCw, Share2 } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import VehicleStatusIndicator from '../components/VehicleStatusIndicator'
import LiveTracking from '../components/LiveTracking'
import TrackingMap from '../components/TrackingMap'
import TripTimeline from '../components/TripTimeline'
import LocationSharingToggle from '../components/LocationSharingToggle'
import {
  initializeSocketConnection,
  disconnectSocket,
  getSocket,
  startTracking,
  startLocationTracking,
  stopLocationTracking,
  endTracking,
  getTrackingData,
  getTripSummary,
  enableLocationSharing,
  disableLocationSharing,
  onVehicleUpdate,
  onTrackingStarted,
  onTrackingEnded
} from '../services/trackingService'
import { getBookingDetails } from '../services/api'

export default function TripTrackingPage() {
  const { bookingId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [tripSummary, setTripSummary] = useState(null)
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)

  // Load booking details
  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await getBookingDetails(bookingId)
        setBooking(data.booking)
      } catch (err) {
        console.error('Error loading booking:', err)
        setError('Failed to load booking details')
      }
    }

    if (bookingId) {
      loadBooking()
    }
  }, [bookingId])

  // Initialize tracking
  useEffect(() => {
    const initTracking = async () => {
      if (!booking || !user) return

      try {
        setLoading(true)

        // Initialize socket
        await initializeSocketConnection(user._id, bookingId, 'customer')
        setSocketConnected(true)

        // Start tracking
        await startTracking(bookingId, booking.vehicle)
        setIsTracking(true)

        // Fetch initial tracking data
        const data = await getTrackingData(bookingId)
        setTracking(data.tracking)
        setLocationSharingEnabled(data.tracking.locationSharingEnabled)

        // Start sending location
        await startLocationTracking(bookingId, 5000)

        // Set up listeners
        onVehicleUpdate(data => {
          console.log('📍 Vehicle update:', data)
          setTracking(prev =>
            prev
              ? {
                  ...prev,
                  currentLocation: data.currentLocation,
                  currentSpeed: data.speed,
                  status: data.status,
                  lastUpdate: data.lastUpdate,
                  locationHistory: [
                    ...(prev.locationHistory || []),
                    {
                      lat: data.currentLocation.lat,
                      lng: data.currentLocation.lng,
                      timestamp: new Date()
                    }
                  ]
                }
              : null
          )
        })

        setLoading(false)
      } catch (err) {
        console.error('Error initializing tracking:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (booking && user) {
      initTracking()
    }

    return () => {
      if (isTracking) {
        stopLocationTracking()
      }
    }
  }, [booking, user, bookingId, isTracking])

  const handleLocationSharingToggle = async (enable) => {
    try {
      if (enable) {
        await enableLocationSharing(bookingId)
        setLocationSharingEnabled(true)
      } else {
        await disableLocationSharing(bookingId)
        setLocationSharingEnabled(false)
      }
    } catch (err) {
      console.error('Error toggling location sharing:', err)
      setError(err.message)
    }
  }

  const handleEndTrip = async () => {
    try {
      stopLocationTracking()
      await endTracking(bookingId)
      const summary = await getTripSummary(bookingId)
      setTripSummary(summary.summary)
      setIsTracking(false)
      disconnectSocket()
    } catch (err) {
      console.error('Error ending trip:', err)
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="animate-spin inline-block mb-4">
            <RefreshCw className="text-cyan-400" size={32} />
          </div>
          <p className="text-gray-400">Loading trip tracking...</p>
        </GlassCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md w-full">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-bold text-red-400">Error</h3>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/booking/${bookingId}`)}
            className="w-full mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
          >
            Go Back to Booking
          </button>
        </GlassCard>
      </div>
    )
  }

  if (!booking || !tracking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <p className="text-gray-400">No trip data available</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-12">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-cyan-400" size={32} />
            <h1 className="text-4xl font-black">
              <span className="gradient-text">Trip Tracking</span>
            </h1>
          </div>
          <p className="text-gray-400">
            Vehicle: {booking.vehicle?.registrationNumber || 'Unknown'}
            {socketConnected && <span className="text-green-400 ml-2">• Connected</span>}
          </p>
        </div>

        {/* Trip Completed Summary */}
        {tripSummary && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
            <h3 className="text-xl font-bold text-green-400 mb-4">✓ Trip Completed</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Distance</span>
                <div className="text-lg font-bold text-white">{tripSummary.totalDistance?.toFixed(2)} km</div>
              </div>
              <div>
                <span className="text-gray-400">Duration</span>
                <div className="text-lg font-bold text-white">{tripSummary.totalMovingTime} min</div>
              </div>
              <div>
                <span className="text-gray-400">Max Speed</span>
                <div className="text-lg font-bold text-white">{tripSummary.maxSpeed?.toFixed(1)} km/h</div>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/booking/${bookingId}`)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition w-full"
                >
                  View Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Location Sharing */}
            <LocationSharingToggle
              bookingId={bookingId}
              enabled={locationSharingEnabled}
              onEnable={() => handleLocationSharingToggle(true)}
              onDisable={() => handleLocationSharingToggle(false)}
            />

            {/* Current Status */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Current Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <VehicleStatusIndicator status={tracking.status} />
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Speed:</span>
                    <span className="text-white font-bold">{tracking.currentSpeed?.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Distance:</span>
                    <span className="text-white font-bold">{tracking.totalDistance?.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max Speed:</span>
                    <span className="text-white font-bold">{tracking.maxSpeed?.toFixed(1)} km/h</span>
                  </div>
                </div>

                {isTracking && (
                  <button
                    onClick={handleEndTrip}
                    className="w-full mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
                  >
                    End Trip
                  </button>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Map */}
            {tracking.locationHistory && (
              <TrackingMap
                locationHistory={tracking.locationHistory}
                currentLocation={tracking.currentLocation}
              />
            )}

            {/* Live Tracking Widget */}
            <LiveTracking
              bookingId={bookingId}
              vehicleInfo={booking.vehicle}
              trackingData={tracking}
            />
          </div>
        </div>

        {/* Trip Timeline */}
        {tracking.tripEvents && (
          <TripTimeline
            tripEvents={tracking.tripEvents}
            locationHistory={tracking.locationHistory}
          />
        )}
      </div>
    </div>
  )
}

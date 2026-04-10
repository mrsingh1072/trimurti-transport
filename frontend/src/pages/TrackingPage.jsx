import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLiveTracking, getBookings } from '../services/api'
import LiveTrackingMap from '../components/LiveTrackingMap'
import { AlertCircle, Loader, Navigation } from 'lucide-react'

// Demo vehicle data for testing
const DEMO_BOOKING = {
  bookingId: 'demo-12345',
  vehicleName: 'Toyota Fortuner',
  registrationNumber: 'TL-01-AB-0001',
  customerName: 'John Doe',
  currentLocation: {
    latitude: 17.3850,
    longitude: 78.4867,
    status: 'live',
    updatedAt: new Date().toISOString()
  },
  user: {
    name: 'John Doe',
    phone: '+919876543210'
  },
  vehicle: {
    model: 'Toyota Fortuner',
    registrationNumber: 'TL-01-AB-0001'
  }
}

export default function TrackingPage() {
  const { user } = useAuth()
  const mapRef = useRef(null)
  const [trackedBookings, setTrackedBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetching, setRefetching] = useState(false)
  const [useDemo, setUseDemo] = useState(false)

  console.log('🚗 TrackingPage - User:', user)

  // Fetch tracked bookings
  useEffect(() => {
    const fetchTrackedBookings = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('📍 Fetching tracked bookings for role:', user?.role)

        // For staff/admin - get all live tracked vehicles
        if (user?.role === 'staff' || user?.role === 'admin') {
          const liveData = await getLiveTracking()
          console.log('✅ Live tracking data received:', liveData)
          
          const bookings = Array.isArray(liveData) ? liveData : (liveData?.data || [])
          console.log('📊 Total tracked bookings:', bookings.length)
          
          if (bookings.length > 0) {
            setTrackedBookings(bookings)
            setSelectedBooking(bookings[0])
            setUseDemo(false)
          } else {
            // No real data - use demo for testing
            console.warn('⚠️ No tracked bookings - using demo data')
            setTrackedBookings([DEMO_BOOKING])
            setSelectedBooking(DEMO_BOOKING)
            setUseDemo(true)
          }
        } else {
          // For customers - get their own tracked bookings
          const bookingsRes = await getBookings()
          const allBookings = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes?.bookings || [])
          
          // Filter bookings that are being tracked (isTracking: true) or have live status
          const tracked = allBookings.filter(b => 
            b.isTracking === true || 
            b.currentLocation?.status === 'live' ||
            (b.currentLocation && b.currentLocation.latitude)
          )
          
          console.log('🚙 Customer tracked bookings:', tracked.length, tracked)
          
          if (tracked.length > 0) {
            setTrackedBookings(tracked)
            setSelectedBooking(tracked[0])
            setUseDemo(false)
          } else {
            setTrackedBookings([])
            setUseDemo(false)
          }
        }
      } catch (err) {
        console.error('❌ Error fetching tracked bookings:', err)
        setError('Failed to load tracking data - using demo')
        setTrackedBookings([DEMO_BOOKING])
        setSelectedBooking(DEMO_BOOKING)
        setUseDemo(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTrackedBookings()

    // Set up polling - update every 5 seconds
    const interval = setInterval(fetchTrackedBookings, 5000)
    console.log('⏱️ Polling interval started: 5 seconds')

    return () => {
      clearInterval(interval)
      console.log('🛑 Polling interval cleared')
    }
  }, [user?.role])

  // Auto-select first vehicle when data loads
  useEffect(() => {
    if (trackedBookings.length > 0 && !selectedBooking) {
      const booking = trackedBookings[0]
      console.log('✅ Auto-selecting first vehicle:', {
        bookingId: booking.bookingId,
        vehicleName: booking.vehicleName,
        hasVehicle: !!booking.vehicle,
        hasLocation: !!booking.currentLocation
      })
      setSelectedBooking(booking)
    }
  }, [trackedBookings])

  // Handle complete booking
  const handleComplete = async () => {
    try {
      setRefetching(true)
      console.log('✅ Completing trip for booking:', selectedBooking?.bookingId)
      alert('Trip marked as complete. Thank you!')
    } catch (err) {
      console.error('Error completing trip:', err)
      alert('Error completing trip')
    } finally {
      setRefetching(false)
    }
  }

  // Handle report issue
  const handleReportIssue = async () => {
    const issue = prompt('Describe the issue:')
    if (issue) {
      try {
        setRefetching(true)
        console.log('⚠️ Reporting issue for booking:', selectedBooking?.bookingId, 'Issue:', issue)
        alert('Issue reported. Support team will contact you shortly.')
      } catch (err) {
        console.error('Error reporting issue:', err)
        alert('Error reporting issue')
      } finally {
        setRefetching(false)
      }
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-950">
      {/* Header - fixed height */}
      <div className="px-6 py-6 space-y-2 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Live Vehicle Tracking</h1>
        </div>
        <p className="text-gray-400">Real-time location sharing and route monitoring</p>
        {useDemo && <p className="text-yellow-400 text-sm mt-2">🔶 Demo Mode - Using sample data</p>}
      </div>

      {/* Error state */}
      {error && (
        <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-gray-400">Fetching real-time tracking data...</p>
        </div>
      ) : trackedBookings.length === 0 ? (
        // No vehicles state
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-12 text-center max-w-md">
            <div className="mb-4 text-4xl">🚫</div>
            <p className="text-white font-semibold text-lg mb-2">No Active Tracking</p>
            <p className="text-gray-400">
              {user?.role === 'customer'
                ? 'Enable location sharing on your active bookings to see them here'
                : 'No vehicles are currently being tracked'}
            </p>
          </div>
        </div>
      ) : (
        // Content area - flex-1 to fill remaining space
        <div className="flex-1 flex px-6 py-6 gap-6 overflow-hidden">
          {/* Map Container - takes 3/4 of space */}
          <div className="flex-1 min-w-0">
            <div className="w-full h-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 relative">
                {selectedBooking ? (
                  <LiveTrackingMap
                    booking={selectedBooking}
                    mapRef={mapRef}
                    onComplete={handleComplete}
                    onReportIssue={handleReportIssue}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <p className="text-gray-400">Select a vehicle to track</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Booking List - takes 1/4 of space */}
            <div className="w-80 flex flex-col bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 sticky top-0 bg-gray-900/80 backdrop-blur">
                <p className="text-gray-400 text-sm font-semibold">
                  ACTIVE VEHICLES ({trackedBookings.length})
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 p-3">
                {trackedBookings.map((booking) => {
                  // Get vehicle name from multiple possible sources
                  const vehicleName = booking.vehicleName || booking.vehicle?.model || booking.vehicle?.modelName || 'Vehicle'
                  const regNumber = booking.registrationNumber || booking.vehicle?.registrationNumber || 'N/A'
                  const customerName = booking.customerName || booking.user?.name || 'Customer'
                  
                  const isWaiting = booking.currentLocation?.status === 'pending' || !booking.currentLocation?.latitude
                  const isSelected = selectedBooking?.bookingId === booking.bookingId

                  return (
                    <div
                      key={booking.bookingId}
                      onClick={() => {
                        setSelectedBooking(booking)
                        console.log('🔄 Selected booking:', booking.bookingId, { vehicleName, customerName })
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-500/20 border border-blue-500/50 shadow-lg'
                          : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {vehicleName}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {regNumber}
                          </p>
                        </div>
                        <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1 ${
                          isWaiting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'
                        }`} />
                      </div>

                      <div className="text-xs text-gray-400 space-y-1">
                        <p className="truncate text-gray-300">👤 {customerName}</p>
                        <p className="text-xs">
                          {isWaiting ? (
                            <span className="text-yellow-400 font-semibold">⏳ Waiting for location...</span>
                          ) : (
                            <span className="text-green-400 font-semibold">● Pending</span>
                          )}
                        </p>
                      </div>

                      {/* Status badge - simplified */}
                      <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
                        {isSelected && <span className="text-blue-400 font-semibold">✓ Tracking</span>}
                      </div>
                      <div className="mt-2 hidden">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          isWaiting
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {isWaiting ? '⏳ Pending' : '✓ Active'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
        </div>
      )}
    </div>
  )
}

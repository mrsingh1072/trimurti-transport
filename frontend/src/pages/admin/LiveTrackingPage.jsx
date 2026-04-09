import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Truck, MapPin, Zap, AlertCircle, RefreshCw } from 'lucide-react'
import GlassCard from '../../components/GlassCard'
import VehicleStatusIndicator from '../../components/VehicleStatusIndicator'
import TrackingMap from '../../components/TrackingMap'
import {
  initializeSocketConnection,
  disconnectSocket,
  getSocket,
  requestActiveVehicles,
  onActiveVehiclesUpdate,
  onVehicleUpdated,
  getTrackingData
} from '../../services/trackingService'

export default function LiveTrackingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedTracking, setSelectedTracking] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)

  // Check if user is admin or staff
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'staff') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Initialize Socket.IO and fetch vehicles
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        setLoading(true)
        setError(null)

        // Initialize socket
        await initializeSocketConnection(user._id, 'live-tracking-admin', user.role)
        setSocketConnected(true)

        // Request active vehicles
        await requestActiveVehicles()

        // Set up listeners
        const socket = getSocket()

        onActiveVehiclesUpdate(updatedVehicles => {
          console.log('📊 Vehicles updated:', updatedVehicles)
          setVehicles(updatedVehicles)
          setLoading(false)
        })

        onVehicleUpdated(update => {
          console.log('🚗 Vehicle updated:', update)
          setVehicles(prev =>
            prev.map(v => (v.bookingId === update.bookingId ? { ...v, ...update } : v))
          )
        })
      } catch (err) {
        console.error('Error initializing tracking:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (user) {
      initializeTracking()
    }

    return () => {
      disconnectSocket()
    }
  }, [user])

  // Fetch tracking details for selected vehicle
  useEffect(() => {
    const fetchTrackingDetails = async () => {
      if (!selectedVehicle) return

      try {
        const data = await getTrackingData(selectedVehicle.bookingId)
        setSelectedTracking(data.tracking)
      } catch (err) {
        console.error('Error fetching tracking details:', err)
      }
    }

    fetchTrackingDetails()
  }, [selectedVehicle])

  // Filter vehicles
  const filteredVehicles = vehicles.filter(
    v => filterStatus === 'all' || v.status === filterStatus
  )

  const stats = {
    total: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
    offline: vehicles.filter(v => v.status === 'offline').length
  }

  const formatTime = timestamp => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Unauthorized access</div>
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
            <Truck className="text-cyan-400" size={32} />
            <h1 className="text-4xl font-black">
              <span className="gradient-text">Live Vehicle Tracking</span>
            </h1>
          </div>
          <p className="text-gray-400">
            Monitor active vehicles in real-time
            {socketConnected && <span className="text-green-400 ml-2">• Connected</span>}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="Total Active" value={stats.total} color="purple" />
          <StatCard label="Moving" value={stats.moving} color="green" />
          <StatCard label="Idle" value={stats.idle} color="yellow" />
          <StatCard label="Offline" value={stats.offline} color="red" />
          <div className="md:col-span-1">
            <GlassCard className="p-4 h-full flex flex-col justify-center items-center">
              <div className="text-xs text-gray-400 mb-2">UPDATES</div>
              <div className="animate-spin">
                <RefreshCw size={20} className="text-cyan-400" />
              </div>
            </GlassCard>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-400">Connection Error</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicles List */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4">Active Vehicles</h3>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'moving', 'idle', 'offline'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      filterStatus === status
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block">
                    <RefreshCw className="text-cyan-400" size={24} />
                  </div>
                  <p className="text-gray-400 mt-2">Loading vehicles...</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No vehicles to display</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredVehicles.map(vehicle => (
                    <button
                      key={vehicle._id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`w-full p-3 rounded-lg text-left transition border ${
                        selectedVehicle?._id === vehicle._id
                          ? 'bg-purple-500/30 border-purple-500/50'
                          : 'bg-black/30 border-purple-500/20 hover:bg-purple-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{vehicle.registrationNumber}</h4>
                          <p className="text-xs text-gray-400">{vehicle.vehicleName}</p>
                        </div>
                        <VehicleStatusIndicator status={vehicle.status} />
                      </div>
                      <div className="text-xs text-gray-400">
                        <div>User: {vehicle.userName}</div>
                        <div>Speed: {vehicle.currentSpeed?.toFixed(1)} km/h</div>
                        <div>Last: {formatTime(vehicle.lastUpdate)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Details & Map */}
          <div className="lg:col-span-2 space-y-6">
            {selectedVehicle ? (
              <>
                {/* Vehicle Details */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Vehicle Details</h3>

                  <div className="space-y-3">
                    <DetailRow
                      label="Registration"
                      value={selectedVehicle.registrationNumber}
                    />
                    <DetailRow label="Vehicle" value={selectedVehicle.vehicleName} />
                    <DetailRow label="Driver" value={selectedVehicle.userName} />
                    <DetailRow
                      label="Phone"
                      value={selectedVehicle.userPhone || 'N/A'}
                    />
                    <DetailRow
                      label="Distance Traveled"
                      value={`${selectedVehicle.totalDistance?.toFixed(2) || 0} km`}
                    />
                    <DetailRow
                      label="Max Speed"
                      value={`${selectedVehicle.maxSpeed?.toFixed(1) || 0} km/h`}
                    />
                  </div>
                </GlassCard>

                {/* Current Location */}
                {selectedVehicle.currentLocation && (
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Current Location</h3>

                    <div className="space-y-3">
                      <DetailRow
                        label="Latitude"
                        value={selectedVehicle.currentLocation.lat?.toFixed(6)}
                      />
                      <DetailRow
                        label="Longitude"
                        value={selectedVehicle.currentLocation.lng?.toFixed(6)}
                      />
                      <DetailRow
                        label="Current Speed"
                        value={`${selectedVehicle.currentSpeed?.toFixed(1) || 0} km/h`}
                      />
                      <DetailRow
                        label="Last Updated"
                        value={formatTime(selectedVehicle.lastUpdate)}
                      />
                    </div>
                  </GlassCard>
                )}

                {/* Route Map */}
                {selectedTracking?.locationHistory && (
                  <TrackingMap
                    locationHistory={selectedTracking.locationHistory}
                    currentLocation={selectedTracking.currentLocation}
                  />
                )}
              </>
            ) : (
              <div className="lg:col-span-2 flex items-center justify-center h-96">
                <GlassCard className="p-8 text-center w-full">
                  <MapPin size={32} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">Select a vehicle to view tracking details</p>
                </GlassCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    green: 'from-green-500/20 to-green-500/5 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 text-yellow-400',
    red: 'from-red-500/20 to-red-500/5 text-red-400'
  }

  return (
    <GlassCard
      className={`p-4 bg-gradient-to-br ${colorClasses[color]}`}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </GlassCard>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-purple-500/10 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}

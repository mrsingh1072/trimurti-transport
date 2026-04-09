import { useState, useEffect } from 'react'
import { MapPin, Clock, Wind, Route, AlertCircle } from 'lucide-react'
import GlassCard from './GlassCard'
import VehicleStatusIndicator from './VehicleStatusIndicator'

export default function LiveTracking({ bookingId, vehicleInfo, trackingData, onClose }) {
  const [tracking, setTracking] = useState(trackingData)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (trackingData) {
      setTracking(trackingData)
    }
  }, [trackingData])

  if (!tracking) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto mb-4 text-yellow-500" size={32} />
        <p className="text-gray-400">No tracking data available</p>
      </div>
    )
  }

  const formatTime = timestamp => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <GlassCard className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Live Vehicle Tracking</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <MapPin size={16} />
            <span>{vehicleInfo?.registrationNumber || 'Vehicle'}</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Current Status:</span>
        <VehicleStatusIndicator status={tracking.status} />
      </div>

      {/* Current Location */}
      {tracking.currentLocation && (
        <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
          <div className="text-sm text-gray-400 mb-2">Current Location</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Latitude:</span>
              <span className="font-mono text-white">{tracking.currentLocation.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Longitude:</span>
              <span className="font-mono text-white">{tracking.currentLocation.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Last Update:</span>
              <span className="text-cyan-400">{formatTime(tracking.lastUpdate)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Speed & Distance Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Wind size={16} className="text-cyan-400" />
            <span className="text-xs text-gray-400 uppercase">Current Speed</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {tracking.currentSpeed.toFixed(1)} <span className="text-sm text-gray-400">km/h</span>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Route size={16} className="text-cyan-400" />
            <span className="text-xs text-gray-400 uppercase">Total Distance</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {tracking.totalDistance?.toFixed(2) || '0'} <span className="text-sm text-gray-400">km</span>
          </div>
        </div>
      </div>

      {/* Max Speed */}
      <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Max Speed Recorded:</span>
          <span className="text-lg font-bold text-yellow-400">{tracking.maxSpeed?.toFixed(1) || '0'} km/h</span>
        </div>
      </div>

      {/* Duration */}
      {tracking.trackingStarted && (
        <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Tracking Duration</div>
              <div className="text-sm text-white">
                Started: <span className="text-cyan-400">{formatDate(tracking.trackingStarted)}</span>
              </div>
              {tracking.trackingEnded && (
                <div className="text-sm text-white">
                  Ended: <span className="text-cyan-400">{formatDate(tracking.trackingEnded)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location History Count */}
      <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Locations Recorded:</span>
          <span className="text-lg font-bold text-cyan-400">{tracking.locationHistory?.length || 0}</span>
        </div>
      </div>

      {/* Geofence Alerts */}
      {tracking.geofenceAlerts && tracking.geofenceAlerts.length > 0 && (
        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-sm font-bold text-red-400">Geofence Alerts</span>
              <div className="mt-2 space-y-1">
                {tracking.geofenceAlerts.map((alert, idx) => (
                  <div key={idx} className="text-xs text-red-300 bg-red-500/5 rounded px-2 py-1">
                    {alert.alertType === 'outside' ? '❌ Outside boundary' : '⚠️ Approaching boundary'} -
                    {' '}
                    {formatTime(alert.timestamp)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  )
}

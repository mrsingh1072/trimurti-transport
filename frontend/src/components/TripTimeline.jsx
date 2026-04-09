import GlassCard from './GlassCard'
import { MapPin, Clock, Zap } from 'lucide-react'

export default function TripTimeline({ tripEvents, locationHistory }) {
  if (!tripEvents || tripEvents.length === 0) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Trip Timeline</h3>
        <p className="text-gray-400 text-center py-8">No events recorded yet</p>
      </GlassCard>
    )
  }

  const eventIcons = {
    started: '🚗',
    moving: '💨',
    idle: '⏸️',
    resumed: '▶️',
    offline: '📡',
    completed: '✓'
  }

  const eventColors = {
    started: 'text-green-400 border-green-500/50',
    moving: 'text-cyan-400 border-cyan-500/50',
    idle: 'text-yellow-400 border-yellow-500/50',
    resumed: 'text-purple-400 border-purple-500/50',
    offline: 'text-red-400 border-red-500/50',
    completed: 'text-emerald-400 border-emerald-500/50'
  }

  const formatTime = timestamp => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDistance = () => {
    if (!locationHistory || locationHistory.length === 0) return 0

    let totalDistance = 0
    const R = 6371 // Earth's radius in km

    for (let i = 1; i < locationHistory.length; i++) {
      const lat1 = (locationHistory[i - 1].lat * Math.PI) / 180
      const lat2 = (locationHistory[i].lat * Math.PI) / 180
      const deltaLat = ((locationHistory[i].lat - locationHistory[i - 1].lat) * Math.PI) / 180
      const deltaLng = ((locationHistory[i].lng - locationHistory[i - 1].lng) * Math.PI) / 180

      const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      totalDistance += R * c
    }

    return totalDistance.toFixed(2)
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-6">Trip Timeline</h3>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-cyan-500/50"></div>

        {/* Events */}
        <div className="space-y-6">
          {tripEvents.map((event, idx) => (
            <div key={idx} className="relative pl-20">
              {/* Event dot */}
              <div
                className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-xl
                  border bg-black/50 ${eventColors[event.eventType] || 'text-gray-400 border-gray-500/50'}`}
              >
                {eventIcons[event.eventType] || '•'}
              </div>

              {/* Event content */}
              <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-white capitalize">{event.eventType}</h4>
                  <span className="text-xs text-cyan-400">{formatTime(event.timestamp)}</span>
                </div>

                {/* Event details */}
                <div className="space-y-1 text-xs text-gray-400">
                  {event.speed > 0 && (
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-yellow-400" />
                      <span>Speed: <span className="text-white">{event.speed.toFixed(1)} km/h</span></span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-start gap-2">
                      <MapPin size={12} className="text-cyan-400 mt-0.5" />
                      <div>
                        <div>Lat: <span className="text-white font-mono">{event.location.lat?.toFixed(6)}</span></div>
                        <div>Lng: <span className="text-white font-mono">{event.location.lng?.toFixed(6)}</span></div>
                      </div>
                    </div>
                  )}

                  {event.details && (
                    <div className="text-gray-300 italic mt-2">
                      {event.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trip Summary */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400 mb-1">Total Distance</div>
              <div className="text-lg font-bold text-white">{formatDistance()} km</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Total Events</div>
              <div className="text-lg font-bold text-white">{tripEvents.length}</div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

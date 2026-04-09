import { useEffect, useRef } from 'react'
import GlassCard from './GlassCard'
import { MapPin } from 'lucide-react'

export default function TrackingMap({ locationHistory, currentLocation, maxZoom = 15 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !locationHistory || locationHistory.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas size
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Calculate bounds
    let minLat = locationHistory[0].lat
    let maxLat = locationHistory[0].lat
    let minLng = locationHistory[0].lng
    let maxLng = locationHistory[0].lng

    locationHistory.forEach(loc => {
      minLat = Math.min(minLat, loc.lat)
      maxLat = Math.max(maxLat, loc.lat)
      minLng = Math.min(minLng, loc.lng)
      maxLng = Math.max(maxLng, loc.lng)
    })

    // Add padding
    const latRange = maxLat - minLat || 0.001
    const lngRange = maxLng - minLng || 0.001
    const padding = 0.1

    minLat -= latRange * padding
    maxLat += latRange * padding
    minLng -= lngRange * padding
    maxLng += lngRange * padding

    // Convert lat/lng to canvas coordinates
    const latToY = lat => {
      return canvas.height - ((lat - minLat) / (maxLat - minLat)) * canvas.height
    }

    const lngToX = lng => {
      return ((lng - minLng) / (maxLng - minLng)) * canvas.width
    }

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const x = (canvas.width / 4) * i
      const y = (canvas.height / 4) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw polyline
    ctx.strokeStyle = '#06B6D4'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(lngToX(locationHistory[0].lng), latToY(locationHistory[0].lat))

    locationHistory.forEach((loc, idx) => {
      ctx.lineTo(lngToX(loc.lng), latToY(loc.lat))

      // Draw speed indicator with color gradient
      if (loc.speed !== undefined && idx % 5 === 0) {
        const speedRatio = Math.min(loc.speed / 100, 1)
        const hue = (1 - speedRatio) * 120 // Green to Red
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
        ctx.fillRect(lngToX(loc.lng) - 2, latToY(loc.lat) - 2, 4, 4)
      }
    })

    ctx.stroke()

    // Draw start point
    const startLng = locationHistory[0].lng
    const startLat = locationHistory[0].lat
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(lngToX(startLng), latToY(startLat), 6, 0, Math.PI * 2)
    ctx.fill()

    // Draw start icon
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('S', lngToX(startLng), latToY(startLat))

    // Draw end point
    if (locationHistory.length > 0) {
      const endLng = locationHistory[locationHistory.length - 1].lng
      const endLat = locationHistory[locationHistory.length - 1].lat
      ctx.fillStyle = '#EF4444'
      ctx.beginPath()
      ctx.arc(lngToX(endLng), latToY(endLat), 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.fillText('E', lngToX(endLng), latToY(endLat))
    }

    // Draw current location
    if (currentLocation) {
      const curLng = currentLocation.lng
      const curLat = currentLocation.lat
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)'
      ctx.beginPath()
      ctx.arc(lngToX(curLng), latToY(curLat), 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#06B6D4'
      ctx.beginPath()
      ctx.arc(lngToX(curLng), latToY(curLat), 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [locationHistory, currentLocation])

  if (!locationHistory || locationHistory.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin size={20} className="text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Route Map</h3>
        </div>
        <div className="w-full h-64 rounded-lg bg-black/50 border border-purple-500/20 flex items-center justify-center">
          <p className="text-gray-400">No location data available</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <MapPin size={20} className="text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Route Map</h3>
      </div>

      <div className="w-full h-96 rounded-lg overflow-hidden border border-purple-500/20 bg-black/50">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            display: 'block',
            maxWidth: '100%'
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
          <span className="text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-gray-400">End</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-black/30 rounded p-2 border border-purple-500/20">
          <div className="text-gray-400">Total Waypoints</div>
          <div className="text-white font-bold">{locationHistory.length}</div>
        </div>
        <div className="bg-black/30 rounded p-2 border border-purple-500/20">
          <div className="text-gray-400">Coverage</div>
          <div className="text-white font-bold">
            {(
              (Math.abs(locationHistory[0].lat - locationHistory[locationHistory.length - 1].lat) +
                Math.abs(locationHistory[0].lng - locationHistory[locationHistory.length - 1].lng)) *
              111
            ).toFixed(1)}{' '}
            km
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import { AlertCircle, Clock, MapPin, Navigation } from 'lucide-react'

// Fix for default marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom car icon
const carIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMzZCOUZGIi8+PHBhdGggZD0iTTEyIDEySDI4QzI5LjEwNDYgMTIgMzAgMTIuODk1NCAzMCAxNFYyNkMzMCAyNy4xMDQ2IDI5LjEwNDYgMjggMjggMjhIMTJDMTAuODk1NCAyOCAxMCAyNy4xMDQ2IDEwIDI2VjE0QzEwIDEyLjg5NTQgMTAuODk1NCAxMiAxMiAxMloiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTQiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiBmaWxsPSIjMzZCOUZGIi8+PHJlY3QgeD0iMjIiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiBmaWxsPSIjMzZCOUZGIi8+PC9zdmc+',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

// Pickup location icon (Orange)
const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMS42IDAgOCA0LjQgOCA5LjZDOCAxNS4yIDEzLjYgMjMuMiAxNiAyNkMyMC4xNiAxODMgMjQgMTUgMjQgOS42QzI0IDQuMjYgMjAuNDIgMCAxNiAwWiIgZmlsbD0iI0ZGOTgwMCIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iOS42IiByPSI0IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
})

// Destination icon (Green)
const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMS42IDAgOCA0LjQgOCA5LjZDOCAxNS4yIDEzLjYgMjMuMiAxNiAyNkMyMC4xNiAxODMgMjQgMTUgMjQgOS42QzI0IDQuMjYgMjAuNDIgMCAxNiAwWiIgZmlsbD0iIzEwQjk4MSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iOS42IiByPSI0IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
})

export default function LiveTrackingMap({ booking, mapRef, onComplete, onReportIssue }) {
  const [eta, setEta] = useState(null)
  const [distance, setDistance] = useState(null)

  // Get current vehicle position from booking
  const currentLocation = booking?.currentLocation
  const currentLat = currentLocation?.latitude
  const currentLng = currentLocation?.longitude
  
  // Create realistic Hyderabad pickup/destination for demo
  // Pickup: Hitech City
  const pickupLat = 17.3600
  const pickupLng = 78.4740
  
  // Destination: Financial District  
  const destLat = 17.4250
  const destLng = 78.5540
  
  // Default location (Hyderabad center)
  const defaultLat = 17.3850
  const defaultLng = 78.4867

  // Check if vehicle has valid location
  const hasValidLocation = currentLat !== null && currentLat !== undefined && currentLng !== null && currentLng !== undefined
  const displayLat = hasValidLocation ? currentLat : defaultLat
  const displayLng = hasValidLocation ? currentLng : defaultLng

  console.log('🗺️ LiveTrackingMap - Selected Vehicle:', booking?.vehicleName, 'Current Location:', { currentLat, currentLng }, 'Valid:', hasValidLocation)

  // Update map view when vehicle location changes
  useEffect(() => {
    if (mapRef?.current && (pickupLat || currentLat)) {
      // Focus on vehicle if available, otherwise on pickup
      const focusLat = hasValidLocation ? displayLat : pickupLat
      const focusLng = hasValidLocation ? displayLng : pickupLng
      mapRef.current.setView([focusLat, focusLng], 14, { animate: true })
      console.log('📍 Map focused')
    }
  }, [currentLat, currentLng, booking?.bookingId])

  // Calculate distance and ETA from current location to destination
  useEffect(() => {
    if (displayLat && displayLng) {
      // Haversine formula for distance
      const R = 6371 // Earth's radius in km
      const lat1Rad = (displayLat * Math.PI) / 180
      const lat2Rad = (destLat * Math.PI) / 180
      const deltaLat = ((destLat - displayLat) * Math.PI) / 180
      const deltaLng = ((destLng - displayLng) * Math.PI) / 180

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distanceKm = R * c

      // Assume average speed of 25 km/h in city traffic
      const etaMinutes = Math.round((distanceKm / 25) * 60)
      setEta(etaMinutes)
      setDistance(distanceKm.toFixed(1))
      console.log(`⏱️ Distance: ${distanceKm.toFixed(2)} km, ETA: ${etaMinutes} min`)
    }
  }, [displayLat, displayLng])

  console.log('🎨 Rendering LiveTrackingMap', { hasValidLocation, displayLat, displayLng, pickupLat, pickupLng })

  // Fallback rendering - show this first to test
  if (!booking) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <p className="text-gray-400">No booking data</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-gray-900 flex flex-col">
      {/* Debug Info */}
      <div className="text-xs text-gray-400 p-2 bg-gray-800/50 border-b border-gray-700">
        <p>📍 Vehicle: {booking?.vehicleName}</p>
        <p>📍 Location: {displayLat.toFixed(4)}, {displayLng.toFixed(4)}</p>
        <p>✓ Valid: {hasValidLocation ? 'Yes' : 'No'}</p>
      </div>

      {/* Map Container - flex-1 to fill remaining space */}
      <div className="flex-1 relative w-full">
        <div className="absolute inset-0 w-full h-full">
          <MapContainer
            ref={mapRef}
            center={[hasValidLocation ? displayLat : pickupLat, hasValidLocation ? displayLng : pickupLng]}
            zoom={14}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Route line - from pickup → vehicle → destination */}
            <Polyline
              positions={[[pickupLat, pickupLng], [displayLat, displayLng], [destLat, destLng]]}
              color="#FF9800"
              weight={3}
              opacity={0.9}
              dashArray="8, 5"
            />

            {/* Pickup location marker */}
            <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Pickup Location</p>
                  <p className="text-gray-600 text-xs">Starting Point</p>
                </div>
              </Popup>
            </Marker>

            {/* Vehicle current location - ONLY shown if valid location */}
            {hasValidLocation && (
              <>
                <Circle
                  center={[displayLat, displayLng]}
                  radius={50}
                  pathOptions={{ color: '#36B9FF', fillOpacity: 0.1, weight: 2 }}
                />
                <Marker position={[displayLat, displayLng]} icon={carIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{booking?.vehicle?.model || booking?.vehicleName || 'Vehicle'}</p>
                      <p className="text-gray-600">{booking?.vehicle?.registrationNumber || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-1">📍 {displayLat.toFixed(4)}, {displayLng.toFixed(4)}</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Destination marker */}
            <Marker position={[destLat, destLng]} icon={destinationIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Destination</p>
                  <p className="text-gray-600 text-xs">End Point</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Waiting for location overlay */}
        {!hasValidLocation && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm z-20 rounded-xl">
            <div className="text-center px-6">
              <div className="mb-3 text-5xl animate-pulse">📍</div>
              <p className="text-white font-bold text-lg mb-2">Waiting for First Location Update</p>
              <p className="text-gray-300 text-sm">
                Vehicle location will appear here as soon as GPS data is received. The vehicle is actively being tracked.
              </p>
              <div className="mt-4 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                <span className="text-gray-400 text-xs">Awaiting GPS signal...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ETA Badge - Top Left */}
      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur z-10 pointer-events-none font-bold text-sm">
        <Clock size={14} />
        <span>{eta || '--'} min</span>
      </div>

      {/* Tracking status - Top Right */}
      <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold backdrop-blur z-10 pointer-events-none border border-green-500/50">
        ● Live Tracking
      </div>

      {/* Info Card - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent pt-12 pb-4 px-4 rounded-t-3xl shadow-2xl z-20">
        {/* Driver & Vehicle Row */}
        <div className="flex items-end justify-between mb-4">
          {/* Driver Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {booking?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{booking?.user?.name || 'Driver'}</p>
              <p className="text-gray-400 text-xs">Driver</p>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="text-right">
            <p className="text-white font-bold text-sm">{booking?.vehicle?.registrationNumber || 'N/A'}</p>
            <p className="text-gray-400 text-xs">{booking?.vehicle?.model || 'Vehicle'}</p>
          </div>
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
          <div>
            <p className="text-gray-400 text-xs mb-1">Distance</p>
            <p className="text-white font-bold text-sm">{distance ? distance.toFixed(1) : '--'} km</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Status</p>
            <p className={`font-bold text-sm ${booking?.currentLocation?.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
              {booking?.currentLocation?.status === 'pending' ? '⏳ Pending' : '✓ Live'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">ETA</p>
            <p className="text-white font-bold text-sm">{eta || '--'} min</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onComplete}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 rounded-lg transition transform hover:scale-105 active:scale-95 text-sm"
          >
            ✓ COMPLETE
          </button>
          <button
            onClick={onReportIssue}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-2 rounded-lg transition transform hover:scale-105 active:scale-95 text-sm"
          >
            ⚠️ REPORT ISSUE
          </button>
        </div>
      </div>
    </div>
  )
}

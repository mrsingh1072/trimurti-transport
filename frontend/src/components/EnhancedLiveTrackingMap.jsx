import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { AlertCircle } from 'lucide-react'

// Fix for default marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom car icon
const carIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIxMiIgZmlsbD0iIzMzMzMzMyIgb3BhY2l0eT0iMC4xIi8+PGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjIiLz48cGF0aCBkPSJNMTQgMThIMzRDMzUuMTA0NiAxOCAzNiAxOC44OTU0IDM2IDIwVjI4QzM2IDI5LjEwNDYgMzUuMTA0NiAzMCAzNCAzMEgxNEMxMi44OTU0IDMwIDEyIDI5LjEwNDYgMTIgMjhWMjBDMTIgMTguODk1NCAxMi44OTU0IDE4IDE0IDE4WiIgZmlsbD0iI0ZGRjEwMCIvPjxyZWN0IHg9IjE4IiB5PSIyMiIgd2lkdGg9IjQiIGhlaWdodD0iNiIgZmlsbD0iIzMzMzMzMyIvPjxyZWN0IHg9IjI2IiB5PSIyMiIgd2lkdGg9IjQiIGhlaWdodD0iNiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
  shadowUrl: undefined,
})

/**
 * Map controller component to handle map interactions
 */
function MapController({ selectedVehicle, vehicles }) {
  const map = useMap()
  const hasMovedRef = useRef(false)

  useEffect(() => {
    if (!map || !selectedVehicle) return

    const lat = parseFloat(selectedVehicle.currentLocation?.latitude)
    const lng = parseFloat(selectedVehicle.currentLocation?.longitude)

    // Validate coordinates
    if (!isFinite(lat) || !isFinite(lng)) {
      console.warn('Invalid coordinates for selected vehicle')
      return
    }

    // Smooth animation to selected vehicle
    console.log(`🎯 Flying to vehicle at ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    map.flyTo([lat, lng], 14, { duration: 1 })
    hasMovedRef.current = true
  }, [selectedVehicle, map])

  // Initial map center on first vehicle or geolocation
  useEffect(() => {
    if (!map || hasMovedRef.current || !vehicles.length) return

    const validVehicles = vehicles.filter(
      v => isFinite(parseFloat(v.currentLocation?.latitude)) && 
           isFinite(parseFloat(v.currentLocation?.longitude))
    )

    if (validVehicles.length > 0) {
      const firstVehicle = validVehicles[0]
      const lat = parseFloat(firstVehicle.currentLocation.latitude)
      const lng = parseFloat(firstVehicle.currentLocation.longitude)
      
      console.log(`📍 Centering on first vehicle: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      map.setView([lat, lng], 14)
      hasMovedRef.current = true
    }
  }, [map, vehicles])

  return null
}

/**
 * Enhanced Live Tracking Map with dynamic centering and smooth animations
 */
export default function EnhancedLiveTrackingMap({
  vehicles = [],
  selectedVehicle = null,
  onVehicleSelect = () => {},
  mapHeight = 'h-screen',
  loading = false,
}) {
  const [defaultCenter, setDefaultCenter] = useState([28.6139, 77.2090]) // Delhi fallback

  // Get user's current location as secondary fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log('📍 User location detected:', latitude, longitude)
          setDefaultCenter([latitude, longitude])
        },
        (error) => {
          console.log('📍 Using Delhi as fallback location')
          // Keep Delhi as fallback
        }
      )
    }
  }, [])

  // Filter vehicles with valid coordinates
  const vehiclesWithLocations = vehicles.filter(
    v => isFinite(parseFloat(v.currentLocation?.latitude)) && 
         isFinite(parseFloat(v.currentLocation?.longitude))
  )

  return (
    <div className="relative w-full h-full" style={{ background: '#0f1117', overflow: 'hidden' }}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[400]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading vehicles...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ background: '#f0ebe3' }}
      >
        {/* Light colorful map tiles - OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          maxZoom={19}
        />

        {/* Premium Zoom Control */}
        <ZoomControl position="topright" />

        {/* Map Controller for dynamic centering */}
        <MapController selectedVehicle={selectedVehicle} vehicles={vehiclesWithLocations} />

        {/* Vehicle markers */}
        {vehiclesWithLocations.map(vehicle => {
          const lat = parseFloat(vehicle.currentLocation.latitude)
          const lng = parseFloat(vehicle.currentLocation.longitude)
          
          return (
            <Marker
              key={vehicle.bookingId || vehicle._id}
              position={[lat, lng]}
              icon={carIcon}
              eventHandlers={{
                click: () => onVehicleSelect(vehicle),
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-3 text-sm space-y-2">
                  <div>
                    <p className="font-bold text-gray-900">
                      {vehicle.vehicleName || 'Vehicle'}
                    </p>
                    <p className="text-gray-600 font-mono text-xs">
                      {vehicle.registrationNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      {vehicle.customerName || 'Unknown Customer'}
                    </p>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-600">
                      Status: <span className={`font-bold ${
                        vehicle.currentLocation?.status === 'live'
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {vehicle.currentLocation?.status === 'live' ? '🟢 Active' : '⚪ Idle'}
                      </span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* No Vehicles Message */}
      {!loading && vehiclesWithLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[300]">
          <div className="text-center bg-gray-900/80 backdrop-blur px-6 py-8 rounded-2xl shadow-2xl border border-gray-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-100 font-semibold">No active vehicles to display</p>
            <p className="text-gray-400 text-sm mt-2">
              Vehicles will appear here when they are actively tracked
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

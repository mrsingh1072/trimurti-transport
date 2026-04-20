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

/**
 * Helper function to extract coordinates from vehicle data
 * Supports multiple field name formats: latitude/longitude or lat/lng
 * Also checks nested currentLocation object
 */
const extractCoordinates = (vehicle) => {
  if (!vehicle) return null

  let lat = null
  let lng = null

  // Try direct fields first: latitude/longitude (most common)
  lat = vehicle.latitude !== undefined ? vehicle.latitude : vehicle.lat
  lng = vehicle.longitude !== undefined ? vehicle.longitude : vehicle.lng

  // If not found, try nested currentLocation
  if (lat === undefined || lat === null) {
    lat = vehicle.currentLocation?.latitude !== undefined 
      ? vehicle.currentLocation.latitude 
      : vehicle.currentLocation?.lat
  }
  if (lng === undefined || lng === null) {
    lng = vehicle.currentLocation?.longitude !== undefined 
      ? vehicle.currentLocation.longitude 
      : vehicle.currentLocation?.lng
  }

  // Convert to numbers
  const latNum = Number(lat)
  const lngNum = Number(lng)

  // Validate
  if (isNaN(latNum) || isNaN(lngNum)) {
    console.warn('🚨 [MARKER] Invalid coordinates for vehicle:', {
      vehicleId: vehicle._id || vehicle.bookingId,
      vehicleName: vehicle.vehicleName,
      originalLat: lat,
      originalLng: lng,
      convertedLat: latNum,
      convertedLng: lngNum
    })
    return null
  }

  console.log('✅ [MARKER] Valid coordinates extracted:', {
    vehicleName: vehicle.vehicleName,
    lat: latNum,
    lng: lngNum
  })

  return { lat: latNum, lng: lngNum }
}

// Custom car icon - Green for Active, Yellow for Waiting
const createVehicleIcon = (status = 'active') => {
  const color = status === 'waiting' ? '#FEC34D' : '#22C55E' // Yellow for waiting, Green for active
  
  // Create SVG with proper color substitution
  const svgString = `
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="26" r="24" fill="${color}" opacity="0.2"/>
      <circle cx="26" cy="26" r="18" fill="${color}"/>
      <path d="M16 20H22C22.5523 20 23 20.4477 23 21V26C23 26.5523 22.5523 27 22 27H16C15.4477 27 15 26.5523 15 26V21C15 20.4477 15.4477 20 16 20Z" fill="white" fill-opacity="0.9"/>
      <path d="M26 20H32C32.5523 20 33 20.4477 33 21V26C33 26.5523 32.5523 27 32 27H26C25.4477 27 25 26.5523 25 26V21C25 20.4477 25.4477 20 26 20Z" fill="white" fill-opacity="0.9"/>
    </svg>
  `
  
  const base64 = btoa(svgString)
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${base64}`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -26],
    shadowUrl: undefined,
  })
}

// Create vehicle icons
const activeVehicleIcon = createVehicleIcon('active')
const waitingVehicleIcon = createVehicleIcon('waiting')

/**
 * Map controller component to handle map interactions and auto-centering
 */
function MapController({ selectedVehicle, vehicles }) {
  const map = useMap()
  const hasMovedRef = useRef(false)

  // Handle selected vehicle - zoom and pan to it
  useEffect(() => {
    if (!map || !selectedVehicle) return

    const coords = extractCoordinates(selectedVehicle)
    if (!coords) {
      console.warn('🗺️ [MAP] Cannot zoom to vehicle - no valid coordinates')
      return
    }

    console.log(`🎯 [MAP] Flying to selected vehicle: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
    map.flyTo([coords.lat, coords.lng], 15, { duration: 1 })
  }, [selectedVehicle, map])

  // Initial map center on first vehicle with valid coordinates or fallback location
  useEffect(() => {
    if (!map || hasMovedRef.current) return

    const vehiclesWithCoords = vehicles
      .map(v => ({ vehicle: v, coords: extractCoordinates(v) }))
      .filter(item => item.coords !== null)

    if (vehiclesWithCoords.length > 0) {
      const firstVehicle = vehiclesWithCoords[0]
      console.log(`📍 [MAP] Centering on first vehicle with coordinates: ${firstVehicle.coords.lat.toFixed(4)}, ${firstVehicle.coords.lng.toFixed(4)}`)
      map.setView([firstVehicle.coords.lat, firstVehicle.coords.lng], 13)
    } else {
      console.log('📍 [MAP] No vehicles with coordinates, using Delhi fallback')
      map.setView([28.6139, 77.2090], 12)
    }

    hasMovedRef.current = true
  }, [map, vehicles])

  return null
}

/**
 * Enhanced Live Tracking Map with Leaflet
 * - Renders markers for all active vehicles with valid coordinates
 * - Supports click-to-zoom from sidebar
 * - Uses custom vehicle icons with status indicators
 * - Auto-centers on first vehicle or fallback location
 */
export default function EnhancedLiveTrackingMap({
  vehicles = [],
  selectedVehicle = null,
  onVehicleSelect = () => {},
  mapHeight = 'h-screen',
  loading = false,
}) {
  const [defaultCenter, setDefaultCenter] = useState([28.6139, 77.2090]) // Delhi fallback
  const mapRef = useRef(null)

  // Get user's current location as secondary fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log('📍 [GEO] User location detected:', latitude, longitude)
          setDefaultCenter([latitude, longitude])
        },
        (error) => {
          console.log('📍 [GEO] Using Delhi as fallback location')
        }
      )
    }
  }, [])

  // Extract vehicles with valid coordinates
  const vehiclesWithLocations = vehicles
    .map(v => ({
      vehicle: v,
      coords: extractCoordinates(v)
    }))
    .filter(item => item.coords !== null)

  console.log(`🗺️ [MAP] Rendering with ${vehiclesWithLocations.length} vehicles (out of ${vehicles.length} total)`)

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
        ref={mapRef}
        center={defaultCenter}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ background: '#f0ebe3' }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          maxZoom={19}
        />

        {/* Zoom Control */}
        <ZoomControl position="topright" />

        {/* Map Controller for dynamic centering and interactions */}
        <MapController selectedVehicle={selectedVehicle} vehicles={vehicles} />

        {/* Render markers for all vehicles with valid coordinates */}
        {vehiclesWithLocations.map(({ vehicle, coords }) => {
          const status = vehicle.status || vehicle.currentLocation?.status || 'active'
          const icon = status === 'waiting' ? waitingVehicleIcon : activeVehicleIcon

          return (
            <Marker
              key={vehicle.bookingId || vehicle._id}
              position={[coords.lat, coords.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  console.log('👆 [MARKER] Clicked on vehicle:', vehicle.vehicleName)
                  onVehicleSelect(vehicle)
                },
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-3 text-sm space-y-2">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-base">
                      {vehicle.vehicleName || vehicle.vehicle?.model || 'Vehicle'}
                    </p>
                    <p className="text-gray-600 font-mono text-xs">
                      {vehicle.registrationNumber || vehicle.vehicle?.registrationNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="font-semibold text-gray-900">
                      👤 {vehicle.customerName || vehicle.driverName || 'Unknown'}
                    </p>
                    {vehicle.userName && (
                      <p className="text-xs text-gray-600">
                        Driver: {vehicle.userName}
                      </p>
                    )}
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-gray-600">
                      Status: <span className={`font-bold ${
                        status === 'active' || status === 'live'
                          ? 'text-green-600'
                          : status === 'waiting'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`}>
                        {status === 'active' || status === 'live' ? '🟢 Active' : status === 'waiting' ? '🟡 Waiting' : '⚪ Idle'}
                      </span>
                    </p>
                    {vehicle.currentSpeed !== undefined && (
                      <p className="text-gray-600">
                        Speed: <span className="font-semibold">{vehicle.currentSpeed?.toFixed(1)} km/h</span>
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t text-xs text-gray-500">
                    <p>📍 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* No Vehicles Message */}
      {!loading && vehiclesWithLocations.length === 0 && vehicles.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[300]">
          <div className="text-center bg-gray-900/80 backdrop-blur px-6 py-8 rounded-2xl shadow-2xl border border-gray-700">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-100 font-semibold">Waiting for GPS Data</p>
            <p className="text-gray-400 text-sm mt-2">
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} tracked but location updates pending
            </p>
          </div>
        </div>
      )}

      {/* No Active Vehicles Message */}
      {!loading && vehicles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[300]">
          <div className="text-center bg-gray-900/80 backdrop-blur px-6 py-8 rounded-2xl shadow-2xl border border-gray-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-100 font-semibold">No Active Vehicles</p>
            <p className="text-gray-400 text-sm mt-2">
              Vehicles will appear here when actively tracked
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

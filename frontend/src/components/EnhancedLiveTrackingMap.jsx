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
    if (!map) {
      console.log('🗺️ [MAP] Map not initialized yet')
      return
    }

    if (!selectedVehicle) {
      console.log('🗺️ [MAP] No selectedVehicle provided')
      return
    }

    const coords = extractCoordinates(selectedVehicle)
    if (!coords) {
      console.warn('🗺️ [MAP] Cannot zoom to vehicle - no valid coordinates', {
        name: selectedVehicle?.vehicleName,
        lat: selectedVehicle?.latitude,
        lon: selectedVehicle?.longitude
      })
      return
    }

    console.log(`🎯 [MAP] Flying to selected vehicle: ${selectedVehicle?.vehicleName} at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
    
    // Try flyTo first
    try {
      map.flyTo([coords.lat, coords.lng], 15, { duration: 1 })
      console.log('✅ [MAP] flyTo executed successfully')
    } catch (err) {
      console.error('❌ [MAP] flyTo failed, falling back to setView:', err)
      // Fallback to setView
      map.setView([coords.lat, coords.lng], 15)
    }
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
 * Individual Marker component that handles popup opening
 */
function VehicleMarker({ vehicle, coords, icon, onVehicleSelect, isSelected }) {
  const markerRef = useRef(null)

  // Open popup when this marker is selected
  useEffect(() => {
    if (isSelected && markerRef.current) {
      try {
        markerRef.current.openPopup()
        console.log(`📍 [MARKER] Opened popup for ${vehicle.vehicleName}`)
      } catch (err) {
        console.log('📍 [MARKER] Popup already closed or marker removed')
      }
    }
  }, [isSelected, vehicle.vehicleName])

  return (
    <Marker
      ref={markerRef}
      position={[coords.lat, coords.lng]}
      icon={icon}
      eventHandlers={{
        click: () => {
          console.log('👆 [MARKER] Clicked on vehicle:', vehicle.vehicleName)
          onVehicleSelect(vehicle)
        },
      }}
    >
      <Popup className="custom-popup vehicle-popup" maxWidth={320} minWidth={300}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 rounded-lg p-4 space-y-3 shadow-2xl border border-slate-700/50">
          {/* Vehicle Header */}
          <div className="space-y-1.5">
            <p className="font-bold text-white text-base leading-tight">
              {vehicle.vehicleName || vehicle.vehicle?.model || 'Vehicle'}
            </p>
            <p className="text-slate-300 font-mono text-xs bg-slate-900/50 px-2 py-1 rounded inline-block">
              {vehicle.registrationNumber || vehicle.vehicle?.registrationNumber || 'N/A'}
            </p>
          </div>

          {/* Customer & Booking Info */}
          <div className="border-t border-slate-700/50 pt-2 space-y-1.5">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Customer</p>
              <p className="font-semibold text-white text-sm">
                {vehicle.customerName || vehicle.driverName || 'Unknown'}
              </p>
            </div>
            {vehicle.bookingType && (
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Booking Type</p>
                <p className="text-emerald-400 font-semibold text-sm capitalize">{vehicle.bookingType}</p>
              </div>
            )}
          </div>

          {/* Status & Speed */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
              <p className="text-slate-400 text-xs font-semibold mb-1">Status</p>
              <p className="font-bold text-sm text-emerald-400">🟢 Active</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
              <p className="text-slate-400 text-xs font-semibold mb-1">Speed</p>
              <p className="font-bold text-emerald-400 text-sm">
                {vehicle.currentSpeed !== undefined ? `${vehicle.currentSpeed?.toFixed(1)} km/h` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Location & Last Update */}
          <div className="border-t border-slate-700/50 pt-2 space-y-2">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Location</p>
              <p className="text-slate-300 font-mono text-xs break-all">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            </div>
            {vehicle.lastUpdate && (
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Last Updated</p>
                <p className="text-emerald-400 text-xs font-semibold">
                  {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Open Booking Button */}
          <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2 px-3 rounded-lg transition-all shadow-lg text-sm mt-1">
            Open Booking
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

/**
 * MapInstanceProvider - Helper to expose map instance to parent
 */
function MapInstanceProvider({ onMapReady }) {
  const map = useMap()
  
  useEffect(() => {
    console.log('🗺️ [MapInstanceProvider] useEffect triggered')
    console.log('   map exists:', !!map)
    console.log('   onMapReady exists:', !!onMapReady)
    
    if (map && onMapReady) {
      console.log('🗺️ [MapInstanceProvider] Calling onMapReady callback with map instance')
      onMapReady(map)
      console.log('🗺️ [MAP] Map instance provided to parent')
    } else if (map) {
      console.warn('⚠️ [MapInstanceProvider] onMapReady callback not provided!')
    } else {
      console.log('🔵 [MapInstanceProvider] Map not ready yet (waiting for MapContainer render)')
    }
  }, [map, onMapReady])
  
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
  onMapReady = null,
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

  // Auto-resize map when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        console.log('🔄 [MAP] Window resize detected, calling invalidateSize')
        mapRef.current.invalidateSize()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
    <div
      id="tracking-map"
      className="tracking-map-wrapper"
      style={{
        width: '100%',
        height: '700px',
        minHeight: '700px',
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
        background: '#0f172a'
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[400]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading vehicles...</p>
          </div>
        </div>
      )}

      {/* Map Container - NUCLEAR FIX */}
      <MapContainer
        center={[16.4636, 80.5050]}
        zoom={14}
        scrollWheelZoom={true}
        style={{
          width: '100%',
          height: '100%'
        }}
        whenCreated={(map) => {
          console.log('🗺️ [NUCLEAR] Map instance created')
          mapRef.current = map
          console.log('   ✅ mapRef.current assigned')
          
          setTimeout(() => {
            console.log('🔄 [NUCLEAR] Calling invalidateSize at 500ms')
            map.invalidateSize()
            console.log('   ✅ invalidateSize() complete')
          }, 500)
          
          setTimeout(() => {
            console.log('🔄 [NUCLEAR] Forcing tile layer redraw at 800ms')
            map.eachLayer(layer => {
              if (layer.redraw) {
                layer.redraw()
                console.log('   ✅ Layer redrawn')
              }
            })
          }, 800)
          
          if (onMapReady) {
            onMapReady(map)
            console.log('   ✅ onMapReady callback called')
          }
        }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Zoom Control */}
        <ZoomControl position="topright" />

        {/* Map Instance Provider - expose map to parent component */}
        <MapInstanceProvider onMapReady={onMapReady} />

        {/* Map Controller for dynamic centering and interactions */}
        <MapController selectedVehicle={selectedVehicle} vehicles={vehicles} />

        {/* Vehicle Markers */}
        {vehiclesWithLocations.map((item) => {
          const vehicle = item.vehicle
          const coords = item.coords
          const icon = vehicle.status === 'waiting' ? waitingVehicleIcon : activeVehicleIcon
          
          return (
            <VehicleMarker
              key={vehicle._id || vehicle.id}
              vehicle={vehicle}
              coords={coords}
              icon={icon}
              onVehicleSelect={onVehicleSelect}
              isSelected={selectedVehicle?._id === vehicle._id}
            />
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


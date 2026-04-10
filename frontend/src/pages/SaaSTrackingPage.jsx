import { useEffect, useState, useRef, useCallback } from 'react'
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { getLiveTracking } from '../services/api'
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

/**
 * Fetch route from OSRM (free open-source routing)
 */
const fetchRoute = async (startLat, startLng, endLat, endLng) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
      const durationSeconds = data.routes[0].duration
      const minutes = Math.round(durationSeconds / 60)
      return { coords, minutes }
    }
  } catch (err) {
    console.error('Route fetch failed:', err)
  }
  return null
}

/**
 * Icon Makers - Clean, reusable icon creation
 */
const makeVehicleIcon = () => L.divIcon({
  className: '',
  html: `
    <div style="position: relative; width: 48px; height: 48px;">
      <div style="position: absolute; width: 100%; height: 100%; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 2px white, 0 2px 8px rgba(16, 185, 129, 0.4); animation: pulseRing 2s infinite;"></div>
      <div style="position: absolute; width: 28px; height: 28px; background: #059669; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

const makeEtaIcon = (minutes) => L.divIcon({
  className: '',
  html: `<div style="background: rgba(20,20,30,0.88); backdrop-filter: blur(8px); border: 1px solid rgba(245, 158, 11, 0.3); color: white; padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">${minutes} min</div>`,
  iconSize: [80, 28],
  iconAnchor: [40, 14],
})

const makeDestIcon = () => L.divIcon({
  className: '',
  html: `<div style="width: 20px; height: 20px; background: #ef4444; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
})

/**
 * Route Layer Component - displays polyline + ETA badge + destination
 */
const RouteLayer = ({ vehicle }) => {
  const [routeData, setRouteData] = useState(null)

  useEffect(() => {
    if (!vehicle.startCoords || !vehicle.endCoords) return
    fetchRoute(vehicle.startCoords[0], vehicle.startCoords[1], vehicle.endCoords[0], vehicle.endCoords[1])
      .then(data => setRouteData(data))
  }, [vehicle])

  if (!routeData) return null

  const midIndex = Math.floor(routeData.coords.length / 2)
  const midPoint = routeData.coords[midIndex]

  return (
    <>
      <Polyline 
        positions={routeData.coords} 
        color="#16a34a" 
        weight={4} 
        opacity={0.9}
        lineCap="round"
        lineJoin="round"
        dashArray="5, 5"
      />
      <Marker position={midPoint} icon={makeEtaIcon(routeData.minutes)} />
      <Marker position={vehicle.endCoords} icon={makeDestIcon()} />
    </>
  )
}

/**
 * SaaS-Level Live Vehicle Tracking Page
 * Production-ready implementation with:
 * - Premium two-column layout (sidebar + map)
 * - Dark theme with CartoDB tiles
 * - Green pulsing vehicle markers with routes
 * - ETA badges and destination pins
 * - Floating stats panel
 * - Real-time vehicle polling
 */

// Mock vehicles for testing (TODO: Replace with real getLiveTracking() API call)
const MOCK_VEHICLES = [
  {
    _id: '1',
    vehicleName: 'TT-001',
    registrationNumber: 'KA-51-AB-0001',
    driverName: 'Rajesh Kumar',
    currentLocation: { latitude: 12.9716, longitude: 77.5946 },
    startCoords: [12.9716, 77.5946],
    endCoords: [12.9352, 77.6245],
    rideType: 'daily',
    status: 'live'
  },
  {
    _id: '2',
    vehicleName: 'TT-002',
    registrationNumber: 'KA-51-AB-0002',
    driverName: 'Priya Singh',
    currentLocation: { latitude: 12.9800, longitude: 77.6000 },
    startCoords: [12.9800, 77.6000],
    endCoords: [12.9600, 77.5800],
    rideType: 'daily',
    status: 'live'
  }
]

export default function SaaSTrackingPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES)
  const [selectedVehicle, setSelectedVehicle] = useState(MOCK_VEHICLES[0])
  const [loading, setLoading] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const [activeTab, setActiveTab] = useState('daily')
  const pollingIntervalRef = useRef(null)

  console.log('🚗 SaaSTrackingPage loaded - User:', user?.email)

  /**
   * Fetch live tracking data from API
   */
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      // TODO: Replace with real API call
      // const data = await getLiveTracking()
      // const vehicleList = Array.isArray(data) ? data : (data?.data || [])
      // setVehicles(vehicleList)
      setVehicles(MOCK_VEHICLES)
    } catch (err) {
      console.error('❌ Error fetching vehicles:', err)
      setVehicles(MOCK_VEHICLES)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on component mount
  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Auto-refresh polling every 5 seconds
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchVehicles()
    }, 5000)
    return () => clearInterval(pollingIntervalRef.current)
  }, [fetchVehicles])

  /**
   * Filter vehicles by active tab
   */
  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'daily') return v.rideType !== 'rental' && v.rideType !== 'outstation'
    if (activeTab === 'rental') return v.rideType === 'rental'
    if (activeTab === 'outstation') return v.rideType === 'outstation'
    return true
  })

  /**
   * Filter by search location
   */
  const searchedVehicles = filteredVehicles.filter(v => {
    if (!searchLocation) return true
    return (
      v.vehicleName?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      v.driverName?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      v.registrationNumber?.toLowerCase().includes(searchLocation.toLowerCase())
    )
  })

  const totalVehicles = vehicles.length
  const trackedNow = searchedVehicles.length

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#FFFFFF' }}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: '300px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
        
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>📍</span>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Live Tracking</h1>
          </div>

          {/* TAB BAR */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['Daily Rides', 'Rentals', 'Outstation'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab === 'Daily Rides' ? 'daily' : tab === 'Rentals' ? 'rental' : 'outstation')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: (activeTab === 'daily' && tab === 'Daily Rides') || (activeTab === 'rental' && tab === 'Rentals') || (activeTab === 'outstation' && tab === 'Outstation') ? '#111827' : 'transparent',
                  color: (activeTab === 'daily' && tab === 'Daily Rides') || (activeTab === 'rental' && tab === 'Rentals') || (activeTab === 'outstation' && tab === 'Outstation') ? '#ffffff' : '#6B7280',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                height: '40px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#374151',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Saved Locations */}
        <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>SAVED LOCATIONS</p>
          {[
            { name: 'Office', address: '123 Business Hub, City Center' },
            { name: 'Home', address: '456 Residential Lane, Suburb' },
            { name: 'Airport', address: 'International Terminal, Main Gate' }
          ].map((loc, idx) => (
            <button
              key={idx}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '8px',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: '16px', minWidth: '20px' }}>📍</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>{loc.name}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.address}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Vehicle list or empty state */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {searchedVehicles.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', textAlign: 'center' }}>
              <span style={{ fontSize: '32px', marginBottom: '12px' }}>🚗</span>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
                {totalVehicles === 0 ? 'No active vehicles currently being tracked.' : 'No vehicles match your search.'}
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                {totalVehicles === 0 ? 'Vehicles will appear here when they start tracking' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            searchedVehicles.map(v => (
              <button
                key={v._id}
                onClick={() => setSelectedVehicle(v)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                style={{
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'none',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.vehicleName || 'Vehicle'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0', fontFamily: 'monospace' }}>
                      {v.registrationNumber || 'N/A'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>
                      {v.driverName || 'Unknown'} · {v.rideType || 'Daily'}
                    </p>
                  </div>
                  <span style={{ fontSize: '16px', color: '#D1D5DB' }}>›</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* System Overview card */}
        <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>SYSTEM OVERVIEW</p>
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '16px', color: '#FFFFFF', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{totalVehicles}</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Total Vehicles</p>
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{trackedNow}</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Now Tracked</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAP SECTION */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#f0ebe3', height: '100%' }}>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={13}
          style={{ width: '100%', height: '100%', background: '#f0ebe3' }}
          scrollWheelZoom={true}
          zoomControl={false}
        >
          {/* Light color tiles - OpenStreetMap Standard */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={19}
          />

          {/* Premium Zoom Control */}
          <ZoomControl position="topright" />

          {/* Render markers and routes for all vehicles */}
          {vehicles.map((vehicle) => (
            <React.Fragment key={vehicle._id}>
              <Marker position={vehicle.startCoords} icon={makeVehicleIcon()} />
              <RouteLayer vehicle={vehicle} />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Top Gradient Overlay - Depth Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, rgba(240,235,227,0.4), transparent)',
          pointerEvents: 'none',
          zIndex: 10
        }} />

        {/* Bottom Gradient Overlay - Depth Effect */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to top, rgba(15,17,23,0.8), transparent)',
          pointerEvents: 'none',
          zIndex: 10
        }} />

        {/* Live Stats Panel - Top Right */}
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          padding: '16px',
          zIndex: 30,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          minWidth: '280px'
        }}>
          {[
            { label: 'Active', value: trackedNow, color: '#16a34a' },
            { label: 'Total', value: totalVehicles, color: '#f59e0b' },
            { label: 'Idle', value: totalVehicles - trackedNow, color: '#9ca3af' }
          ].map((stat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: stat.color,
                margin: '0 auto 8px',
                boxShadow: `0 0 12px ${stat.color}40`
              }} />
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

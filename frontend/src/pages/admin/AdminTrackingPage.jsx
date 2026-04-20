import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getLiveTracking } from '../../services/api'
import EnhancedLiveTrackingMap from '../../components/EnhancedLiveTrackingMap'
import AdminLayout from '../../components/AdminLayout'
import { AlertCircle, Search, MapPin, ChevronRight, ChevronDown, Menu, X, Zap, Navigation, Home, AlertTriangle } from 'lucide-react'

/**
 * Admin Live Vehicle Tracking Page - Premium SaaS Dashboard
 * Uber Fleet / Logistics Dashboard Design with:
 * - Modern dark theme with glassmorphism
 * - Real-time system stats header
 * - Professional vehicle management sidebar
 * - Full-bleed interactive map
 * - Floating controls and animations
 * - Premium mobile-first responsive design
 */
export default function AdminTrackingPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchLocation, setSearchLocation] = useState('')
  const [refetching, setRefetching] = useState(false)
  const [activeTab, setActiveTab] = useState('daily')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('all')
  const [vehicleSortBy, setVehicleSortBy] = useState('active') // 'active', 'waiting', 'lastUpdated'
  const [showMapOnMobile, setShowMapOnMobile] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const autoSelectDoneRef = useRef(false)
  const pollingIntervalRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Calculate time since last update for real-time feel
  const getTimeSince = (timestamp) => {
    if (!timestamp) return 'just now'
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 5) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  // Location state removed - now using cleaner operational dashboard

  // Focus map on vehicle when selected - handled by MapController via selectedVehicle state
  const focusOnVehicle = useCallback((vehicle) => {
    // Simply select the vehicle - MapController will handle the map centering
    setSelectedVehicle(vehicle)
  }, [])



  const fetchVehicles = useCallback(async () => {
    try {
      if (!refetching) setLoading(true)
      setError(null)
      const data = await getLiveTracking()
      const vehicleList = Array.isArray(data) ? data : (data?.data || [])
      console.log('📍 Received vehicles:', vehicleList.length, 'total')
      
      setVehicles(vehicleList)
      lastUpdateRef.current = Date.now()
      
      if (!autoSelectDoneRef.current && vehicleList.length > 0) {
        const activeVehicle = vehicleList.find(v => 
          v && v.latitude !== null && v.longitude !== null
        ) || vehicleList[0]
        setSelectedVehicle(activeVehicle)
        autoSelectDoneRef.current = true
      }
    } catch (err) {
      console.error('❌ Error fetching vehicles:', err)
      setError('Failed to load tracking data. Please try again.')
      setVehicles([])
    } finally {
      setLoading(false)
      setRefetching(false)
    }
  }, [refetching])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => setRefetching(true), 5000)
    return () => clearInterval(pollingIntervalRef.current)
  }, [])

  useEffect(() => { if (refetching) fetchVehicles() }, [refetching, fetchVehicles])

  const handleVehicleSelect = useCallback((vehicle) => {
    console.log('🔵 [ADMIN] VIEW MAP CLICKED - Vehicle selected:', vehicle?.vehicleName)
    console.log('   LAT:', vehicle?.latitude, 'LNG:', vehicle?.longitude)
    console.log('   mapInstanceRef.current:', mapInstanceRef.current)
    console.log('   showMapOnMobile state:', showMapOnMobile)
    console.log('   mapContainerRef.current:', mapContainerRef.current)
    
    // Check if vehicle has valid coordinates
    if (!vehicle?.latitude || !vehicle?.longitude || vehicle.latitude === 0 || vehicle.longitude === 0) {
      console.warn('⚠️ [ADMIN] No valid coordinates for vehicle:', vehicle?.vehicleName)
      // Show user feedback
      setToastMessage(`⚠️ Live location unavailable for ${vehicle?.vehicleName || 'this vehicle'}`)
      setTimeout(() => setToastMessage(null), 4000)
      return
    }
    
    console.log('✅ [ADMIN] Valid coordinates confirmed. Setting state...')
    // Select the vehicle - this triggers MapController to center
    setSelectedVehicle(vehicle)
    
    // Show map on mobile when vehicle is selected + close sidebar
    setShowMapOnMobile(true)
    setMobileOpen(false)
    console.log('✅ [ADMIN] State updated: showMapOnMobile=true, mobileOpen=false')
    
    // Show toast notification
    setToastMessage(`📍 Viewing ${vehicle.vehicleName || 'Vehicle'} on map`)
    setTimeout(() => setToastMessage(null), 3000)
    
    // Scroll map container into viewport on desktop
    setTimeout(() => {
      console.log('⏱️ [ADMIN] Timeout 100ms - accessing map...')
      console.log('   mapContainerRef.current:', mapContainerRef.current)
      console.log('   mapInstanceRef.current:', mapInstanceRef.current)
      
      if (mapContainerRef.current) {
        console.log('✅ [ADMIN] Scrolling map container into view')
        mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        console.warn('⚠️ [ADMIN] mapContainerRef is null!')
      }
    }, 100)
    
    // Force Leaflet map refresh after slight delay for DOM to update
    setTimeout(() => {
      console.log('🔥 [NUCLEAR] Timeout 700ms - forcing map operations')
      
      if (mapInstanceRef.current) {
        try {
          const lat = vehicle.latitude
          const lng = vehicle.longitude
          const coords = [lat, lng]
          
          console.log(`   Calling invalidateSize(true) and setView to ${coords}`)
          mapInstanceRef.current.invalidateSize(true)
          mapInstanceRef.current.setView(coords, 16, {
            animate: true
          })
          console.log('   ✅ setView() called with animation')
        } catch (err) {
          console.error('❌ [NUCLEAR] Error:', err)
          console.error('   Error message:', err.message)
        }
      } else {
        console.warn('⚠️ [NUCLEAR] mapInstanceRef.current is null!')
      }
    }, 700)
    
    // Scroll to map on mobile/desktop
    setTimeout(() => {
      const mapElement = document.getElementById('tracking-map-container')
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        console.log('✅ [SCROLL] Scrolled to tracking-map-container')
      }
    }, 350)
    
    // Scroll vehicle into view if on Vehicles tab
    if (activeTab === 'vehicles') {
      setTimeout(() => {
        const vehicleCard = document.querySelector(`[data-vehicle-id="${vehicle._id || vehicle.bookingId}"]`)
        if (vehicleCard) {
          vehicleCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          vehicleCard.classList.add('ring-2', 'ring-emerald-500/50')
        }
      }, 100)
    }
    
    // FORCE map container to be visible and scrolled into view
    setTimeout(() => {
      console.log('🔥 [FORCE] Forcing map visibility and scroll at 300ms...')
      const mapContainer = document.getElementById('tracking-map-container')
      if (mapContainer) {
        const computed = window.getComputedStyle(mapContainer)
        console.log('   Map container display:', computed.display)
        console.log('   Map container height:', computed.height)
        console.log('   Map container width:', computed.width)
        console.log('   Map container visibility:', computed.visibility)
        // Force display
        mapContainer.style.display = 'flex !important'
        console.log('   ✅ Forced display: flex')
        // Force scroll
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' })
        console.log('   ✅ Called scrollIntoView')
        // Trigger map resize
        window.dispatchEvent(new Event('resize'))
        console.log('   ✅ Dispatched resize event')
      } else {
        console.warn('⚠️ [FORCE] Map container element not found!')
      }
    }, 300)
  }, [activeTab])

  // Simplified Status: Online (has coordinates) or Waiting (no coordinates)
  const getVehicleStatus = (v) => {
    if (v.latitude && v.longitude && v.latitude !== 0 && v.longitude !== 0) return 'online'
    return 'waiting'
  }

  const stats = {
    total: vehicles.length,
    online: vehicles.filter(v => getVehicleStatus(v) === 'online').length,
    waiting: vehicles.filter(v => getVehicleStatus(v) === 'waiting').length
  }

  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'daily') return v.rideType !== 'rental' && v.rideType !== 'outstation'
    if (activeTab === 'rental') return v.rideType === 'rental'
    if (activeTab === 'outstation') return v.rideType === 'outstation'
    if (activeTab === 'vehicles') return true
    return true
  })

  const searchedVehicles = filteredVehicles.filter(v => {
    if (!searchLocation) return true
    const name = v.vehicleName || ''
    const customer = v.customerName || ''
    const reg = v.registrationNumber || ''
    return name.toLowerCase().includes(searchLocation.toLowerCase()) ||
           customer.toLowerCase().includes(searchLocation.toLowerCase()) ||
           reg.toLowerCase().includes(searchLocation.toLowerCase())
  })

  // Vehicle list tab filtering and sorting
  const vehicleListData = (() => {
    let data = vehicles.slice() // All vehicles for Vehicles tab

    // Filter by search
    if (vehicleSearch) {
      data = data.filter(v =>
        (v.vehicleName || '').toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        (v.registrationNumber || '').toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        (v.customerName || '').toLowerCase().includes(vehicleSearch.toLowerCase())
      )
    }

    // Filter by status (only online/waiting)
    if (vehicleStatusFilter !== 'all') {
      data = data.filter(v => getVehicleStatus(v) === vehicleStatusFilter)
    }

    // Sort
    data.sort((a, b) => {
      if (vehicleSortBy === 'online') {
        const aOnline = getVehicleStatus(a) === 'online' ? 0 : 1
        const bOnline = getVehicleStatus(b) === 'online' ? 0 : 1
        return aOnline - bOnline
      } else if (vehicleSortBy === 'waiting') {
        const aWaiting = getVehicleStatus(a) === 'waiting' ? 0 : 1
        const bWaiting = getVehicleStatus(b) === 'waiting' ? 0 : 1
        return aWaiting - bWaiting
      } else if (vehicleSortBy === 'lastUpdated') {
        const aTime = new Date(a.lastUpdate || a.updatedAt || 0).getTime()
        const bTime = new Date(b.lastUpdate || b.updatedAt || 0).getTime()
        return bTime - aTime
      }
      return 0
    })

    return data
  })()

  const trackingContent = (
    <>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); } 50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.7); } }
        @keyframes float-up { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        @keyframes slide-in { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .pulse-ring::before { content: ''; position: absolute; border-radius: 50%; background: rgba(34, 197, 94, 0.3); animation: pulse-ring 2s ease-out infinite; }
        .bottom-sheet { animation: slideUp 0.3s ease-out; }
        .detail-card-popup { animation: popIn 0.3s ease-out; }
        .active-vehicle { animation: pulse-glow 2s ease-in-out infinite; }
        .vehicle-card-hover { transition: all 0.2s ease; }
        .vehicle-card-hover:hover { transform: translateY(-2px); }
        .stat-card { backdrop-filter: blur(10px); animation: fadeIn 0.5s ease-out; }
        @media (max-width: 768px) {
          .sidebar-desktop { position: fixed; left: 0; top: 0; bottom: 0; width: 100%; height: 100vh; z-index: 50; transform: translateX(-100%); transition: transform 0.3s ease-out; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); }
          .sidebar-desktop.open { transform: translateX(0); }
        }
      `}</style>

      <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
        {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

        {/* 3-COLUMN PREMIUM DASHBOARD LAYOUT */}
        <div className="flex-1 overflow-y-auto" style={{ display: 'grid', gridTemplateColumns: '420px 1fr 280px', gap: '20px', height: 'calc(100vh - 110px)', padding: '20px' }}>
          
          {/* LEFT PANEL: CONTROLS (420px) */}
          <div className="flex flex-col bg-gradient-to-br from-slate-800/80 to-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl" style={{ boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>
            
            {/* Header */}
            <div className="p-5 border-b border-slate-700/50 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-75 animate-pulse"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Fleet Tracking</h2>
                  <p className="text-xs text-emerald-400 font-semibold">Control Center</p>
                </div>
              </div>

              {/* Top Summary Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="stat-card bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-2.5 text-center" style={{ height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="text-2xl font-black text-emerald-400">{stats.online}</p>
                  <p className="text-xs text-emerald-300 font-semibold mt-1">Active</p>
                </div>
                <div className="stat-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-2.5 text-center" style={{ height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="text-2xl font-black text-yellow-400">{stats.waiting}</p>
                  <p className="text-xs text-yellow-300 font-semibold mt-1">Waiting</p>
                </div>
                <div className="stat-card bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-2.5 text-center" style={{ height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="text-2xl font-black text-cyan-400">{stats.total}</p>
                  <p className="text-xs text-cyan-300 font-semibold mt-1">Total</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search vehicles..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 bg-slate-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" style={{ height: '52px', borderRadius: '14px', fontSize: '16px' }} />
              </div>
            </div>

            {/* System Status Card */}
            <div className="p-5 border-b border-slate-700/50 space-y-4 flex-shrink-0" style={{ marginBottom: '18px' }}>
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 rounded-2xl p-5 border border-slate-700/50" style={{ background: 'linear-gradient(180deg,#16243a,#101b2d)', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>
                <p className="text-xs font-bold text-slate-400 tracking-widest mb-3">SYSTEM STATUS</p>
                
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-emerald-500/20">
                    <p className="text-2xl font-black text-emerald-400">{stats.online}</p>
                    <p className="text-emerald-300 font-semibold mt-1">Online</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-yellow-500/20">
                    <p className="text-2xl font-black text-yellow-400">{stats.waiting}</p>
                    <p className="text-yellow-300 font-semibold mt-1">Waiting</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-cyan-500/20">
                    <p className="text-2xl font-black text-cyan-400">{stats.total}</p>
                    <p className="text-cyan-300 font-semibold mt-1">Total</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Last sync {getTimeSince(lastUpdateRef.current)}
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="px-5 pb-5 flex-shrink-0">
              <div className="bg-slate-900/30 rounded-xl p-3 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <p className="text-xs font-semibold text-slate-300">Status</p>
                </div>
                <div className="text-xs text-slate-400 pl-6">
                  {vehicles.length > 0 ? <p>✅ All systems operational</p> : <p>⏳ Loading vehicles...</p>}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER PANEL: VEHICLE FLEET (1fr) */}
          <div className="flex flex-col bg-gradient-to-br from-slate-800/80 to-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl" style={{ boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>
            
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/30 sticky top-0 z-20" style={{ background: '#122038' }}>
              <h3 className="text-base font-black text-emerald-400 uppercase tracking-widest">📊 Live Fleet</h3>
              <p className="text-xs text-emerald-300/70 mt-1">{vehicleListData.length} vehicle{vehicleListData.length !== 1 ? 's' : ''} • {stats.online} active</p>
            </div>

            {/* Vehicle List */}
            <div className="flex-1 overflow-y-auto" style={{ paddingRight: '6px' }}>
              {loading && vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 px-6">
                  <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-lg animate-pulse opacity-75"></div>
                    <div className="relative w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm text-slate-400">Loading vehicles...</p>
                </div>
              ) : vehicleListData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 px-6">
                  <MapPin className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No vehicles to display</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {vehicleListData.map((vehicle, idx) => {
                    const status = getVehicleStatus(vehicle)
                    const isSelected = selectedVehicle?._id === vehicle._id
                    const statusConfig = {
                      online: { icon: '🟢', label: 'Online', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                      waiting: { icon: '🟡', label: 'Waiting', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
                    }
                    const config = statusConfig[status]

                    const name = vehicle.vehicleName || vehicle.name || 'Unknown Vehicle'
                    const reg = vehicle.registrationNumber || vehicle.regNumber || 'N/A'
                    const customer = vehicle.customerName || vehicle.passengerName || 'Not Assigned'
                    const bookingType = vehicle.bookingType || vehicle.rideType || 'N/A'
                    const speed = vehicle.currentSpeed || vehicle.speed || 0
                    const lat = vehicle.latitude || 0
                    const lon = vehicle.longitude || 0
                    const lastUpdate = vehicle.lastUpdate || vehicle.updatedAt || new Date().toISOString()
                    
                    return (
                      <div
                        key={vehicle._id || vehicle.bookingId || `vehicle-${idx}`}
                        className={`p-4 rounded-xl border transition-all cursor-pointer vehicle-card-hover ${isSelected ? `${config.bg} ${config.border} ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20` : 'bg-slate-900/30 border-slate-700/30 hover:bg-slate-900/50 hover:border-slate-600/50'}`}
                        style={{ borderRadius: '16px', marginBottom: '14px' }}
                      >
                        {/* Card Header */}
                        <div onClick={() => handleVehicleSelect(vehicle)} className="mb-3 pb-3 border-b border-slate-700/30">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-base">{name}</p>
                              <p className="text-xs text-slate-400 font-mono mt-1">{reg}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${config.color}`}>
                              {config.icon} {config.label}
                            </span>
                          </div>
                        </div>

                        {/* Details Grid - 2 columns */}
                        <div className="grid grid-cols-2 gap-3 text-xs mb-3 bg-slate-900/20 rounded-lg p-3 border border-slate-700/30">
                          <div>
                            <span className="text-slate-400">Registration</span>
                            <p className="text-slate-200 font-semibold mt-1">{reg}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Speed</span>
                            <p className="text-emerald-300 font-semibold mt-1">{speed.toFixed(1)} km/h</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Coordinates</span>
                            <p className="text-slate-300 font-mono text-xs mt-1">{lat.toFixed(4)}, {lon.toFixed(4)}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Last Update</span>
                            <p className="text-emerald-300 font-semibold mt-1">{getTimeSince(lastUpdate)}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVehicleSelect(vehicle)}
                            className="flex-1 px-3 py-2.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold rounded-lg border border-emerald-500/30 transition-all"
                            style={{ height: '46px', borderRadius: '12px' }}
                          >
                            📍 View Map
                          </button>
                          <button
                            onClick={() => focusOnVehicle(vehicle)}
                            className="flex-1 px-3 py-2.5 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold rounded-lg border border-cyan-500/30 transition-all"
                            style={{ height: '46px', borderRadius: '12px' }}
                          >
                            🎯 Focus
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: COMPACT STATS (280px) */}
          <div className="flex flex-col bg-gradient-to-br from-slate-800/80 to-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl p-5" style={{ background: 'linear-gradient(180deg,#15233b,#0f172a)', borderRadius: '18px', boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>
            
            <p className="text-xs font-bold text-slate-400 tracking-widest mb-4">SYSTEM STATUS</p>

            {/* Stats Widgets */}
            <div className="space-y-3">
              <div className="bg-slate-900/40 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-emerald-300 text-xs font-semibold mb-1">Total Fleet</p>
                <p className="text-2xl font-black text-white">{stats.total}</p>
              </div>
              
              <div className="bg-slate-900/40 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-emerald-300 text-xs font-semibold mb-1">Online</p>
                <p className="text-2xl font-black text-emerald-400">{stats.online}</p>
              </div>
              
              <div className="bg-slate-900/40 rounded-lg p-3 border border-yellow-500/20">
                <p className="text-yellow-300 text-xs font-semibold mb-1">Waiting</p>
                <p className="text-2xl font-black text-yellow-400">{stats.waiting}</p>
              </div>

              <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30 mt-4 pt-4 border-t border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-slate-300 font-semibold">Last Sync</p>
                </div>
                <p className="text-xs font-mono text-emerald-400">{getTimeSince(lastUpdateRef.current)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAP SECTION - FULL WIDTH BELOW (520px height) */}
        <div className="mx-5 mb-5 rounded-2xl overflow-hidden border border-slate-700/50" style={{ height: '520px', marginTop: '20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', boxShadow: '0 10px 24px rgba(0,0,0,.28)' }}>
          <div id="tracking-map-container" ref={mapContainerRef} className="relative w-full h-full" style={{ width: '100%', height: '100%' }}>
            {/* Map Component */}
            <EnhancedLiveTrackingMap 
              ref={mapInstanceRef}
              vehicles={vehicles} 
              selectedVehicle={selectedVehicle} 
              onVehicleSelect={handleVehicleSelect} 
              mapHeight="h-full" 
              loading={loading && !refetching}
              onMapReady={(mapInstance) => {
                console.log('🗺️ [MAP] Map ready callback')
                mapInstanceRef.current = mapInstance
              }}
            />

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-30">
              <button onClick={() => setRefetching(true)} className="group relative p-3 bg-slate-800/80 backdrop-blur-sm hover:bg-emerald-500/20 border border-slate-700/50 hover:border-emerald-500/50 rounded-lg shadow-lg transition-all">
                <Zap size={20} className={`text-slate-300 group-hover:text-emerald-400 ${refetching ? 'animate-spin' : ''}`} />
              </button>
              <button className="group p-3 bg-slate-800/80 backdrop-blur-sm hover:bg-emerald-500/20 border border-slate-700/50 hover:border-emerald-500/50 rounded-lg shadow-lg transition-all">
                <Home size={20} className="text-slate-300 group-hover:text-emerald-400" />
              </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 right-6 bg-slate-800/80 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 p-4 z-30">
              <p className="text-xs font-bold text-slate-300 mb-3 tracking-wider">LEGEND</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                  <span className="text-slate-300">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-300">Waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 bg-slate-800/90 backdrop-blur-md border border-emerald-500/50 text-emerald-300 px-6 py-3 rounded-lg shadow-2xl z-50 animate-in slide-in-from-top-2 fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    </>
  )

  return (
    <AdminLayout>
      {trackingContent}
    </AdminLayout>
  )
}

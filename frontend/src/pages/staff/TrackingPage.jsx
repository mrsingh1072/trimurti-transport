import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getLiveTracking } from '../../services/api'
import EnhancedLiveTrackingMap from '../../components/EnhancedLiveTrackingMap'
import StaffLayout from '../../components/StaffLayout'
import { AlertCircle, Search, MapPin, ChevronRight, ChevronDown, Menu, X, Zap, Navigation, Home, AlertTriangle } from 'lucide-react'

/**
 * Staff Live Vehicle Tracking Page - Premium SaaS Dashboard
 * Professional fleet tracking interface for staff with:
 * - Dark theme with glassmorphism  
 * - Real-time vehicle status monitoring
 * - Interactive fleet management
 * - Mobile-optimized responsive design
 */
export default function StaffTrackingPage() {
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
  const [vehicleSortBy, setVehicleSortBy] = useState('active')
  const autoSelectDoneRef = useRef(false)
  const pollingIntervalRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const mapContainerRef = useRef(null)

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
    console.log('🔵 [STAFF] Vehicle selected:', vehicle?.vehicleName, 'Coords:', vehicle?.latitude, vehicle?.longitude)
    
    // Check if vehicle has valid coordinates
    if (!vehicle?.latitude || !vehicle?.longitude || vehicle.latitude === 0 || vehicle.longitude === 0) {
      console.warn('⚠️ [STAFF] No valid coordinates for vehicle:', vehicle?.vehicleName)
      // Show user feedback
      const msg = `⚠️ Live location unavailable for ${vehicle?.vehicleName || 'this vehicle'}`
      console.log(msg)
      // In a real app, you'd show a toast notification here
      return
    }
    
    // Select the vehicle - this triggers MapController to center
    setSelectedVehicle(vehicle)
    
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
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); } 50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.7); } }
        @keyframes float-up { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        @keyframes slide-in { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.3), 0 0 15px rgba(34, 197, 94, 0.1); } 50% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.5), 0 0 25px rgba(34, 197, 94, 0.2); } }
        .stat-card { animation: float-up 3s ease-in-out infinite; }
        .vehicle-card-hover:hover { transform: translateY(-4px); }
        .map-container { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
        .detail-card-popup { animation: popIn 0.3s ease-out; }
        @media (max-width: 768px) {
          .sidebar-desktop { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; height: 100vh; z-index: 50; transform: translateX(-100%); transition: transform 0.3s ease-out; overflow-y: auto; }
          .sidebar-desktop.open { transform: translateX(0); }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      <div className="relative w-full h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

        {/* PREMIUM SIDEBAR */}
        <div className={`sidebar-desktop md:relative w-full md:w-[35%] h-full bg-slate-800/40 backdrop-blur-md border-r border-slate-700/50 flex flex-col z-40 overflow-hidden ${mobileOpen ? 'open' : ''}`}>
          
          {/* Header with Close Button */}
          <div className="p-6 border-b border-slate-700/50 flex-shrink-0 bg-gradient-to-b from-slate-700/30 to-transparent">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black text-white">Fleet Tracking</h1>
                  <p className="text-xs text-emerald-400 font-semibold">Real-time Dashboard</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="md:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-all">
                <X size={24} className="text-slate-300" />
              </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="stat-card bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-emerald-400">{stats.active}</p>
                <p className="text-xs text-emerald-300 font-semibold mt-1">🟢 Active</p>
              </div>
              <div className="stat-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-yellow-400">{stats.waiting}</p>
                <p className="text-xs text-yellow-300 font-semibold mt-1">🟡 Waiting</p>
              </div>
              <div className="stat-card bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-500/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-slate-300">{stats.total}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">📊 Total</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-slate-900/40 rounded-lg p-1 flex gap-1 border border-slate-700/50 flex-wrap">
              {[{ id: 'daily', label: 'Daily', icon: '🚕' }, { id: 'rental', label: 'Rental', icon: '📅' }, { id: 'outstation', label: 'Out', icon: '🛣️' }, { id: 'vehicles', label: 'Vehicles', icon: '🚗' }].map(tab => (
                <button key={tab.id} onClick={() => { console.log('📌 Tab clicked:', tab.id); setActiveTab(tab.id); }} className={`flex-1 px-2 py-2 text-xs font-semibold rounded transition-all duration-200 ${activeTab === tab.id ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search vehicles..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 bg-slate-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm" />
            </div>
          </div>

          {/* Operational Dashboard */}
          <div className="px-4 py-4 border-b border-slate-700/50 flex-shrink-0 space-y-4">
            {/* System Status Panel */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-lg p-4 border border-slate-700/50 space-y-3">
              <p className="text-xs font-bold text-slate-400 tracking-widest mb-3">⚙️ SYSTEM STATUS</p>
              
              {/* Status Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/40 rounded-lg p-3 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-emerald-400">{stats.online}</p>
                      <p className="text-xs text-emerald-300 font-semibold mt-1">🟢 Online</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-lg p-3 border border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-yellow-400">{stats.waiting}</p>
                      <p className="text-xs text-yellow-300 font-semibold mt-1">🟡 Waiting</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-lg p-3 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-cyan-400">{stats.total}</p>
                      <p className="text-xs text-cyan-300 font-semibold mt-1">📊 Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Sync & Alerts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/30 rounded-lg p-2.5 border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-slate-300 font-semibold">Last Sync</p>
                </div>
                <p className="text-xs font-mono text-emerald-400">{getTimeSince(lastUpdateRef.current)}</p>
              </div>

              {/* Recent Alerts */}
              <div className="bg-slate-900/30 rounded-lg p-2.5 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <p className="text-xs font-semibold text-slate-300">Alerts</p>
                </div>
                <div className="text-xs text-slate-400 pl-6">
                  {vehicles.length > 0 ? (
                    <p>All systems operational</p>
                  ) : (
                    <p>No active vehicles</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle List Tab Content */}
          {activeTab === 'vehicles' && (
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
              {/* Vehicles Tab Header with Filters */}
              <div className="px-4 py-3 border-b border-slate-700/50 space-y-3 bg-gradient-to-r from-slate-900/50 to-slate-900/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-400">🚗 Fleet Manager</h3>
                  <span className="text-xs bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-300 font-semibold">{vehicleListData.length} vehicle{vehicleListData.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search by name or plate..." value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 bg-slate-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={vehicleStatusFilter} onChange={(e) => setVehicleStatusFilter(e.target.value)} className="px-3 py-2 text-xs bg-slate-900/40 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all">
                    <option value="all">All Status</option>
                    <option value="online">🟢 Online</option>
                    <option value="waiting">🟡 Waiting</option>
                  </select>
                  <select value={vehicleSortBy} onChange={(e) => setVehicleSortBy(e.target.value)} className="px-3 py-2 text-xs bg-slate-900/40 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all">
                    <option value="online">Online First</option>
                    <option value="waiting">Waiting First</option>
                    <option value="lastUpdated">Recently Updated</option>
                  </select>
                </div>
              </div>
              
              {/* Vehicles List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {vehicles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 px-4">
                    <AlertTriangle className="w-10 h-10 text-slate-500 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No vehicles available</p>
                    <p className="text-xs text-slate-500 mt-1">Vehicles will appear here when data is available</p>
                  </div>
                ) : vehicleListData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 px-4">
                    <MapPin className="w-10 h-10 text-slate-500 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No vehicles match your filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {vehicleListData.map((vehicle, idx) => {
                      const status = getVehicleStatus(vehicle)
                      const isSelected = selectedVehicle?._id === vehicle._id
                      const statusConfig = {
                        online: { icon: '🟢', label: 'Online', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                        waiting: { icon: '🟡', label: 'Waiting', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
                      }
                      const config = statusConfig[status]

                      // Robust property access
                      const name = vehicle.vehicleName || vehicle.name || 'Unknown Vehicle'
                      const model = vehicle.vehicleModel || vehicle.model || ''
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
                          data-vehicle-id={vehicle._id || vehicle.bookingId}
                          className={`p-3.5 rounded-lg border transition-all duration-200 ${isSelected ? `${config.bg} ${config.border} ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20 animate-pulse` : 'bg-slate-900/30 border-slate-700/30 hover:bg-slate-900/50 hover:border-slate-600/50'} cursor-pointer`}
                        >
                          {/* Header */}
                          <div onClick={() => handleVehicleSelect(vehicle)} className="mb-2 pb-2 border-b border-slate-700/30">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm truncate">{name}</p>
                                {model && <p className="text-xs text-slate-400 mt-0.5">{model}</p>}
                              </div>
                              <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${config.color}`}>
                                {config.icon} {config.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono">{reg}</p>
                          </div>

                          {/* Details */}
                          <div className="text-xs space-y-1.5 bg-slate-900/20 rounded p-2.5 mb-3 border border-slate-700/30">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Customer:</span>
                              <span className="text-slate-200 font-semibold">{customer}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Booking:</span>
                              <span className="text-emerald-300 font-semibold capitalize">{bookingType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Speed:</span>
                              <span className="text-emerald-300 font-semibold">{speed.toFixed(1)} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Location:</span>
                              <span className="text-slate-300 font-mono text-xs">{lat.toFixed(4)}, {lon.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Updated:</span>
                              <span className="text-emerald-300 font-semibold">{getTimeSince(lastUpdate)}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVehicleSelect(vehicle)}
                              className="flex-1 px-2 py-2 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold rounded border border-emerald-500/30 transition-all"
                            >
                              📍 View Map
                            </button>
                            <button
                              onClick={() => handleVehicleSelect(vehicle)}
                              className="flex-1 px-2 py-2 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold rounded border border-cyan-500/30 transition-all"
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
          )}

          {activeTab !== 'vehicles' && (
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {error && (
              <div className="p-4 m-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-300">Error</p>
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 px-4">
                <div className="relative w-12 h-12 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-lg animate-pulse opacity-75"></div>
                  <div className="relative w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-slate-400">Loading fleet...</p>
              </div>
            ) : searchedVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 px-4">
                <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-3 border border-slate-700/50">
                  <MapPin className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-300 text-center">
                  {vehicles.length === 0 ? 'No active vehicles tracking.' : 'No matches found.'}
                </p>
              </div>
            ) : (
              <div className="p-0 space-y-0 w-full">
                {/* Live Fleet Header */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/30 sticky top-0 z-10">
                  <p className="text-xs font-black text-emerald-400 tracking-widest">🚗 LIVE FLEET</p>
                  <p className="text-xs text-emerald-300/70 mt-0.5">{searchedVehicles.length} vehicle{searchedVehicles.length !== 1 ? 's' : ''} • {stats.active} active</p>
                </div>
                {searchedVehicles.map((vehicle, index) => {
                  const statusConfig = {
                    waiting: { icon: '🟡', label: 'Waiting', color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
                    active: { icon: '🟢', label: 'Active', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                    completed: { icon: '🔵', label: 'Completed', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' }
                  }
                  const status = vehicle.status || 'waiting'
                  const config = statusConfig[status] || statusConfig.waiting
                  const isSelected = selectedVehicle?.bookingId === vehicle.bookingId || selectedVehicle?._id === vehicle._id
                  
                  return (
                    <div key={vehicle.bookingId || vehicle._id}>
                      {/* Vehicle Card Header */}
                      <button onClick={() => { handleVehicleSelect(vehicle); setMobileOpen(false); }} className={`w-full p-3 rounded-lg text-left transition-all border vehicle-card-hover ${isSelected ? `bg-gradient-to-r ${config.color} ${config.border} shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/50` : `bg-slate-900/30 border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-900/50`}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-lg">{config.icon}</span>
                              <p className="font-bold text-white text-sm truncate">{vehicle.vehicleName || 'Vehicle'}</p>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mb-2">{vehicle.registrationNumber || 'N/A'}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-300">👤 {vehicle.customerName || 'Unknown'}</p>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-slate-900/40 ${config.text}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                          {isSelected && <ChevronDown size={18} className="text-emerald-400 mt-1 flex-shrink-0" />}
                        </div>
                      </button>

                      {/* Expanded Details - Accordion */}
                      {isSelected && (
                        <div className="mt-0 ml-0 mr-0 p-5 rounded-none bg-slate-800/60 border-t-2 border-l-2 border-r-2 border-b-2 border-emerald-500 animate-in slide-in-from-top-2 duration-200 min-h-[320px] w-full overflow-visible box-border" style={{border: '3px solid red'}}>
                          {/* Header Section */}
                          <div className="pb-4 mb-4 border-b border-slate-600">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <p className="text-base font-bold text-white">{vehicle.vehicleName || 'Vehicle'}</p>
                                <p className="text-sm text-slate-300 mt-1.5">👤 {vehicle.customerName || 'Unknown'}</p>
                              </div>
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${config.text} bg-slate-900/40`}>
                                {config.label}
                              </span>
                            </div>
                          </div>

                          {/* Details Section */}
                          <div className="space-y-5">
                            <div>
                              <p className="text-xs text-slate-300 font-semibold mb-2 uppercase tracking-wider">Registration</p>
                              <p className="font-mono font-bold text-white text-sm">{vehicle.registrationNumber || 'N/A'}</p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-300 font-semibold mb-2 uppercase tracking-wider">Speed</p>
                              <p className="font-bold text-emerald-400 text-sm">{vehicle.currentSpeed?.toFixed(1) || '0'} km/h</p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-300 font-semibold mb-2 uppercase tracking-wider">Coordinates</p>
                              <p className="font-mono text-white text-xs">{vehicle.latitude?.toFixed(4) || 'N/A'}, {vehicle.longitude?.toFixed(4) || 'N/A'}</p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-300 font-semibold mb-2 uppercase tracking-wider">Last Update</p>
                              <p className="text-white text-xs font-semibold text-emerald-400">{getTimeSince(vehicle.lastUpdate)}</p>
                            </div>

                            {vehicle.driverName && (
                              <div>
                                <p className="text-xs text-slate-300 font-semibold mb-2 uppercase tracking-wider">Driver</p>
                                <p className="text-white text-sm font-semibold">{vehicle.driverName}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-5 mt-5 border-t border-slate-600">
                            <button className="flex-1 px-4 py-3 text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                              View Map
                            </button>
                            <button onClick={() => setSelectedVehicle(null)} className="flex-1 px-4 py-3 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-all">
                              Collapse
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          )}

          {/* Bottom System Stats */}
          <div className="p-4 border-t border-slate-700/50 flex-shrink-0 bg-gradient-to-t from-slate-900/50 to-transparent">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700/50 backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-400 mb-3 tracking-wider">SYSTEM STATUS</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/40 rounded p-2 border border-slate-700/30">
                  <p className="font-bold text-lg text-white">{stats.total}</p>
                  <p className="text-slate-400 mt-0.5">Total Fleet</p>
                </div>
                <div className="bg-slate-900/40 rounded p-2 border border-slate-700/30">
                  <p className="font-bold text-lg text-emerald-400">{stats.active}</p>
                  <p className="text-slate-400 mt-0.5">On Road</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Last sync {getTimeSince(lastUpdateRef.current)}
              </div>
            </div>
          </div>
        </div>

        {/* MAP CONTAINER - 65% width on desktop, always visible */}
        <div ref={mapContainerRef} className={`hidden md:flex flex-1 relative overflow-hidden map-container`}>
          {/* Mobile Toggle Button */}
          <button onClick={() => setMobileOpen(true)} className="absolute top-4 left-4 md:hidden z-40 p-3 bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg hover:bg-slate-700/80 transition-all border border-slate-700/50">
            <Menu size={24} className="text-slate-200" />
          </button>

          {/* Map Component */}
          <EnhancedLiveTrackingMap vehicles={vehicles} selectedVehicle={selectedVehicle} onVehicleSelect={handleVehicleSelect} mapHeight="h-full" loading={loading && !refetching} />

          {/* Floating Action Buttons */}
          <div className="absolute top-4 right-4 md:right-6 flex flex-col gap-3 z-30">
            {/* Refresh Button */}
            <button onClick={() => setRefetching(true)} className="group relative p-3 bg-slate-800/80 backdrop-blur-sm hover:bg-emerald-500/20 border border-slate-700/50 hover:border-emerald-500/50 rounded-lg shadow-lg transition-all duration-200">
              <Zap size={20} className={`text-slate-300 group-hover:text-emerald-400 transition-all ${refetching ? 'animate-spin' : ''}`} />
            </button>

            {/* Center Map Button */}
            <button className="group p-3 bg-slate-800/80 backdrop-blur-sm hover:bg-emerald-500/20 border border-slate-700/50 hover:border-emerald-500/50 rounded-lg shadow-lg transition-all duration-200">
              <Home size={20} className="text-slate-300 group-hover:text-emerald-400 transition-all" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-4 md:left-auto md:right-6 bg-slate-800/80 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 p-4 z-30">
            <p className="text-xs font-bold text-slate-300 mb-3 tracking-wider">MARKER LEGEND</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                <span className="text-slate-300">Active Vehicles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300">Waiting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                <span className="text-slate-300">Offline</span>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {refetching && (
            <div className="absolute top-20 md:top-4 left-1/2 transform -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-emerald-500/30 text-sm text-emerald-400 font-semibold z-30">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Syncing fleet data...
            </div>
          )}
        </div>


      </div>
    </>
  )

  return (
    <StaffLayout>
      {trackingContent}
    </StaffLayout>
  )
}

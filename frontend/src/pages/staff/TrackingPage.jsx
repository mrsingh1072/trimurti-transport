import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getLiveTracking } from '../../services/api'
import EnhancedLiveTrackingMap from '../../components/EnhancedLiveTrackingMap'
import StaffLayout from '../../components/StaffLayout'
import { AlertCircle, Search, MapPin, ChevronRight, ChevronDown, Menu, X, Zap, Navigation, Home, Plus, Edit, Trash2 } from 'lucide-react'

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

  const [savedLocations, setSavedLocations] = useState([
    { id: 1, name: 'Head Office', address: 'Trimurti Transport Main Office, City Center', icon: '🏢', lat: 28.6139, lng: 77.2090, status: 'active' },
    { id: 2, name: 'Vehicle Yard', address: 'Parking & Service Yard, Industrial Zone', icon: '🛻', lat: 28.5350, lng: 77.3910, status: 'active' },
    { id: 3, name: 'Pickup Point', address: 'Main Customer Pickup Zone, Downtown', icon: '🚌', lat: 28.6305, lng: 77.2295, status: 'active' },
    { id: 4, name: 'Airport Pickup', address: 'Airport Entry Gate Terminal', icon: '✈️', lat: 28.5562, lng: 77.1000, status: 'active' },
    { id: 5, name: 'Railway Station', address: 'Station Gate & Parking Area', icon: '🚉', lat: 28.6428, lng: 77.2197, status: 'active' },
    { id: 6, name: 'Hotel Delivery', address: 'Popular Hotels & Tourism Hub', icon: '🏨', lat: 28.6139, lng: 77.2300, status: 'active' }
  ])
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [newLocation, setNewLocation] = useState({ name: '', address: '', icon: '📍', lat: 28.6139, lng: 77.2090 })

  // Focus map on vehicle when selected
  const focusOnVehicle = useCallback((vehicle) => {
    if (vehicle && vehicle.latitude && vehicle.longitude) {
      if (mapContainerRef.current && mapContainerRef.current.querySelector('.leaflet-container')) {
        const map = mapContainerRef.current.leafletMap
        if (map) {
          map.setView([vehicle.latitude, vehicle.longitude], 16)
        }
      }
    }
  }, [])

  // Center map on location
  const centerMapOnLocation = useCallback((lat, lng) => {
    if (mapContainerRef.current && mapContainerRef.current.querySelector('.leaflet-container')) {
      const map = mapContainerRef.current.leafletMap
      if (map) {
        map.setView([lat, lng], 15)
      }
    }
  }, [])

  // Add new location
  const handleAddLocation = useCallback(() => {
    if (newLocation.name && newLocation.address) {
      const id = Math.max(...savedLocations.map(l => l.id || 0), 0) + 1
      setSavedLocations([...savedLocations, { ...newLocation, id, status: 'active' }])
      setNewLocation({ name: '', address: '', icon: '📍', lat: 28.6139, lng: 77.2090 })
      setShowAddLocation(false)
    }
  }, [newLocation, savedLocations])

  // Delete location
  const handleDeleteLocation = useCallback((id) => {
    setSavedLocations(savedLocations.filter(l => l.id !== id))
    setEditingLocation(null)
  }, [savedLocations])

  // Update location
  const handleUpdateLocation = useCallback(() => {
    if (editingLocation && editingLocation.name && editingLocation.address) {
      setSavedLocations(savedLocations.map(l => l.id === editingLocation.id ? editingLocation : l))
      setEditingLocation(null)
    }
  }, [editingLocation, savedLocations])

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
    setSelectedVehicle(vehicle)
    focusOnVehicle(vehicle)
  }, [focusOnVehicle])

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active' || (v.latitude && v.longitude)).length,
    waiting: vehicles.filter(v => v.status === 'waiting' || !v.latitude || !v.longitude).length,
    offline: vehicles.filter(v => v.status === 'offline').length
  }

  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'daily') return v.rideType !== 'rental' && v.rideType !== 'outstation'
    if (activeTab === 'rental') return v.rideType === 'rental'
    if (activeTab === 'outstation') return v.rideType === 'outstation'
    return true
  })

  const searchedVehicles = filteredVehicles.filter(v => {
    if (!searchLocation) return true
    return (
      v.vehicleName?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      v.customerName?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      v.registrationNumber?.toLowerCase().includes(searchLocation.toLowerCase())
    )
  })

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
        <div className={`sidebar-desktop md:relative w-full md:w-96 h-full bg-slate-800/40 backdrop-blur-md border-r border-slate-700/50 flex flex-col z-40 overflow-hidden ${mobileOpen ? 'open' : ''}`}>
          
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
            <div className="bg-slate-900/40 rounded-lg p-1 flex gap-1 border border-slate-700/50">
              {[{ id: 'daily', label: 'Daily', icon: '🚕' }, { id: 'rental', label: 'Rental', icon: '📅' }, { id: 'outstation', label: 'Out', icon: '🛣️' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-2 py-2 text-xs font-semibold rounded transition-all duration-200 ${activeTab === tab.id ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}>
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

          {/* Key Business Locations */}
          {!error && (
            <div className="px-4 py-3 border-b border-slate-700/50 flex-shrink-0 max-h-72 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-emerald-400 tracking-wider">📍 BUSINESS LOCATIONS</p>
                <button 
                  onClick={() => setShowAddLocation(!showAddLocation)}
                  className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-all text-emerald-400 hover:text-emerald-300"
                  title="Add location"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add Location Form */}
              {showAddLocation && (
                <div className="mb-3 p-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg space-y-2">
                  <input 
                    type="text" 
                    placeholder="Location name" 
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                    className="w-full px-2 py-1.5 text-xs bg-slate-900/30 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Address" 
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                    className="w-full px-2 py-1.5 text-xs bg-slate-900/30 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddLocation}
                      className="flex-1 px-2 py-1.5 text-xs bg-emerald-500/80 hover:bg-emerald-500 text-white font-semibold rounded transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setShowAddLocation(false)}
                      className="flex-1 px-2 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-semibold rounded transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Location Cards */}
              <div className="space-y-2">
                {savedLocations.map((loc) => (
                  <div 
                    key={loc.id}
                    className="group relative p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 border border-slate-700/30 hover:border-emerald-500/50 transition-all cursor-pointer"
                  >
                    {/* Status indicator */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${loc.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                    </div>

                    {/* Location info - clickable to center map */}
                    <button
                      onClick={() => centerMapOnLocation(loc.lat, loc.lng)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg flex-shrink-0">{loc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{loc.name}</p>
                          <p className="text-xs text-slate-400 truncate">{loc.address}</p>
                        </div>
                      </div>
                    </button>

                    {/* Admin controls */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingLocation(loc)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded transition-all"
                        title="Edit"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Location Modal */}
              {editingLocation && (
                <div className="mt-3 p-3 bg-slate-900/50 border border-blue-500/30 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-blue-400">Edit Location</p>
                  <input 
                    type="text" 
                    placeholder="Location name" 
                    value={editingLocation.name}
                    onChange={(e) => setEditingLocation({...editingLocation, name: e.target.value})}
                    className="w-full px-2 py-1.5 text-xs bg-slate-900/30 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Address" 
                    value={editingLocation.address}
                    onChange={(e) => setEditingLocation({...editingLocation, address: e.target.value})}
                    className="w-full px-2 py-1.5 text-xs bg-slate-900/30 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateLocation}
                      className="flex-1 px-2 py-1.5 text-xs bg-blue-500/80 hover:bg-blue-500 text-white font-semibold rounded transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingLocation(null)}
                      className="flex-1 px-2 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-semibold rounded transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vehicle List */}
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
              <div className="p-3 space-y-2">
                {searchedVehicles.map(vehicle => {
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
                        <div className="mt-2 ml-0 mr-0 p-4 rounded-lg bg-slate-900/40 border border-emerald-500/30 space-y-3 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                              <p className="text-xs text-slate-400 mb-1 font-semibold">Registration</p>
                              <p className="font-mono font-bold text-white text-sm">{vehicle.registrationNumber || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                              <p className="text-xs text-slate-400 mb-1 font-semibold">Speed</p>
                              <p className="font-bold text-emerald-400 text-sm">{vehicle.currentSpeed?.toFixed(1) || '0'} km/h</p>
                            </div>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1 font-semibold">Coordinates</p>
                            <p className="font-mono text-white text-xs">{vehicle.latitude?.toFixed(4) || 'N/A'}, {vehicle.longitude?.toFixed(4) || 'N/A'}</p>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1 font-semibold">Last Update</p>
                            <p className="text-white text-xs font-semibold text-emerald-400">{getTimeSince(vehicle.lastUpdate)}</p>
                          </div>

                          {vehicle.driverName && (
                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                              <p className="text-xs text-slate-400 mb-1 font-semibold">Driver</p>
                              <p className="text-white text-sm font-semibold">{vehicle.driverName}</p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <button className="flex-1 px-3 py-2 text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                              View Map
                            </button>
                            <button onClick={() => setSelectedVehicle(null)} className="flex-1 px-3 py-2 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-all">
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

        {/* MAP CONTAINER */}
        <div ref={mapContainerRef} className={`flex-1 relative overflow-hidden map-container ${mobileOpen ? '' : 'visible md:visible'}`}>
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

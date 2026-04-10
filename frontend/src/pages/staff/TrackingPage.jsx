import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getLiveTracking } from '../../services/api'
import EnhancedLiveTrackingMap from '../../components/EnhancedLiveTrackingMap'
import StaffLayout from '../../components/StaffLayout'
import { AlertCircle, Search, MapPin, ChevronRight, Menu, X } from 'lucide-react'

/**
 * Staff Live Vehicle Tracking Page - SaaS Grade UI
 * Premium design with:
 * - Professional sidebar with tabs, search, saved locations
 * - Full-bleed responsive map
 * - Vehicle detail bottom sheet
 * - Mobile responsive design
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

  const [savedLocations] = useState([
    { name: 'Office', address: '123 Business Hub, City Center' },
    { name: 'Home', address: '456 Residential Lane, Suburb' },
    { name: 'Airport', address: 'International Terminal, Main Gate' }
  ])

  const fetchVehicles = useCallback(async () => {
    try {
      if (!refetching) setLoading(true)
      setError(null)
      const data = await getLiveTracking()
      const vehicleList = Array.isArray(data) ? data : (data?.data || [])
      const validVehicles = vehicleList.filter(v =>
        v && v.currentLocation &&
        parseFloat(v.currentLocation.latitude) &&
        parseFloat(v.currentLocation.longitude)
      )
      setVehicles(validVehicles)
      if (!autoSelectDoneRef.current && validVehicles.length > 0) {
        setSelectedVehicle(validVehicles[0])
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
  }, [])

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
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .pulse-ring::before { content: ''; position: absolute; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: pulse-ring 1.5s ease-out infinite; }
        .bottom-sheet { animation: slideUp 0.3s ease-out; }
        @media (max-width: 768px) {
          .sidebar-desktop { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; height: 100vh; z-index: 50; transform: translateX(-100%); transition: transform 0.3s ease-out; }
          .sidebar-desktop.open { transform: translateX(0); }
        }
      `}</style>

      <div className="relative w-full h-screen flex bg-white overflow-hidden">
        {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

        {/* LEFT SIDEBAR */}
        <div className={`sidebar-desktop md:relative w-full md:w-80 h-full bg-white flex flex-col border-r border-gray-200 z-40 ${mobileOpen ? 'open' : ''}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">Live Tracking</h1>
              </div>
              <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-gray-100 rounded-2xl p-1 flex gap-1 mb-4">
              {[{ id: 'daily', label: 'Daily Rides' }, { id: 'rental', label: 'Rentals' }, { id: 'outstation', label: 'Outstation' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search vehicles..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white transition-all" />
            </div>
          </div>

          {/* Saved Locations */}
          {!error && (
            <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 mb-3 tracking-wider">SAVED LOCATIONS</p>
              <div className="space-y-2">
                {savedLocations.map((loc, idx) => (
                  <button key={idx} className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                        <p className="text-xs text-gray-600 truncate">{loc.address}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="p-4 mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Error</p>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-600">Loading vehicles...</p>
              </div>
            ) : searchedVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-800 text-center px-4">
                  {vehicles.length === 0 ? 'No active vehicles currently being tracked.' : 'No vehicles match your search.'}
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {searchedVehicles.map(vehicle => (
                  <button key={vehicle.bookingId || vehicle._id} onClick={() => { handleVehicleSelect(vehicle); setMobileOpen(false); }} className={`w-full p-3 rounded-xl text-left transition-all border-2 ${selectedVehicle?.bookingId === vehicle.bookingId || selectedVehicle?._id === vehicle._id ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${vehicle.currentLocation?.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                          <p className="font-bold text-gray-900 text-sm truncate">{vehicle.vehicleName || 'Vehicle'}</p>
                        </div>
                        <p className="text-xs text-gray-600 font-mono mb-1">{vehicle.registrationNumber || 'N/A'}</p>
                        <p className="text-xs text-gray-700">{vehicle.customerName || 'Unknown'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Promo */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="bg-black rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-500 tracking-widest mb-1">SPECIAL OFFER</p>
              <p className="text-sm font-bold text-white mb-3">Get 20% off on your next ride</p>
              <button className="w-full bg-white text-black font-bold py-2.5 rounded-lg text-xs hover:bg-gray-100 transition-all">
                CLAIM NOW
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT MAP */}
        <div className={`flex-1 relative overflow-hidden ${mobileOpen ? 'hidden md:block' : ''}`}>
          <button onClick={() => setMobileOpen(true)} className="absolute top-4 left-4 md:hidden z-40 p-2.5 bg-white rounded-lg shadow-md">
            <Menu size={24} className="text-gray-700" />
          </button>
          <EnhancedLiveTrackingMap vehicles={vehicles} selectedVehicle={selectedVehicle} onVehicleSelect={handleVehicleSelect} mapHeight="h-full" loading={loading && !refetching} />
          {refetching && (
            <div className="absolute bottom-6 left-4 md:left-80+8 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs text-gray-600">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              Updating...
            </div>
          )}
        </div>

        {/* BOTTOM SHEET */}
        {selectedVehicle && (
          <div className={`fixed bottom-0 left-0 right-0 md:left-80 bg-white rounded-t-3xl shadow-2xl z-50 bottom-sheet ${mobileOpen ? 'hidden md:block' : ''}`} style={{ height: '160px' }}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1 bg-gray-300 rounded-full"></div></div>
            <div className="px-6 py-4 flex items-center justify-between gap-4 h-full">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border-3 border-amber-300">
                  {selectedVehicle.driverName?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{selectedVehicle.driverName || 'Driver'}</p>
                  <p className="text-xs text-gray-600">{selectedVehicle.vehicleType || 'Four Wheeler'}</p>
                </div>
              </div>
              <div className="bg-gray-900 text-white px-4 py-2 rounded-lg flex-shrink-0 text-center">
                <p className="text-xs text-gray-400 mb-0.5">Plate</p>
                <p className="font-mono font-bold text-sm">{selectedVehicle.registrationNumber || 'N/A'}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg text-sm hover:shadow-lg hover:scale-105 transition-all">
                  COMPLETE
                </button>
                <button className="px-4 py-2 border-2 border-amber-500 text-amber-600 font-bold rounded-lg text-sm hover:bg-amber-50 transition-all">
                  REPORT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <StaffLayout>
      {trackingContent}
    </StaffLayout>
  )
}

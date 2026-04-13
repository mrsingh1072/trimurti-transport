import { Users, TrendingUp, DollarSign, Truck, Clock, Calendar, MessageCircle, Navigation, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import { getUserBookings, getLiveTracking } from '../services/api'

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    waiting: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: '🟡', label: 'Waiting for location' },
    active: { bg: 'bg-green-500/20', text: 'text-green-300', icon: '🟢', label: 'Tracking Active' },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: '🔵', label: 'Completed' }
  }
  const config = statusConfig[status] || statusConfig.waiting
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [liveVehicles, setLiveVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, tracking, bookings

  console.log('✅ DashboardPage is rendering for user:', user?.name, 'Role:', user?.role)

  useEffect(() => {
    fetchData()
    // Refresh live tracking every 5 seconds
    const interval = setInterval(fetchLiveTracking, 5000)
    return () => clearInterval(interval)
  }, [user?.role])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Always fetch personal bookings
      if (user?.role === 'customer') {
        const bookingsData = await getUserBookings()
        setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData?.bookings || [])
      }
      
      // For staff/admin, fetch live tracking data
      if (user?.role === 'staff' || user?.role === 'admin') {
        await fetchLiveTracking()
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveTracking = async () => {
    try {
      const data = await getLiveTracking()
      const vehicles = Array.isArray(data) ? data : (data?.data || [])
      console.log('📊 Live vehicles fetched:', vehicles.length, vehicles)
      setLiveVehicles(vehicles)
    } catch (error) {
      console.error('Failed to fetch live tracking:', error)
    }
  }

  const userName = user?.name || 'User'
  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin'
  
  // Calculate stats
  const activeBookings = bookings.filter(b => ['confirmed', 'ongoing'].includes(b.status?.toLowerCase())).length
  const completedBookings = bookings.filter(b => b.status?.toLowerCase() === 'completed').length
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  
  // Live tracking stats
  const activeVehicles = liveVehicles.filter(v => v.status === 'active').length
  const waitingVehicles = liveVehicles.filter(v => v.status === 'waiting').length
  const completedVehicles = liveVehicles.filter(v => v.status === 'completed').length

  return (
    <div className="min-h-screen bg-gray-950 pb-12">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2">
            <span className="gradient-text">Welcome back, {userName}!</span>
          </h1>
          <p className="text-gray-400">
            {isStaffOrAdmin ? 'Monitor active vehicle tracking and fleet status' : 'Here\'s your vehicle rental dashboard'}
          </p>
        </div>

        {/* Tabs for Admin/Staff */}
        {isStaffOrAdmin && (
          <div className="flex gap-4 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-3 font-semibold transition text-sm ${
                activeTab === 'tracking'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Navigation className="inline-block w-4 h-4 mr-2" />
              Live Tracking
            </button>
          </div>
        )}

        {/* Live Tracking View for Staff/Admin */}
        {isStaffOrAdmin && activeTab === 'tracking' && (
          <>
            {/* Live Tracking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Active Vehicles */}
              <Card className="p-6 group hover" glow>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/40 group-hover:to-emerald-500/40 transition">
                    <Navigation size={24} className="text-green-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300">Live</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">Tracking Active</p>
                <h2 className="text-4xl font-bold text-white">{activeVehicles}</h2>
                <p className="text-xs text-gray-500 mt-3">Vehicles with active locations</p>
              </Card>

              {/* Waiting for Location */}
              <Card className="p-6 group hover" glow>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 group-hover:from-yellow-500/40 group-hover:to-orange-500/40 transition">
                    <Clock size={24} className="text-yellow-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">Awaiting</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">Waiting for Location</p>
                <h2 className="text-4xl font-bold text-white">{waitingVehicles}</h2>
                <p className="text-xs text-gray-500 mt-3">First GPS update pending</p>
              </Card>

              {/* Total Tracked */}
              <Card className="p-6 group hover" glow>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition">
                    <Truck size={24} className="text-blue-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">Total</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">Total Tracked Vehicles</p>
                <h2 className="text-4xl font-bold text-white">{liveVehicles.length}</h2>
                <p className="text-xs text-gray-500 mt-3">With location sharing enabled</p>
              </Card>
            </div>

            {/* Live Vehicles List */}
            {liveVehicles.length > 0 ? (
              <Card className="p-8" glow>
                <div className="flex items-center gap-2 mb-6">
                  <Navigation className="w-6 h-6 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">Active Vehicle Tracking</h3>
                </div>
                
                <div className="space-y-3">
                  {liveVehicles.map((vehicle) => (
                    <div key={vehicle._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-white truncate">{vehicle.vehicleName}</p>
                          <StatusBadge status={vehicle.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 mt-2">
                          <p>👤 {vehicle.customerName}</p>
                          <p>📱 {vehicle.registrationNumber}</p>
                        </div>
                        {vehicle.latitude && vehicle.longitude && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {vehicle.lastUpdated && (
                          <p className="text-xs text-gray-400">
                            Updated: {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                          </p>
                        )}
                        {vehicle.status === 'active' && (
                          <div className="mt-2 w-3 h-3 rounded-full bg-green-500 animate-pulse mx-auto"></div>
                        )}
                        {vehicle.status === 'waiting' && (
                          <div className="mt-2 w-3 h-3 rounded-full bg-yellow-500 animate-pulse mx-auto"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/tracking')}
                  className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-glow-cyan transition font-medium"
                >
                  View Detailed Map
                </button>
              </Card>
            ) : (
              <Card className="p-8 text-center" glow>
                <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Tracking</h3>
                <p className="text-gray-400">No vehicles currently have location sharing enabled</p>
              </Card>
            )}
          </>
        )}

        {/* Customer View - Original Stats Cards */}
        {!isStaffOrAdmin && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Active Bookings */}
              <Card className="p-6 group hover" glow>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition">
                    <Calendar size={24} className="text-cyan-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">Active</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">Active Bookings</p>
                <h2 className="text-4xl font-bold text-white">{activeBookings}</h2>
                <p className="text-xs text-gray-500 mt-3">Ongoing or confirmed trips</p>
              </Card>

              {/* Completed Bookings */}
              <Card className="p-6 group hover" glow>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/40 group-hover:to-emerald-500/40 transition">
                    <Truck size={24} className="text-green-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300">Completed</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">Completed Bookings</p>
                <h2 className="text-4xl font-bold text-white">{completedBookings}</h2>
                <p className="text-xs text-gray-500 mt-3">Finished trips</p>
              </Card>

              {/* Total Spent */}
              <Card className="p-6 group hover" glow>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition">
                    <DollarSign size={24} className="text-purple-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">Total</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">Total Spent</p>
                <h2 className="text-4xl font-bold text-white">₹{totalSpent.toFixed(0)}</h2>
                <p className="text-xs text-gray-500 mt-3">Across all bookings</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <button 
                onClick={() => navigate('/vehicles')}
                className="group relative overflow-hidden rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 transition"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Browse Vehicles</h3>
                    <p className="text-gray-400">Explore our fleet of premium vehicles</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition">
                    <Truck size={28} className="text-cyan-400" />
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/my-bookings')}
                className="group relative overflow-hidden rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">My Bookings</h3>
                    <p className="text-gray-400">View and manage your bookings</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition">
                    <Calendar size={28} className="text-purple-400" />
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/feedback')}
                className="group relative overflow-hidden rounded-2xl p-8 border border-white/10 hover:border-yellow-500/50 transition"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Give Feedback</h3>
                    <p className="text-gray-400">Share your rental experience</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 group-hover:from-yellow-500/40 group-hover:to-orange-500/40 transition">
                    <MessageCircle size={28} className="text-yellow-400" />
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Bookings */}
            {!loading && bookings.length > 0 && (
              <Card className="p-8" glow>
                <h3 className="text-2xl font-bold text-white mb-6">Recent Bookings</h3>
                
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/10">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{booking.vehicle?.name || 'Vehicle'}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">₹{booking.totalPrice?.toFixed(2) || '0.00'}</p>
                        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mt-2 ${
                          booking.paymentStatus === 'paid' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {bookings.length > 3 && (
                  <button 
                    onClick={() => navigate('/my-bookings')}
                    className="w-full mt-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition font-medium"
                  >
                    View All Bookings
                  </button>
                )}
              </Card>
            )}

            {/* Empty State */}
            {!loading && bookings.length === 0 && (
              <Card className="p-8 text-center" glow>
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
                <p className="text-gray-400 mb-6">Start your journey by browsing our vehicle fleet</p>
                <button 
                  onClick={() => navigate('/vehicles')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-glow-cyan transition"
                >
                  Browse Vehicles
                </button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
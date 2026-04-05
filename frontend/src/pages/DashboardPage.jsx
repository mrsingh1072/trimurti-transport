import { Users, TrendingUp, DollarSign, Truck, Clock, Calendar, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import { getUserBookings } from '../services/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Confirm component is rendering
  console.log('✅ CustomerDashboardPage is rendering for user:', user?.name)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const data = await getUserBookings()
      setBookings(Array.isArray(data) ? data : data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const userName = user?.name || 'User'
  
  // Calculate stats
  const activeBookings = bookings.filter(b => ['confirmed', 'ongoing'].includes(b.status?.toLowerCase())).length
  const completedBookings = bookings.filter(b => b.status?.toLowerCase() === 'completed').length
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

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
          <p className="text-gray-400">Here's your vehicle rental dashboard</p>
        </div>

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
      </div>
    </div>
  )
}
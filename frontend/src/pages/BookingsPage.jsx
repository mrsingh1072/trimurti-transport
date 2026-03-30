import { useState, useEffect } from 'react'
import { Calendar, Plus, Filter, Search, Clock } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { getBookings } from '../services/api'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await getBookings()
      setBookings(Array.isArray(data) ? data : data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.vehicle?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || booking.status.toLowerCase() === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'ongoing':
        return 'bg-green-500/20 text-green-300'
      case 'completed':
        return 'bg-blue-500/20 text-blue-300'
      case 'cancelled':
        return 'bg-red-500/20 text-red-300'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    // TODO: Implement create booking API call
    console.log('Creating booking:', formData)
    setShowCreateForm(false)
    setFormData({ vehicleId: '', startDate: '', endDate: '' })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Bookings</span>
          </h1>
          <p className="text-gray-400">Manage all vehicle bookings and reservations</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-gradient px-6 py-3 rounded-xl text-white flex items-center gap-2 hover:shadow-glow-purple transition"
        >
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {/* Create Booking Form */}
      {showCreateForm && (
        <GlassCard className="p-8" glow>
          <h3 className="text-2xl font-bold text-white mb-6">Create New Booking</h3>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {/* Populate from vehicles list */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-gradient px-6 py-3 rounded-xl text-white hover:shadow-glow-purple transition"
              >
                Create Booking
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <GlassCard className="p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-8" glow>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Customer</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Vehicle</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Duration</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Amount</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Status</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-4 px-4 text-white">{booking.user?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-white">{booking.vehicle?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white font-medium">₹{booking.totalPrice?.toLocaleString() || 0}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-purple-400 hover:text-purple-300 transition text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {!loading && filteredBookings.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No bookings found</p>
        </GlassCard>
      )}
    </div>
  )
}

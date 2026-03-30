import { useEffect, useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import StaffLayout from '../../components/StaffLayout'
import { getBookings } from '../../services/api'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, selectedFilter, searchTerm])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await getBookings()
        const data = Array.isArray(res) ? res : (res?.bookings || res?.data || [])
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by status
    if (selectedFilter === 'active') {
      filtered = filtered.filter((b) => b.status === 'confirmed' || b.status === 'pending')
    } else if (selectedFilter === 'completed') {
      filtered = filtered.filter((b) => b.status === 'completed')
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.vehicle?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    }
    return badges[status] || 'bg-gray-500/20 text-gray-400'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Bookings</h2>
          <p className="text-gray-400">View and manage all customer bookings</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by user, vehicle, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Filter Dropdown */}
          <div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
            >
              <option value="all">All Bookings</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
          >
            <RotateCcw size={16} className="inline mr-2" />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
            No bookings found
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vehicle</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Check-in</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Check-out</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, idx) => {
                    const startDate = new Date(booking.startDate)
                    const endDate = new Date(booking.endDate)
                    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

                    return (
                      <tr
                        key={booking._id || idx}
                        className="border-b border-gray-700 hover:bg-gray-700/30 transition"
                      >
                        <td className="px-6 py-4 text-sm text-white">
                          <div>
                            <p className="font-medium">{booking.user?.name || 'N/A'}</p>
                            <p className="text-gray-400 text-xs">{booking.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {booking.vehicle?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDate(booking.startDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDate(booking.endDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{days} days</td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          ₹{booking.totalPrice?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && filteredBookings.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-400">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        )}
      </div>
    </StaffLayout>
  )
}

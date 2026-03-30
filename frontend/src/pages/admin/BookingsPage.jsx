import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getBookings } from '../../services/api'
import { Search, Eye, Trash2, MessageSquare } from 'lucide-react'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const res = await getBookings()
        // Handle both array and object response structures
        const data = Array.isArray(res) ? res : (res?.bookings || res?.data || [])
        const dataArray = Array.isArray(data) ? data : []
        setBookings(dataArray)
        setFilteredBookings(dataArray)
      } catch (err) {
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  useEffect(() => {
    let filtered = bookings

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }, [searchTerm, statusFilter, bookings])

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter(b => b._id !== id))
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'confirmed': 'bg-blue-500/20 text-blue-400',
      'completed': 'bg-green-500/20 text-green-400',
      'cancelled': 'bg-red-500/20 text-red-400',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN')
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Bookings Management</h2>
          <p className="text-gray-400">View and manage all vehicle bookings</p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by booking ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
            No bookings found
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Booking ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Vehicle</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Pickup Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Return Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking._id} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                      <td className="px-6 py-3 text-sm text-white font-medium">{booking.bookingId || 'N/A'}</td>
                      <td className="px-6 py-3 text-sm text-gray-300">{booking.customerName}</td>
                      <td className="px-6 py-3 text-sm text-gray-300">{booking.vehicleName || booking.vehicle}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">{formatDate(booking.pickupDate)}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">{formatDate(booking.returnDate)}</td>
                      <td className="px-6 py-3 text-sm text-white font-medium">₹{booking.totalPrice?.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-right space-x-2">
                        <button className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition">
                          <Eye size={16} />
                        </button>
                        <button className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded transition">
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-800/50 border border-gray-700 rounded p-4">
            <p className="text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{bookings.length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded p-4">
            <p className="text-gray-400">Confirmed</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded p-4">
            <p className="text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{bookings.filter(b => b.status === 'completed').length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded p-4">
            <p className="text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{bookings.filter(b => b.status === 'cancelled').length}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

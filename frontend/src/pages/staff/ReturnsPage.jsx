import { useEffect, useState } from 'react'
import { RefreshCw, RotateCcw } from 'lucide-react'
import StaffLayout from '../../components/StaffLayout'
import ReturnModal from '../../components/ReturnModal'
import { getBookings } from '../../services/api'

export default function ReturnsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchActiveBookings()
  }, [refreshKey])

  const fetchActiveBookings = async () => {
    try {
      setLoading(true)
      const res = await getBookings()
      // Handle both array and object response structures
      const data = Array.isArray(res) ? res : (res?.bookings || res?.data || [])
      const dataArray = Array.isArray(data) ? data : []
      
      // Filter only active bookings
      const activeBookings = dataArray.filter(
        (b) => b.status === 'confirmed' || b.status === 'pending'
      )
      
      setBookings(activeBookings)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load active bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessClick = (booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
    }
    return badges[status] || 'bg-gray-500/20 text-gray-400'
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Process Returns</h2>
            <p className="text-gray-400">Complete vehicle returns and collect fees</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-40 mb-3" />
                <div className="h-4 bg-gray-700 rounded w-60 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-48" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <RefreshCw size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No active bookings to process</p>
            <p className="text-gray-500 text-sm mt-2">All vehicles have been returned</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Booking Details */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {booking.vehicle?.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status?.charAt(0).toUpperCase() +
                            booking.status?.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Customer</p>
                          <p className="text-white">{booking.user?.name}</p>
                          <p className="text-gray-500 text-xs">{booking.user?.email}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs">Check-in</p>
                          <p className="text-white">{formatDate(booking.startDate)}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs">Expected Return</p>
                          <p className="text-white">{formatDate(booking.endDate)}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs">Rental Cost</p>
                          <p className="text-white font-bold">
                            ₹{booking.totalPrice?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Days overdue info */}
                    {new Date(booking.endDate) < new Date() && (
                      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                        <p className="text-red-400 text-sm font-medium">
                          ⚠️ Vehicle is{' '}
                          {Math.floor(
                            (new Date() - new Date(booking.endDate)) / (1000 * 60 * 60 * 24)
                          )}{' '}
                          days overdue
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleProcessClick(booking)}
                    className="ml-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition whitespace-nowrap"
                  >
                    Process Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {selectedBooking && (
        <ReturnModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedBooking(null)
          }}
          onSuccess={handleRefresh}
        />
      )}
    </StaffLayout>
  )
}

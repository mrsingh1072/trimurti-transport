import { useState, useEffect } from 'react'
import { Calendar, Truck, X, Edit2, Loader, AlertCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import EditBookingModal from '../components/EditBookingModal'
import { getUserBookings, cancelBooking } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MyBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [editingBooking, setEditingBooking] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await getUserBookings()
      setBookings(Array.isArray(data) ? data : data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setCancellingId(bookingId)
    setCancelError('')

    try {
      await cancelBooking(bookingId)
      setBookings(bookings.filter(b => b._id !== bookingId))
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const handleEditBooking = (booking) => {
    setEditingBooking(booking)
    setShowEditModal(true)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
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

  const canCancel = (booking) => {
    return ['confirmed', 'pending'].includes(booking.status.toLowerCase())
  }

  const canEdit = (booking) => {
    return ['confirmed', 'pending'].includes(booking.status.toLowerCase())
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 pb-16 px-4">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">My Bookings</span>
          </h1>
          <p className="text-gray-400">Manage your vehicle bookings and reservations</p>
        </div>

        {/* Error Message */}
        {cancelError && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm flex gap-3">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            {cancelError}
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <GlassCard key={booking._id} className="p-6" glow>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      {/* Booking Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-purple-500/20">
                            <Truck size={24} className="text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white truncate">{booking.vehicle?.name || 'Vehicle'}</h3>
                            <p className="text-gray-400 text-sm">{booking.vehicle?.category || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400 block">Check-in</span>
                            <span className="text-white font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Check-out</span>
                            <span className="text-white font-medium">{new Date(booking.endDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Duration</span>
                            <span className="text-white font-medium">
                              {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Total</span>
                            <span className="text-white font-bold">₹{booking.totalPrice?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                        <span className={`text-xs px-4 py-2 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>

                        <div className="flex gap-2 w-full md:w-auto">
                          {canEdit(booking) && (
                            <button
                              onClick={() => handleEditBooking(booking)}
                              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                          )}
                          {canCancel(booking) && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancellingId === booking._id}
                              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                            >
                              {cancellingId === booking._id ? (
                                <Loader size={16} className="animate-spin" />
                              ) : (
                                <X size={16} />
                              )}
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {booking.finalAmount && (
                      <div className="mt-4 pt-4 border-t border-white/10 text-sm">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <span className="text-gray-400">Late Fee</span>
                            <p className="text-white font-medium">₹{booking.lateFee?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Damage Fee</span>
                            <p className="text-white font-medium">₹{booking.damageFee?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Final Amount</span>
                            <p className="text-white font-bold">₹{booking.finalAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center" glow>
                <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">No bookings yet</p>
                <p className="text-gray-500 text-sm mt-2">Start your journey by booking a vehicle</p>
              </GlassCard>
            )}
          </>
        )}
      </div>

      {/* Edit Booking Modal */}
      {showEditModal && editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => {
            setShowEditModal(false)
            setEditingBooking(null)
          }}
          onUpdateSuccess={() => {
            setShowEditModal(false)
            setEditingBooking(null)
            fetchBookings()
          }}
        />
      )}
    </div>
  )
}

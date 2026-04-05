import { useState, useEffect } from 'react'
import { Calendar, Truck, FileText, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import PaymentDetailsModal from '../components/PaymentDetailsModal'
import Card from '../components/Card'
import { getUserBookings, getPaymentById } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function HistoryPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [loadingPaymentId, setLoadingPaymentId] = useState(null)

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

  const handleViewPaymentDetails = async (booking) => {
    if (!booking.paymentId) return

    setLoadingPaymentId(booking._id)
    try {
      const paymentData = await getPaymentById(booking.paymentId)
      setSelectedPayment(paymentData)
      setShowPaymentDetails(true)
    } catch (err) {
      console.error('Failed to load payment details:', err)
      alert('Could not load payment details')
    } finally {
      setLoadingPaymentId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'ongoing':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'pending':
        return 'bg-red-500/20 text-red-300 border border-red-500/30'
      case 'failed':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  const getPaymentStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '✓ Paid'
      case 'pending':
        return '⏳ Unpaid'
      case 'failed':
        return '✕ Payment Failed'
      default:
        return 'Unknown'
    }
  }

  const calculatePenaltyAmount = (booking) => {
    return (booking.lateFee || 0) + (booking.damageFee || 0)
  }

  const isPenaltyWaived = (booking) => {
    return booking.waiverApproved === true
  }

  const calculateFinalAmount = (booking) => {
    let amount = booking.totalPrice || 0
    const penaltyAmount = calculatePenaltyAmount(booking)
    
    // Add penalty only if not waived
    if (penaltyAmount > 0 && !isPenaltyWaived(booking)) {
      amount += penaltyAmount
    }
    
    return amount
  }

  // Filter only processed bookings (history)
  const historyBookings = bookings.filter(b => b.returnStatus === 'processed')
  const completedCount = historyBookings.length

  return (
    <div className="min-h-screen bg-gray-950 pb-16 px-4">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 mt-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">Booking History</span>
          </h1>
          <p className="text-gray-400">View your completed trips and rental history</p>
        </div>

        {/* Summary Cards */}
        {!loading && historyBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/40 group-hover:to-emerald-500/40 transition">
                  <CheckCircle size={24} className="text-green-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Completed Trips</p>
              <h2 className="text-3xl font-bold text-white">{completedCount}</h2>
              <p className="text-xs text-gray-500 mt-3">All finished rentals</p>
            </Card>

            <Card className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition">
                  <Truck size={24} className="text-purple-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Vehicles Rented</p>
              <h2 className="text-3xl font-bold text-white">{new Set(historyBookings.map(b => b.vehicle?._id)).size}</h2>
              <p className="text-xs text-gray-500 mt-3">Unique vehicles used</p>
            </Card>
          </div>
        )}

        {/* History List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {historyBookings.length > 0 ? (
              <div className="space-y-6">
                {historyBookings.map(booking => {
                  const duration = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))
                  const penaltyAmount = calculatePenaltyAmount(booking)
                  const isWaived = isPenaltyWaived(booking)
                  const finalAmount = calculateFinalAmount(booking)
                  
                  return (
                    <GlassCard key={booking._id} className="p-6 hover:border-green-500/50 transition" glow>
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Vehicle Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                              <Truck size={28} className="text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-white">{booking.vehicle?.name || 'Vehicle'}</h3>
                              <p className="text-gray-400 text-sm">{booking.vehicle?.category || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Booking Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-white/10">
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Pick-up</p>
                              <p className="text-white font-semibold">{new Date(booking.startDate).toLocaleDateString()}</p>
                              <p className="text-gray-500 text-xs">{new Date(booking.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Drop-off</p>
                              <p className="text-white font-semibold">{new Date(booking.endDate).toLocaleDateString()}</p>
                              <p className="text-gray-500 text-xs">{new Date(booking.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Duration</p>
                              <p className="text-white font-semibold">{duration} day{duration !== 1 ? 's' : ''}</p>
                              <p className="text-gray-500 text-xs text-center"># of days</p>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Price per day</span>
                              <span className="text-white">₹{booking.vehicle?.pricePerDay?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-cyan-300 font-semibold">Rental Amount</span>
                              <span className="text-cyan-300 font-bold text-xl">₹{booking.totalPrice?.toLocaleString() || 0}</span>
                            </div>
                          </div>

                          {/* Penalties & Final Amount */}
                          {(penaltyAmount > 0 || booking.waiverApproved) && (
                            <div className="mt-4 pt-4 border-t border-white/10 text-sm space-y-2">
                              {booking.lateFee > 0 && (
                                <div className="flex justify-between text-orange-400">
                                  <span>Late Fee</span>
                                  <span>+₹{booking.lateFee.toLocaleString()}</span>
                                </div>
                              )}
                              {booking.damageFee > 0 && (
                                <div className="flex justify-between text-red-400">
                                  <span>Damage Fee</span>
                                  <span>+₹{booking.damageFee.toLocaleString()}</span>
                                </div>
                              )}
                              {isWaived && (
                                <div className="flex justify-between text-green-400 font-semibold py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <span>✓ Penalty Waived</span>
                                  <span>-₹{penaltyAmount.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                                <span>Final Amount Paid</span>
                                <span className={isWaived ? 'text-green-400' : 'text-cyan-300'}>₹{finalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="lg:w-48 flex flex-col gap-4">
                          {/* Status Badges */}
                          <div className="space-y-2">
                            <span className={`inline-block text-xs px-4 py-2 rounded-full font-semibold border ${getStatusColor(booking.status)}`}>
                              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                            </span>
                            <span className={`inline-block text-xs px-4 py-2 rounded-full font-semibold border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              {getPaymentStatusLabel(booking.paymentStatus)}
                            </span>
                            {isWaived && (
                              <span className="inline-block text-xs px-4 py-2 rounded-full font-semibold border bg-green-500/20 text-green-300 border-green-500/30">
                                ✓ Penalty Waived
                              </span>
                            )}
                            {booking.isFinePaid && (
                              <span className="inline-block text-xs px-4 py-2 rounded-full font-semibold border bg-green-500/20 text-green-300 border-green-500/30">
                                ✓ Fine Paid
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="flex flex-col gap-2 pt-2">
                            {booking.paymentStatus === 'paid' && booking.paymentId && (
                              <button
                                onClick={() => handleViewPaymentDetails(booking)}
                                disabled={loadingPaymentId === booking._id}
                                className="w-full px-4 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 border border-cyan-500/30"
                              >
                                {loadingPaymentId === booking._id ? (
                                  <Loader size={16} className="animate-spin" />
                                ) : (
                                  <FileText size={16} />
                                )}
                                Receipt
                              </button>
                            )}
                            <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold text-center flex items-center justify-center gap-2">
                              <CheckCircle size={16} />
                              Completed
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            ) : (
              <GlassCard className="p-12 text-center" glow>
                <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg font-semibold">No booking history yet</p>
                <p className="text-gray-500 text-sm mt-2">Your completed trips will appear here</p>
              </GlassCard>
            )}
          </>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <PaymentDetailsModal
          isOpen={showPaymentDetails}
          onClose={() => {
            setShowPaymentDetails(false)
            setSelectedPayment(null)
          }}
          payment={selectedPayment}
          booking={historyBookings.find(b => b.paymentId === selectedPayment._id)}
        />
      )}
    </div>
  )
}

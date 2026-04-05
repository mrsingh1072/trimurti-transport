import { useState, useEffect } from 'react'
import { Calendar, Truck, X, Edit2, Loader, AlertCircle, CreditCard, FileText, MapPin, Clock, TrendingUp, RotateCcw, FileCheck, CheckCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import EditBookingModal from '../components/EditBookingModal'
import PaymentCheckoutModal from '../components/PaymentCheckoutModal'
import PaymentDetailsModal from '../components/PaymentDetailsModal'
import RequestReturnModal from '../components/RequestReturnModal'
import RequestWaiverModal from '../components/RequestWaiverModal'
import Card from '../components/Card'
import { getUserBookings, cancelBooking, getPaymentById, createFinePaymentOrder, verifyFinePayment } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MyBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [editingBooking, setEditingBooking] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [paymentBooking, setPaymentBooking] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [loadingPaymentId, setLoadingPaymentId] = useState(null)
  const [returnRequestBooking, setReturnRequestBooking] = useState(null)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [waiverRequestBooking, setWaiverRequestBooking] = useState(null)
  const [showWaiverModal, setShowWaiverModal] = useState(false)
  const [finePaymentBooking, setFinePaymentBooking] = useState(null)
  const [payingFineId, setPayingFineId] = useState(null)
  const [activeTab, setActiveTab] = useState('active')

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

  const handlePayNow = (booking) => {
    setPaymentBooking(booking)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (transactionId) => {
    setShowPaymentModal(false)
    setPaymentBooking(null)
    await fetchBookings()
  }

  const handleViewPaymentDetails = async (booking) => {
    if (!booking.paymentId) return

    setLoadingPaymentId(booking._id)
    try {
      const paymentData = await getPaymentById(booking.paymentId)
      setSelectedPayment(paymentData)
      setPaymentBooking(booking)
      setShowPaymentDetails(true)
    } catch (err) {
      console.error('Failed to load payment details:', err)
      alert('Could not load payment details')
    } finally {
      setLoadingPaymentId(null)
    }
  }

  const handleRequestReturn = (booking) => {
    setReturnRequestBooking(booking)
    setShowReturnModal(true)
  }

  const handleReturnSuccess = async (updatedBooking) => {
    setShowReturnModal(false)
    setReturnRequestBooking(null)
    await fetchBookings()
  }

  const handleRequestWaiver = (booking) => {
    setWaiverRequestBooking(booking)
    setShowWaiverModal(true)
  }

  const handleWaiverSuccess = async (updatedBooking) => {
    setShowWaiverModal(false)
    setWaiverRequestBooking(null)
    await fetchBookings()
  }

  const handlePayFine = async (booking) => {
    if (!booking._id) return
    
    setPayingFineId(booking._id)
    try {
      // Step 1: Create fine payment order
      console.log('💰 Creating fine payment order...')
      const orderData = await createFinePaymentOrder(booking._id)
      
      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to create payment order')
      }

      // Step 2: Initialize Razorpay checkout
      console.log('🎫 Initializing Razorpay checkout...')
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        description: `Fine Payment - ${booking.vehicle?.name || 'Vehicle'} Rental`,
        handler: async (response) => {
          try {
            // Step 3: Verify payment on backend
            console.log('✅ Payment successful, verifying...')
            await verifyFinePayment(
              booking._id,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )
            
            // Step 4: Refresh bookings to show updated status
            console.log('📝 Refreshing bookings...')
            await fetchBookings()
            alert('Fine payment completed successfully!')
          } catch (error) {
            console.error('❌ Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          email: 'customer@email.com',
          contact: booking.user?.phone || '',
        },
        notes: {
          bookingId: booking._id,
          vehicle: booking.vehicle?.name,
        },
        theme: {
          color: '#3399cc',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        console.error('❌ Payment failed:', response.error)
        alert(`Payment failed: ${response.error.description}`)
      })
      
      rzp.open()
    } catch (error) {
      console.error('Failed to initiate fine payment:', error)
      alert(error.message || 'Failed to initiate fine payment. Please try again.')
    } finally {
      setPayingFineId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  const getReturnStatusLabel = (returnStatus) => {
    switch (returnStatus?.toLowerCase()) {
      case 'requested':
        return '⏳ Return Requested'
      case 'processed':
        return '✓ Return Processed'
      default:
        return null
    }
  }

  const canCancel = (booking) => {
    return ['confirmed', 'pending'].includes(booking.status?.toLowerCase())
  }

  const canEdit = (booking) => {
    return ['confirmed', 'pending'].includes(booking.status?.toLowerCase())
  }

  const canRequestReturn = (booking) => {
    // Return can be requested for ANY booking as long as it hasn't been already returned
    return booking.returnStatus !== 'processed'
  }

  const canRequestWaiver = (booking) => {
    return (booking.lateFee > 0 || booking.damageFee > 0) && !booking.waiverApproved
  }

  const needsPayment = (booking) => {
    return booking.paymentStatus === 'pending' && ['confirmed', 'ongoing'].includes(booking.status?.toLowerCase())
  }

  // Penalty Management Functions
  const calculatePenaltyAmount = (booking) => {
    return (booking.lateFee || 0) + (booking.damageFee || 0)
  }

  const isPenaltyWaived = (booking) => {
    return booking.waiverApproved === true
  }

  const canPayFine = (booking) => {
    const penaltyAmount = calculatePenaltyAmount(booking)
    const isWaived = isPenaltyWaived(booking)
    const isPaid = booking.isFinePaid === true
    
    // Show ONLY if: penalty exists AND not paid AND not waived
    return penaltyAmount > 0 && !isPaid && !isWaived
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

  // Booking Separation
  const activeBookings = bookings.filter(b => b.returnStatus !== 'processed')
  const historyBookings = bookings.filter(b => b.returnStatus === 'processed')
  const displayedBookings = activeTab === 'active' ? activeBookings : historyBookings

  // Calculate stats
  const activeCount = activeBookings.length
  const completedCount = historyBookings.length
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  return (
    <div className="min-h-screen bg-gray-950 pb-16 px-4">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 mt-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">My Bookings</span>
          </h1>
          <p className="text-gray-400">Manage your vehicle rentals and reservations</p>
        </div>

        {/* Summary Cards */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition">
                  <Calendar size={24} className="text-cyan-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Active Bookings</p>
              <h2 className="text-3xl font-bold text-white">{activeCount}</h2>
              <p className="text-xs text-gray-500 mt-3">Confirmed & ongoing</p>
            </Card>

            <Card className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/40 group-hover:to-emerald-500/40 transition">
                  <TrendingUp size={24} className="text-green-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Completed</p>
              <h2 className="text-3xl font-bold text-white">{completedCount}</h2>
              <p className="text-xs text-gray-500 mt-3">Finished trips</p>
            </Card>

            <Card className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition">
                  <Truck size={24} className="text-purple-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Spent</p>
              <h2 className="text-3xl font-bold text-white">₹{totalSpent.toLocaleString()}</h2>
              <p className="text-xs text-gray-500 mt-3">All bookings</p>
            </Card>
          </div>
        )}

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
              <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {bookings.length > 0 ? (
              <>
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2 font-semibold rounded-lg transition ${
                      activeTab === 'active'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Active Bookings ({activeBookings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 font-semibold rounded-lg transition ${
                      activeTab === 'history'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    History ({historyBookings.length})
                  </button>
                </div>

                {/* Bookings Grid */}
                {displayedBookings.length > 0 ? (
                  <div className="space-y-6">
                    {displayedBookings.map(booking => {
                      const duration = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))
                      const returnStatusLabel = booking.returnStatus ? getReturnStatusLabel(booking.returnStatus) : null
                      const penaltyAmount = calculatePenaltyAmount(booking)
                      const isWaived = isPenaltyWaived(booking)
                      const finalAmount = calculateFinalAmount(booking)
                      const isHistoryView = activeTab === 'history'
                      
                      return (
                        <GlassCard key={booking._id} className="p-6 hover:border-cyan-500/50 transition" glow>
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
                                  <span className="text-cyan-300 font-semibold">Total Amount</span>
                                  <span className="text-cyan-300 font-bold text-xl">₹{booking.totalPrice?.toLocaleString() || 0}</span>
                                </div>
                              </div>

                              {/* Penalties & Fees Section */}
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
                                    <span>Final Amount</span>
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
                                {returnStatusLabel && (
                                  <span className="inline-block text-xs px-4 py-2 rounded-full font-semibold border bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    {returnStatusLabel}
                                  </span>
                                )}
                                {booking.waiverRequested && !booking.waiverApproved && (
                                  <span className="inline-block text-xs px-4 py-2 rounded-full font-semibold border bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    ⏳ Waiver Pending
                                  </span>
                                )}
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

                              {/* Action Buttons - Context Specific */}
                              <div className="flex flex-col gap-2 pt-2">
                                {isHistoryView ? (
                                  <>
                                    {/* History View - Show minimal actions */}
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
                                    <div className="pt-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold text-center flex items-center justify-center gap-2">
                                      <CheckCircle size={16} />
                                      Completed
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Active View - Show all applicable actions */}
                                    {needsPayment(booking) && (
                                      <button
                                        onClick={() => handlePayNow(booking)}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition flex items-center justify-center gap-2 text-sm font-semibold"
                                      >
                                        <CreditCard size={16} />
                                        Pay Now
                                      </button>
                                    )}
                                    {canPayFine(booking) && (
                                      <button
                                        onClick={() => handlePayFine(booking)}
                                        disabled={payingFineId === booking._id}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/30 transition flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                                      >
                                        {payingFineId === booking._id ? (
                                          <Loader size={16} className="animate-spin" />
                                        ) : (
                                          <CreditCard size={16} />
                                        )}
                                        Pay Fine
                                      </button>
                                    )}
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
                                    {booking.returnStatus && booking.returnStatus !== 'none' ? (
                                      <button
                                        disabled
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-500/20 text-gray-300 cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold border border-gray-500/30 opacity-50"
                                      >
                                        <RotateCcw size={16} />
                                        {booking.returnStatus === 'requested' ? 'Return Requested' : 'Return Processed'}
                                      </button>
                                    ) : canRequestReturn(booking) && (
                                      <button
                                        onClick={() => handleRequestReturn(booking)}
                                        className="w-full px-4 py-2.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition flex items-center justify-center gap-2 text-sm font-semibold border border-blue-500/30"
                                      >
                                        <RotateCcw size={16} />
                                        Request Return
                                      </button>
                                    )}
                                    {canRequestWaiver(booking) && !isWaived && (
                                      <button
                                        onClick={() => handleRequestWaiver(booking)}
                                        className="w-full px-4 py-2.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition flex items-center justify-center gap-2 text-sm font-semibold border border-purple-500/30"
                                      >
                                        <FileCheck size={16} />
                                        Request Waiver
                                      </button>
                                    )}
                                    {canEdit(booking) && (
                                      <button
                                        onClick={() => handleEditBooking(booking)}
                                        className="w-full px-4 py-2.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition flex items-center justify-center gap-2 text-sm font-semibold border border-blue-500/30"
                                      >
                                        <Edit2 size={16} />
                                        Edit Dates
                                      </button>
                                    )}
                                    {canCancel(booking) && (
                                      <button
                                        onClick={() => handleCancelBooking(booking._id)}
                                        disabled={cancellingId === booking._id}
                                        className="w-full px-4 py-2.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 border border-red-500/30"
                                      >
                                        {cancellingId === booking._id ? (
                                          <Loader size={16} className="animate-spin" />
                                        ) : (
                                          <X size={16} />
                                        )}
                                        Cancel
                                      </button>
                                    )}
                                  </>
                                )}
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
                    <p className="text-gray-400 text-lg font-semibold">
                      {activeTab === 'active' ? 'No active bookings' : 'No completed bookings'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      {activeTab === 'active' 
                        ? 'Start your journey by booking a vehicle from our fleet' 
                        : 'Your completed trips will appear here'}
                    </p>
                  </GlassCard>
                )}
              </>
            ) : (
              <GlassCard className="p-12 text-center" glow>
                <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg font-semibold">No bookings yet</p>
                <p className="text-gray-500 text-sm mt-2 mb-6">Start your journey by booking a vehicle from our amazing fleet</p>
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/40 transition">
                  Browse Vehicles
                </button>
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

      {/* Payment Checkout Modal */}
      {showPaymentModal && paymentBooking && (
        <PaymentCheckoutModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setPaymentBooking(null)
          }}
          booking={paymentBooking}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && paymentBooking && (
        <PaymentDetailsModal
          isOpen={showPaymentDetails}
          onClose={() => {
            setShowPaymentDetails(false)
            setSelectedPayment(null)
            setPaymentBooking(null)
          }}
          payment={selectedPayment}
          booking={paymentBooking}
        />
      )}

      {/* Request Return Modal */}
      {showReturnModal && returnRequestBooking && (
        <RequestReturnModal
          booking={returnRequestBooking}
          onClose={() => {
            setShowReturnModal(false)
            setReturnRequestBooking(null)
          }}
          onSuccess={handleReturnSuccess}
        />
      )}

      {/* Request Waiver Modal */}
      {showWaiverModal && waiverRequestBooking && (
        <RequestWaiverModal
          booking={waiverRequestBooking}
          onClose={() => {
            setShowWaiverModal(false)
            setWaiverRequestBooking(null)
          }}
          onSuccess={handleWaiverSuccess}
        />
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { BarChart3, BookOpen, Truck, TrendingUp, RotateCcw, TrendingDown, FileCheck, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StaffLayout from '../../components/StaffLayout'
import { 
  getBookings, 
  getVehicles,
  getLateBookings,
  getPendingReturns,
  getPendingWaivers,
  processReturn,
  updatePenalty,
  handleWaiver,
} from '../../services/api'
import Card from '../../components/Card'
import GlassCard from '../../components/GlassCard'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    availableVehicles: 0,
    pendingReturns: 0,
    lateBookings: 0,
    pendingWaivers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')

  // Tab & detail states
  const [activeTab, setActiveTab] = useState('overview') // overview | returns | penalties | waivers
  const [lateBookingsList, setLateBookingsList] = useState([])
  const [pendingReturnsList, setPendingReturnsList] = useState([])
  const [pendingWaiversList, setPendingWaiversList] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  // Form states
  const [returnForm, setReturnForm] = useState({})
  const [penaltyForm, setPenaltyForm] = useState({})

  const userName = user?.name || 'Staff Member'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [bookingsRes, vehiclesRes, late, returns, waivers] = await Promise.all([
        getBookings(),
        getVehicles(),
        getLateBookings(),
        getPendingReturns(),
        getPendingWaivers(),
      ])

      const bookings = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes?.data || [])
      const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.items || [])

      const activeBookings = Array.isArray(bookings)
        ? bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length
        : 0
      const completedBookings = Array.isArray(bookings)
        ? bookings.filter((b) => b.status === 'completed').length
        : 0
      const availableVehicles = Array.isArray(vehicles)
        ? vehicles.filter((v) => v.availability === true).length
        : 0

      setStats({
        activeBookings,
        completedBookings,
        availableVehicles,
        pendingReturns: returns?.length || 0,
        lateBookings: late?.length || 0,
        pendingWaivers: waivers?.length || 0,
      })

      setLateBookingsList(late || [])
      setPendingReturnsList(returns || [])
      setPendingWaiversList(waivers || [])
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessReturn = async (bookingId) => {
    const formData = returnForm[bookingId]
    if (!formData?.actualReturnDate) {
      setError('Please enter actual return date')
      return
    }

    setProcessingId(bookingId)
    setError('')
    try {
      await processReturn(bookingId, formData.actualReturnDate, formData.damageFee)
      setSuccess('Return processed successfully')
      await fetchStats()
      setReturnForm({})
      setExpandedId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process return')
    } finally {
      setProcessingId(null)
    }
  }

  const handleUpdatePenalty = async (bookingId) => {
    const formData = penaltyForm[bookingId]
    if (formData === undefined) return

    setProcessingId(bookingId)
    setError('')
    try {
      await updatePenalty(
        bookingId,
        formData.lateFee !== undefined ? formData.lateFee : undefined,
        formData.damageFee !== undefined ? formData.damageFee : undefined
      )
      setSuccess('Penalty updated successfully')
      await fetchStats()
      setPenaltyForm({})
      setExpandedId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update penalty')
    } finally {
      setProcessingId(null)
    }
  }

  const handleWaiverAction = async (bookingId, approve) => {
    setProcessingId(bookingId)
    setError('')
    try {
      await handleWaiver(bookingId, approve)
      setSuccess(approve ? 'Waiver approved' : 'Waiver rejected')
      await fetchStats()
      setExpandedId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process waiver')
    } finally {
      setProcessingId(null)
    }
  }

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${gradient}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )

  const renderReturnItem = (booking) => {
    const form = returnForm[booking._id] || {}
    const isExpanded = expandedId === booking._id
    const isProcessing = processingId === booking._id

    return (
      <GlassCard key={booking._id} className="p-4 hover:border-blue-500/50 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <RotateCcw size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">{booking.vehicle?.name}</h3>
                <p className="text-gray-400 text-sm">Customer: {booking.user?.name}</p>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Actual Return Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.actualReturnDate || ''}
                    onChange={(e) =>
                      setReturnForm({
                        ...returnForm,
                        [booking._id]: { ...form, actualReturnDate: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Damage Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={form.damageFee || ''}
                    onChange={(e) =>
                      setReturnForm({
                        ...returnForm,
                        [booking._id]: { ...form, damageFee: e.target.value },
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleProcessReturn(booking._id)}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50"
                >
                  {isProcessing ? <Loader size={16} className="inline animate-spin" /> : 'Process Return'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setExpandedId(isExpanded ? null : booking._id)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </GlassCard>
    )
  }

  const renderPenaltyItem = (booking) => {
    const form = penaltyForm[booking._id] || {}
    const isExpanded = expandedId === booking._id
    const isProcessing = processingId === booking._id

    return (
      <GlassCard key={booking._id} className="p-4 hover:border-orange-500/50 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingDown size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">{booking.vehicle?.name}</h3>
                <p className="text-gray-400 text-sm">Customer: {booking.user?.name}</p>
                {booking.lateFee > 0 && <p className="text-orange-300 text-sm">Late Fee: ₹{booking.lateFee}</p>}
                {booking.damageFee > 0 && <p className="text-red-300 text-sm">Damage Fee: ₹{booking.damageFee}</p>}
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Late Fee (₹)</label>
                  <input
                    type="number"
                    value={form.lateFee !== undefined ? form.lateFee : booking.lateFee}
                    onChange={(e) =>
                      setPenaltyForm({
                        ...penaltyForm,
                        [booking._id]: { ...form, lateFee: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Damage Fee (₹)</label>
                  <input
                    type="number"
                    value={form.damageFee !== undefined ? form.damageFee : booking.damageFee}
                    onChange={(e) =>
                      setPenaltyForm({
                        ...penaltyForm,
                        [booking._id]: { ...form, damageFee: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleUpdatePenalty(booking._id)}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold disabled:opacity-50"
                >
                  {isProcessing ? <Loader size={16} className="inline animate-spin" /> : 'Update Penalty'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setExpandedId(isExpanded ? null : booking._id)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </GlassCard>
    )
  }

  const renderWaiverItem = (booking) => {
    const isExpanded = expandedId === booking._id
    const isProcessing = processingId === booking._id
    const totalPenalty = (booking.lateFee || 0) + (booking.damageFee || 0)

    return (
      <GlassCard key={booking._id} className="p-4 hover:border-purple-500/50 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <FileCheck size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">{booking.vehicle?.name}</h3>
                <p className="text-gray-400 text-sm">Customer: {booking.user?.name}</p>
                <p className="text-purple-300 text-sm mt-1">Penalty: ₹{totalPenalty}</p>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleWaiverAction(booking._id, true)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold disabled:opacity-50"
                  >
                    {isProcessing ? <Loader size={16} className="inline animate-spin" /> : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleWaiverAction(booking._id, false)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold disabled:opacity-50"
                  >
                    {isProcessing ? <Loader size={16} className="inline animate-spin" /> : '✕ Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setExpandedId(isExpanded ? null : booking._id)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </GlassCard>
    )
  }

  return (
    <StaffLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Welcome back, {userName}. Here's your staff overview.</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 flex gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-400">
            {success}
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Active Bookings"
              value={stats.activeBookings}
              icon={BookOpen}
              gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
            />
            <StatCard
              title="Pending Returns"
              value={stats.pendingReturns}
              icon={RotateCcw}
              gradient="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20"
            />
            <StatCard
              title="Late Bookings"
              value={stats.lateBookings}
              icon={TrendingDown}
              gradient="bg-gradient-to-br from-orange-500/20 to-orange-600/20"
            />
          </div>
        )}

        {/* Tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">Operation Shortcut</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('returns')}
                  className="w-full p-3 rounded-lg bg-gray-700/50 hover:bg-cyan-500/20 text-gray-300 hover:text-white transition text-left"
                >
                  ♻️ Process Returns ({stats.pendingReturns})
                </button>
                <button
                  onClick={() => setActiveTab('penalties')}
                  className="w-full p-3 rounded-lg bg-gray-700/50 hover:bg-orange-500/20 text-gray-300 hover:text-white transition text-left"
                >
                  💰 Manage Penalties ({stats.lateBookings})
                </button>
                <button
                  onClick={() => setActiveTab('waivers')}
                  className="w-full p-3 rounded-lg bg-gray-700/50 hover:bg-purple-500/20 text-gray-300 hover:text-white transition text-left"
                >
                  📋 Review Waivers ({stats.pendingWaivers})
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">API Connection</span>
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    ✓ Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Database</span>
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    ✓ Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back to Overview
            </button>
            <h3 className="text-2xl font-bold text-white mt-4">Pending Returns ({pendingReturnsList.length})</h3>
            {pendingReturnsList.length > 0 ? (
              pendingReturnsList.map(renderReturnItem)
            ) : (
              <GlassCard className="p-12 text-center">
                <RotateCcw size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">No pending returns</p>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'penalties' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back to Overview
            </button>
            <h3 className="text-2xl font-bold text-white mt-4">Late Bookings ({lateBookingsList.length})</h3>
            {lateBookingsList.length > 0 ? (
              lateBookingsList.map(renderPenaltyItem)
            ) : (
              <GlassCard className="p-12 text-center">
                <TrendingDown size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">No late bookings</p>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'waivers' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back to Overview
            </button>
            <h3 className="text-2xl font-bold text-white mt-4">Waiver Requests ({pendingWaiversList.length})</h3>
            {pendingWaiversList.length > 0 ? (
              pendingWaiversList.map(renderWaiverItem)
            ) : (
              <GlassCard className="p-12 text-center">
                <FileCheck size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">No waiver requests</p>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </StaffLayout>
  )
}

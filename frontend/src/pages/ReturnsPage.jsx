import { useState, useEffect } from 'react'
import { RotateCcw, Plus, Filter, Search } from 'lucide-react'
import GlassCard from '../components/GlassCard'

export default function ReturnsPage() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showProcessForm, setShowProcessForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [formData, setFormData] = useState({
    actualReturnDate: '',
    damageDescription: '',
    damageCost: ''
  })

  useEffect(() => {
    // Fetch returns data
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    setLoading(true)
    try {
      // TODO: Implement fetch returns from API
      setReturns([
        {
          _id: '1',
          booking: { _id: 'BK001', vehicle: { name: 'Mahindra Thar' }, user: { name: 'John Doe' }, startDate: '2026-03-20', endDate: '2026-03-25' },
          actualReturnDate: '2026-03-25',
          lateFee: 0,
          damageFee: 0,
          finalAmount: 3000,
          status: 'completed'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessReturn = async (e) => {
    e.preventDefault()
    console.log('Processing return:', { selectedBooking, ...formData })
    // TODO: Implement API call to process return
    setShowProcessForm(false)
    setFormData({ actualReturnDate: '', damageDescription: '', damageCost: '' })
    setSelectedBooking(null)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'processing':
        return 'bg-blue-500/20 text-blue-300'
      case 'completed':
        return 'bg-green-500/20 text-green-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.booking?.vehicle?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.booking?.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || ret.status.toLowerCase() === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Vehicle Returns</span>
          </h1>
          <p className="text-gray-400">Process and manage vehicle returns</p>
        </div>
        <button 
          onClick={() => {
            setShowProcessForm(!showProcessForm)
            setSelectedBooking(null)
          }}
          className="btn-gradient px-6 py-3 rounded-xl text-white flex items-center gap-2 hover:shadow-glow-purple transition"
        >
          <Plus size={20} />
          Process Return
        </button>
      </div>

      {/* Process Return Form */}
      {showProcessForm && (
        <GlassCard className="p-8" glow>
          <h3 className="text-2xl font-bold text-white mb-6">Process Vehicle Return</h3>
          <form onSubmit={handleProcessReturn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Booking</label>
              <select
                value={selectedBooking?._id || ''}
                onChange={(e) => {
                  // Find booking from list
                  console.log('Select booking:', e.target.value)
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                required
              >
                <option value="">Select a booking to return</option>
                {/* Populate from active bookings */}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Return Date</label>
                <input
                  type="date"
                  value={formData.actualReturnDate}
                  onChange={(e) => setFormData({ ...formData, actualReturnDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Damage Cost</label>
                <input
                  type="number"
                  value={formData.damageCost}
                  onChange={(e) => setFormData({ ...formData, damageCost: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">&nbsp;</label>
                <button
                  type="submit"
                  className="w-full btn-gradient px-6 py-3 rounded-xl text-white hover:shadow-glow-purple transition"
                >
                  Process Return
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Damage Description</label>
              <textarea
                value={formData.damageDescription}
                onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition resize-none"
                rows="3"
                placeholder="Describe any damage to the vehicle..."
              ></textarea>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowProcessForm(false)
                  setFormData({ actualReturnDate: '', damageDescription: '', damageCost: '' })
                }}
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
            placeholder="Search returns..."
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
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Returns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReturns.map(ret => (
            <GlassCard key={ret._id} className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition">
                  <RotateCcw size={24} className="text-pink-400" />
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(ret.status)}`}>
                  {ret.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-3">{ret.booking?.vehicle?.name}</h3>
              
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer</span>
                  <span className="text-white">{ret.booking?.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Return Date</span>
                  <span className="text-white">{new Date(ret.actualReturnDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Late Fee</span>
                  <span className="text-white">₹{ret.lateFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Damage Fee</span>
                  <span className="text-white">₹{ret.damageFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-gray-300">Final Amount</span>
                  <span className="text-white font-bold">₹{ret.finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-white text-sm font-medium hover:from-purple-500/50 hover:to-cyan-500/50 transition">
                View Details
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {!loading && filteredReturns.length === 0 && (
        <GlassCard className="p-12 text-center">
          <RotateCcw size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No returns found</p>
        </GlassCard>
      )}
    </div>
  )
}

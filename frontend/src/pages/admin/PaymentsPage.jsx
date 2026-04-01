import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getPayments, getPaymentStats } from '../../services/api'
import { Search, Check, X, RefreshCw, Download, TrendingUp, Users, CreditCard } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch payments
      const paymentsResponse = await getPayments()
      const paymentsData = Array.isArray(paymentsResponse) ? paymentsResponse : paymentsResponse.data || []
      setPayments(paymentsData)

      // Fetch stats
      const statsData = await getPaymentStats()
      if (statsData) {
        setStats(statsData)
        
        // Prepare chart data from monthly trends
        if (statsData.monthlyTrends && statsData.monthlyTrends.length > 0) {
          const charted = statsData.monthlyTrends.reverse().map(trend => ({
            month: `${trend._id.month}/${trend._id.year}`,
            revenue: trend.revenue,
            transactions: trend.transactions,
          }))
          setChartData(charted)
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = payments

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.booking?.vehicle?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }, [searchTerm, statusFilter, payments])

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-500/20 text-green-400',
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'failed': 'bg-red-500/20 text-red-400',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  const getMethodIcon = (method) => {
    const icons = {
      'upi': '📱',
      'card': '💳',
      'netbanking': '🏦',
      'wallet': '💰',
      'cash': '💵',
    }
    return icons[method?.toLowerCase()] || '💳'
  }

  const formatAmount = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Payment Analytics</h2>
            <p className="text-gray-400">Monitor revenue, transactions, and payment trends</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{formatAmount(stats.overall.totalRevenue)}</p>
                </div>
                <CreditCard className="text-blue-400 text-5xl opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed Revenue</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{formatAmount(stats.overall.completedRevenue)}</p>
                </div>
                <Check className="text-green-400 text-5xl opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Transactions</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{stats.overall.totalTransactions}</p>
                </div>
                <Users className="text-purple-400 text-5xl opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold text-indigo-400 mt-2">{stats.overall.successRate}%</p>
                </div>
                <TrendingUp className="text-indigo-400 text-5xl opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Secondary Metrics */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold mb-3">TRANSACTION STATUS</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Completed</span>
                  <span className="text-green-400 font-semibold">{stats.overall.completedPayments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Pending</span>
                  <span className="text-yellow-400 font-semibold">{stats.overall.pendingPayments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Failed</span>
                  <span className="text-red-400 font-semibold">{stats.overall.failedPayments}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods Distribution */}
            {stats.methodDistribution && stats.methodDistribution.length > 0 && (
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-xs font-semibold mb-3">PAYMENT METHODS</p>
                <div className="space-y-2">
                  {stats.methodDistribution.map((method) => (
                    <div key={method._id} className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        {getMethodIcon(method._id)} {method._id?.toUpperCase()}
                      </span>
                      <span className="text-white font-semibold">{method.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Average Order Value */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold mb-3">AVERAGE ORDER VALUE</p>
              <p className="text-3xl font-bold text-purple-400">
                {formatAmount(
                  stats.overall.totalTransactions > 0
                    ? stats.overall.totalRevenue / stats.overall.totalTransactions
                    : 0
                )}
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        {!loading && chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Trends */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Revenue Trends (Last 12 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                    formatter={(value) => formatAmount(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Transactions Trends */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Transaction Count (Last 12 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                  />
                  <Bar dataKey="transactions" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, email, vehicle, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'completed', 'pending', 'failed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition capitalize ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Vehicle</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <span className="text-gray-400">Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <p className="text-gray-400">No payments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="border-b border-gray-700 hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-white font-medium">{payment.user?.name || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">{payment.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">{payment.booking?.vehicle?.name || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{formatAmount(payment.amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-2xl">{getMethodIcon(payment.method)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono break-all">
                        {payment.razorpayPaymentId ? payment.razorpayPaymentId.substring(0, 15) + '...' : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-purple-400 hover:text-purple-300 transition text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-6">Payment Details</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Customer</p>
                <p className="text-white font-semibold">{selectedPayment.user?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{selectedPayment.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{selectedPayment.user?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Vehicle</p>
                <p className="text-white font-semibold">{selectedPayment.booking?.vehicle?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="text-2xl font-bold text-purple-400">{formatAmount(selectedPayment.amount)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status?.charAt(0).toUpperCase() + selectedPayment.status?.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Payment Method</p>
                <p className="text-white">{getMethodIcon(selectedPayment.method)} {selectedPayment.method?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Transaction ID</p>
                <p className="text-white text-xs font-mono break-all">{selectedPayment.razorpayPaymentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white">{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}


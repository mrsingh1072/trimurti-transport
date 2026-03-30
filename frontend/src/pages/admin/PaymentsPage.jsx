import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getPayments } from '../../services/api'
import { Search, Check, X, RefreshCw, Download } from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState({
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
  })

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        // Mock payment data
        const mockPayments = [
          { id: 'PAY001', bookingId: 'BK001', customerName: 'John Doe', amount: 15000, status: 'completed', method: 'Card', date: '2024-02-10', transactionId: 'TXN123456' },
          { id: 'PAY002', bookingId: 'BK002', customerName: 'Jane Smith', amount: 22000, status: 'completed', method: 'UPI', date: '2024-02-11', transactionId: 'TXN123457' },
          { id: 'PAY003', bookingId: 'BK003', customerName: 'Mike Wilson', amount: 18900, status: 'pending', method: 'Card', date: '2024-02-12', transactionId: 'TXN123458' },
          { id: 'PAY004', bookingId: 'BK004', customerName: 'Sarah Johnson', amount: 31500, status: 'completed', method: 'Net Banking', date: '2024-02-13', transactionId: 'TXN123459' },
          { id: 'PAY005', bookingId: 'BK005', customerName: 'David Brown', amount: 12000, status: 'failed', method: 'Card', date: '2024-02-14', transactionId: 'TXN123460' },
        ]
        setPayments(mockPayments)
        setFilteredPayments(mockPayments)

        // Calculate stats
        const total = mockPayments.reduce((sum, p) => sum + p.amount, 0)
        const completed = mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
        const pending = mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
        const failed = mockPayments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0)

        setStats({
          totalAmount: total,
          completedAmount: completed,
          pendingAmount: pending,
          failedAmount: failed,
        })
      } catch (err) {
        console.error('Error fetching payments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  useEffect(() => {
    let filtered = payments

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'Card': '💳',
      'UPI': '📱',
      'Net Banking': '🏦',
      'Wallet': '💰',
    }
    return icons[method] || '💳'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN')
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Payments Management</h2>
            <p className="text-gray-400">Track and manage all transactions</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">₹{(stats.totalAmount / 100).toFixed(0)}K</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-400 mt-2">₹{(stats.completedAmount / 100).toFixed(0)}K</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">₹{(stats.pendingAmount / 100).toFixed(0)}K</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-3xl font-bold text-red-400 mt-2">₹{(stats.failedAmount / 100).toFixed(0)}K</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by payment ID, booking ID, transaction ID, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'completed', 'pending', 'failed'].map(status => (
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

        {/* Payments Table */}
        {loading ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
            No payments found
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Payment ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Booking ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Transaction ID</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                      <td className="px-6 py-3 text-sm text-white font-medium">{payment.id}</td>
                      <td className="px-6 py-3 text-sm text-gray-300">{payment.bookingId}</td>
                      <td className="px-6 py-3 text-sm text-gray-300">{payment.customerName}</td>
                      <td className="px-6 py-3 text-sm text-white font-medium">₹{payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-300">
                        <span>{getPaymentMethodIcon(payment.method)} {payment.method}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">{formatDate(payment.date)}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(payment.status)}`}>
                          {payment.status === 'completed' && <Check size={14} />}
                          {payment.status === 'pending' && <RefreshCw size={14} />}
                          {payment.status === 'failed' && <X size={14} />}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400 font-mono">{payment.transactionId}</td>
                      <td className="px-6 py-3 text-sm text-center">
                        <button className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import StatsCard from '../../components/admin/StatsCard'
import ChartCard from '../../components/admin/ChartCard'
import { getBookings } from '../../services/api'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp } from 'lucide-react'

export default function ReportsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
  })
  const [monthlyData, setMonthlyData] = useState([])
  const [statusData, setStatusData] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const res = await getBookings()
        // Handle both array and object response structures
        const data = Array.isArray(res) ? res : (res?.bookings || res?.data || [])
        const dataArray = Array.isArray(data) ? data : []

        // Calculate stats
        const totalRevenue = dataArray.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
        const totalBookings = dataArray.length
        const averageValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

        setStats({
          totalRevenue,
          totalBookings,
          averageBookingValue: Math.round(averageValue),
        })

        // Monthly growth (mock)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        const mockMonthly = months.map((month, idx) => ({
          month,
          revenue: Math.floor(Math.random() * 500000) + 100000,
          bookings: Math.floor(Math.random() * 50) + 10,
        }))
        setMonthlyData(mockMonthly)

        // Status breakdown
        const statusCount = {
          confirmed: data.filter(b => b.status === 'confirmed').length,
          pending: data.filter(b => b.status === 'pending').length,
          completed: data.filter(b => b.status === 'completed').length,
          cancelled: data.filter(b => b.status === 'cancelled').length,
        }

        const pieData = [
          { name: 'Confirmed', value: statusCount.confirmed, fill: '#22C55E' },
          { name: 'Pending', value: statusCount.pending, fill: '#EAB308' },
          { name: 'Completed', value: statusCount.completed, fill: '#3B82F6' },
          { name: 'Cancelled', value: statusCount.cancelled, fill: '#EF4444' },
        ].filter(item => item.value > 0)

        setStatusData(pieData)
        setBookings(data)
      } catch (err) {
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h2>
          <p className="text-gray-400">Detailed business metrics and insights</p>
        </div>

        {/* Stats */}
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
            <StatsCard
              title="Total Revenue"
              value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
              icon={DollarSign}
              bgGradient="bg-gradient-to-br from-green-500/10 to-green-600/10"
              trend={12}
            />
            <StatsCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={TrendingUp}
              bgGradient="bg-gradient-to-br from-blue-500/10 to-blue-600/10"
              trend={8}
            />
            <StatsCard
              title="Avg Booking Value"
              value={`₹${stats.averageBookingValue.toLocaleString()}`}
              icon={DollarSign}
              bgGradient="bg-gradient-to-br from-purple-500/10 to-purple-600/10"
              trend={5}
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue */}
          <ChartCard title="Monthly Revenue Trend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Booking Status */}
          <ChartCard title="Booking Status Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Summary Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Monthly Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Month</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Bookings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Avg Value</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                    <td className="px-6 py-3 text-sm text-gray-300">{row.month}</td>
                    <td className="px-6 py-3 text-sm text-white">₹{(row.revenue / 1000).toFixed(1)}K</td>
                    <td className="px-6 py-3 text-sm text-white">{row.bookings}</td>
                    <td className="px-6 py-3 text-sm text-white">₹{Math.round(row.revenue / row.bookings).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

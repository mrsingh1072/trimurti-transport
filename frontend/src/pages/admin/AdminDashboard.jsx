import { useEffect, useState } from 'react'
import { TrendingUp, Users, Truck, DollarSign } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import StatsCard from '../../components/admin/StatsCard'
import DataTable from '../../components/admin/DataTable'
import ChartCard from '../../components/admin/ChartCard'
import { getBookings, getVehicles } from '../../services/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [bookingsRes, vehiclesRes] = await Promise.all([
          getBookings(),
          getVehicles(),
        ])

        // Ensure we have arrays
        const bookings = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes?.bookings || [])
        const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.items || [])

        // Calculate stats
        const activeBookings = Array.isArray(bookings)
          ? bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length
          : 0
        const totalRevenue = Array.isArray(bookings)
          ? bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
          : 0

        setStats({
          totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
          activeBookings,
          totalRevenue,
          totalUsers: Array.isArray(bookings) ? Math.floor(bookings.length * 0.8) : 0,
        })

        // Get recent bookings (last 5)
        const recent = Array.isArray(bookings) ? bookings.slice(0, 5) : []
        setRecentBookings(recent)

        // Generate mock chart data
        const mock7Days = Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          bookings: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 50000) + 10000,
        }))
        setChartData(mock7Days)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const bookingColumns = [
    { header: 'Customer', accessor: 'user', cell: (row) => row.user?.name || 'N/A' },
    { header: 'Vehicle', accessor: 'vehicle', cell: (row) => row.vehicle?.name || 'N/A' },
    { header: 'Check-in', accessor: 'startDate', cell: (row) => new Date(row.startDate).toLocaleDateString() },
    { header: 'Check-out', accessor: 'endDate', cell: (row) => new Date(row.endDate).toLocaleDateString() },
    { header: 'Amount', accessor: 'totalPrice', cell: (row) => `₹${row.totalPrice?.toLocaleString() || 0}` },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
          row.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </span>
      )
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">System overview and key metrics</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Vehicles"
              value={stats.totalVehicles}
              icon={Truck}
              bgGradient="bg-gradient-to-br from-blue-500/10 to-blue-600/10"
              trend={12}
            />
            <StatsCard
              title="Active Bookings"
              value={stats.activeBookings}
              icon={TrendingUp}
              bgGradient="bg-gradient-to-br from-purple-500/10 to-purple-600/10"
              trend={8}
            />
            <StatsCard
              title="Total Revenue"
              value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
              icon={DollarSign}
              bgGradient="bg-gradient-to-br from-green-500/10 to-green-600/10"
              trend={15}
            />
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              bgGradient="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10"
              trend={5}
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Chart */}
          <ChartCard title="Bookings Trend (7 Days)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="bookings" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Revenue Chart */}
          <ChartCard title="Revenue Trend (7 Days)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#06B6D4' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent Bookings */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Recent Bookings</h3>
          <DataTable 
            columns={bookingColumns} 
            data={recentBookings} 
            loading={loading}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

import { useState, useEffect } from 'react'
import { BarChart3, Users, TrendingUp, RotateCcw, Download, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import GlassCard from '../components/GlassCard'
import { getDashboardStats, getBookingStats, getVehicleCount } from '../services/api'

export default function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [bookingStats, setBookingStats] = useState(null)
  const [vehicleCount, setVehicleCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState('7d')

  // Debug log
  console.log('👤 DashboardOverview Current User:', user)

  const userName = user?.name || 'User'

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const [dashStats, bookStats, vCount] = await Promise.all([
          getDashboardStats(),
          getBookingStats(),
          getVehicleCount()
        ])
        setStats(dashStats)
        setBookingStats(bookStats)
        setVehicleCount(vCount)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Dashboard Overview</span>
          </h1>
          <p className="text-gray-400">Welcome back, {userName}. Here's your business performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="glass-card px-6 py-3 rounded-xl hover:bg-white/10 transition flex items-center gap-2">
            <Filter size={20} />
            <span className="hidden sm:inline text-sm">Filter</span>
          </button>
          <button className="btn-gradient px-6 py-3 rounded-xl text-white flex items-center gap-2 hover:shadow-glow-purple transition">
            <Download size={20} />
            <span className="hidden sm:inline text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          label="Total Vehicles"
          value={loading ? '...' : stats?.totalVehicles || 0}
          color="text-purple-400"
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Active Bookings"
          value={loading ? '...' : bookingStats?.activeBookings || 0}
          color="text-cyan-400"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={loading ? '...' : `$${(bookingStats?.totalRevenue || 0).toLocaleString()}`}
          color="text-pink-400"
          change="+24%"
          positive={true}
          loading={loading}
        />
        <StatCard
          icon={RotateCcw}
          label="Available Vehicles"
          value={loading ? '...' : vehicleCount?.available || 0}
          color="text-green-400"
          loading={loading}
        />
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8" glow>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Revenue Trend</h3>
                <p className="text-gray-400 text-sm mt-1">Last 30 days performance</p>
              </div>
              <div className="flex gap-2">
                {['7d', '14d', '30d', '90d'].map(range => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      selectedRange === range
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="h-80 flex items-end justify-between gap-2 px-4">
              {[
                { height: '60%', label: 'Mon' },
                { height: '75%', label: 'Tue' },
                { height: '82%', label: 'Wed' },
                { height: '70%', label: 'Thu' },
                { height: '88%', label: 'Fri' },
                { height: '95%', label: 'Sat' },
                { height: '85%', label: 'Sun' }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-purple-500 to-cyan-400 hover:opacity-100 opacity-80 transition group-hover:shadow-glow-purple"
                    style={{ height: bar.height }}
                  ></div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition">{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-8">
              <div>
                <p className="text-gray-400 text-sm mb-2">Avg. Revenue</p>
                <p className="text-2xl font-bold text-white">$12,500</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Peak Day</p>
                <p className="text-2xl font-bold text-white">Saturday</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Growth Rate</p>
                <p className="text-2xl font-bold gradient-text">+15.8%</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Top Vehicles */}
        <GlassCard className="p-8" glow>
          <h3 className="text-2xl font-bold text-white mb-6">Top Vehicles</h3>
          <div className="space-y-4">
            {[
              { name: 'Mahindra Thar', bookings: 12, revenue: '$2,400' },
              { name: 'Hyundai Creta', bookings: 8, revenue: '$1,600' },
              { name: 'Toyota Innova', bookings: 6, revenue: '$1,200' },
              { name: 'Maruti Swift', bookings: 5, revenue: '$800' },
              { name: 'Honda CR-V', bookings: 4, revenue: '$2,000' }
            ].map((vehicle, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2 group-hover:translate-x-1 transition">
                  <span className="text-white font-medium text-sm">{vehicle.name}</span>
                  <span className="text-gray-400 text-xs">{vehicle.bookings}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${(vehicle.bookings / 12) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500"></span>
                  <span className="text-xs text-gray-400">{vehicle.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Bookings */}
      <GlassCard className="p-8" glow>
        <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { id: 'BK001', customer: 'John Doe', vehicle: 'Mahindra Thar', status: 'Active', date: '2026-03-30' },
            { id: 'BK002', customer: 'Jane Smith', vehicle: 'Hyundai Creta', status: 'Completed', date: '2026-03-29' },
            { id: 'BK003', customer: 'Rajesh Kumar', vehicle: 'Toyota Innova', status: 'Pending', date: '2026-03-28' }
          ].map((booking, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition">
              <div>
                <p className="text-white font-medium">{booking.customer}</p>
                <p className="text-gray-400 text-sm">{booking.vehicle}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                  booking.status === 'Completed' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {booking.status}
                </span>
                <p className="text-gray-400 text-xs mt-2">{booking.date}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { BarChart3, BookOpen, Truck, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StaffLayout from '../../components/StaffLayout'
import { getBookings, getVehicles } from '../../services/api'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    availableVehicles: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Debug log
  console.log('👤 StaffDashboard Current User:', user)

  const userName = user?.name || 'Staff Member'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [bookingsRes, vehiclesRes] = await Promise.all([
          getBookings(),
          getVehicles(),
        ])

        // Ensure we have arrays
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
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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

  return (
    <StaffLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Welcome back, {userName}. Here's your staff overview.</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
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
              title="Completed Bookings"
              value={stats.completedBookings}
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-green-500/20 to-green-600/20"
            />
            <StatCard
              title="Available Vehicles"
              value={stats.availableVehicles}
              icon={Truck}
              gradient="bg-gradient-to-br from-purple-500/20 to-purple-600/20"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="/staff/bookings"
                className="block p-3 rounded-lg bg-gray-700/50 hover:bg-purple-500/20 text-gray-300 hover:text-white transition"
              >
                📋 Manage Bookings
              </a>
              <a
                href="/staff/returns"
                className="block p-3 rounded-lg bg-gray-700/50 hover:bg-cyan-500/20 text-gray-300 hover:text-white transition"
              >
                ♻️ Process Returns
              </a>
              <a
                href="/staff/vehicles"
                className="block p-3 rounded-lg bg-gray-700/50 hover:bg-green-500/20 text-gray-300 hover:text-white transition"
              >
                🚗 Manage Vehicles
              </a>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-gray-300 text-xs">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}

import { useEffect, useState } from 'react'
import { TrendingUp, Users, Truck, DollarSign, MapPin, Activity, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import { getBookings, getVehicles, getLiveTracking } from '../../services/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalVehicles: 0, activeBookings: 0, totalRevenue: 0, totalUsers: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [liveVehicles, setLiveVehicles] = useState([])
  const [liveTrackingLoading, setLiveTrackingLoading] = useState(false)

  const userName = user?.name || 'Administrator'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [bookingsRes, vehiclesRes] = await Promise.all([getBookings(), getVehicles()])

        const bookings = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes?.bookings || [])
        const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.items || [])

        const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

        setStats({
          totalVehicles: vehicles.length,
          activeBookings,
          totalRevenue,
          totalUsers: Math.floor(bookings.length * 0.8),
        })

        setRecentBookings(bookings.slice(0, 8))

        const mock7Days = Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          bookings: Math.floor(Math.random() * 30) + 8,
          revenue: Math.floor(Math.random() * 60000) + 15000,
        }))
        setChartData(mock7Days)
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const fetchLiveTracking = async () => {
      try {
        setLiveTrackingLoading(true)
        const liveData = await getLiveTracking()
        setLiveVehicles(Array.isArray(liveData) ? liveData : [])
      } catch (err) {
        console.error('Live tracking error:', err)
      } finally {
        setLiveTrackingLoading(false)
      }
    }

    fetchLiveTracking()
    const liveInterval = setInterval(fetchLiveTracking, 5000)
    return () => clearInterval(liveInterval)
  }, [])

  const KPICard = ({ title, value, icon: Icon, trend, bgGradient }) => (
    <div className={`${ bgGradient} rounded-2xl p-6 border border-white/8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-xl backdrop-blur-xl bg-white/5">
            <Icon className="w-6 h-6 text-white/80" />
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" />
              {trend}%
            </div>
          )}
        </div>
        <p className="text-white/60 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  )

  const ChartCard = ({ title, children }) => (
    <div className="rounded-2xl p-6 border border-white/8 bg-gradient-to-br from-slate-800/40 to-slate-900/40 shadow-lg overflow-hidden">
      <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
      <div className="h-80 -mx-6 px-6">{children}</div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-8 pb-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white">Dashboard</h1>
              <p className="text-white/50 text-sm mt-1">Overview of your fleet and bookings</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">{today}</p>
              <p className="text-white/40 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-white/5 border border-white/8 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <KPICard
              title="Total Vehicles"
              value={stats.totalVehicles}
              icon={Truck}
              trend={12}
              bgGradient="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent"
            />
            <KPICard
              title="Active Bookings"
              value={stats.activeBookings}
              icon={Activity}
              trend={8}
              bgGradient="bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent"
            />
            <KPICard
              title="Revenue"
              value={`₹${ (stats.totalRevenue / 100000).toFixed(1)}L`}
              icon={DollarSign}
              trend={15}
              bgGradient="bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent"
            />
            <KPICard
              title="Users"
              value={stats.totalUsers}
              icon={Users}
              trend={5}
              bgGradient="bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-transparent"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500 delay-100">
          <ChartCard title="Bookings Trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff30" style={{ fontSize: '12px' }} />
                <YAxis stroke="#ffffff30" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff15', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />
                <Bar dataKey="bookings" fill="url(#bookingsGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue Trend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff30" style={{ fontSize: '12px' }} />
                <YAxis stroke="#ffffff30" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff15', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />
                <Line type="natural" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} dot={false} fill="url(#revenueGrad)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="animate-in fade-in duration-500 delay-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">View All →</button>
          </div>

          {loading ? (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentBookings.length > 0 ? (
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/20 border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/5">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wide">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wide">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wide">From</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wide">To</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white/70 uppercase tracking-wide">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {recentBookings.map((booking, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4 font-medium text-white">{booking.user?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-white/70">{booking.vehicle?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-white/60 text-sm">{booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                        <td className="px-6 py-4 text-white/60 text-sm">{booking.endDate ? new Date(booking.endDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                        <td className="px-6 py-4 font-bold text-emerald-400 text-right">₹{(booking.totalPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${ booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70'}`}>
                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
              <p className="text-white/50">No bookings available</p>
            </div>
          )}
        </div>

        <div className="animate-in fade-in duration-500 delay-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Live Fleet Status</h2>
            </div>
            <span className="text-sm text-white/50">{liveVehicles.length} active</span>
          </div>

          {liveTrackingLoading && liveVehicles.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-white/5 border border-white/8 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : liveVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {liveVehicles.map((vehicle, idx) => {
                const hasCoordinates = vehicle.latitude && vehicle.longitude && vehicle.latitude !== 0 && vehicle.longitude !== 0
                const isOnline = hasCoordinates && vehicle.status !== 'waiting'

                return (
                  <div
                    key={vehicle.bookingId || vehicle._id || idx}
                    className={`rounded-xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group ${ isOnline ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-400/40' : 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-400/40'}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${ isOnline ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`} />
                        <span className="text-xs font-bold text-white/60">{isOnline ? 'ACTIVE' : 'WAITING'}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm font-bold text-white truncate">{vehicle.vehicleName}</p>
                        <p className="text-xs text-white/50 font-mono">{vehicle.registrationNumber}</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-white/50 mb-0.5">Customer</p>
                          <p className="text-white/80 font-medium truncate">{vehicle.customerName || 'Not assigned'}</p>
                        </div>

                        {vehicle.driverName && (
                          <div>
                            <p className="text-white/50 mb-0.5">Driver</p>
                            <p className="text-white/80 font-medium">{vehicle.driverName}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="w-full px-3 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold rounded-lg text-xs transition-all duration-200 flex items-center justify-center gap-2 border border-cyan-500/30">
                      <MapPin className="w-3.5 h-3.5" />
                      View Live
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
              <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">No active vehicles</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
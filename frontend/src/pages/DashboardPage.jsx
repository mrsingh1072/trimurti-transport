import { BarChart3, Users, TrendingUp, RotateCcw, Download, Filter, Search, MoreVertical, Clock, MapPin, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'

export default function DashboardPage() {
  const { user } = useAuth()
  const [selectedRange, setSelectedRange] = useState('7d')

  // Debug log
  console.log('👤 DashboardPage Current User:', user)

  const userName = user?.name || 'User'

  return (
    <div className="min-h-screen bg-gradient-dark pt-24 pb-12">
      {/* Background Glow */}
      <div className="glow-blob-purple w-96 h-96 top-10 left-0 opacity-40" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}></div>
      <div className="glow-blob-cyan w-96 h-96 top-1/2 right-10 opacity-40" style={{ animation: 'glow-pulse 5s ease-in-out infinite 1s' }}></div>

      <div className="container-max">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-gray-400">Welcome back, {userName}. Here's your business performance overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="glass px-6 py-3 rounded-xl hover:bg-white/10 transition flex items-center gap-2">
              <Filter size={20} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="btn-gradient px-6 py-3 rounded-xl text-white flex items-center gap-2 hover:shadow-glow-purple transition">
              <Download size={20} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              icon: Users, 
              label: 'Active Rentals', 
              value: '2,847',
              change: '+12%',
              positive: true,
              color: 'text-purple-400'
            },
            { 
              icon: TrendingUp, 
              label: 'Total Revenue', 
              value: '$1.2M',
              change: '+24%',
              positive: true,
              color: 'text-cyan-400'
            },
            { 
              icon: BarChart3, 
              label: 'Conversion Rate', 
              value: '3.8%',
              change: '+0.5%',
              positive: true,
              color: 'text-pink-400'
            },
            { 
              icon: RotateCcw, 
              label: 'Return Rate', 
              value: '98.5%',
              change: '+2%',
              positive: true,
              color: 'text-green-400'
            }
          ].map((kpi, i) => (
            <Card key={i} className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition`}>
                  <kpi.icon size={24} className={kpi.color} />
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                  {kpi.change}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
              <h2 className="text-3xl font-bold text-white">{kpi.value}</h2>
            </Card>
          ))}
        </div>

        {/* Main Analytics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Chart Card - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card className="p-8" glow>
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

              {/* Simulated Chart */}
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
                  <p className="text-2xl font-bold text-white">$42,500</p>
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
            </Card>
          </div>

          {/* Top Vehicles Card */}
          <Card className="p-8" glow>
            <h3 className="text-2xl font-bold text-white mb-6">Top Vehicles</h3>
            <div className="space-y-4">
              {[
                { name: 'Mercedes S-Class', bookings: 156, revenue: '$28,400' },
                { name: 'BMW 7 Series', bookings: 142, revenue: '$25,800' },
                { name: 'Audi A8', bookings: 128, revenue: '$22,500' },
                { name: 'Tesla Model S', bookings: 115, revenue: '$19,200' },
                { name: 'Porsche 911', bookings: 98, revenue: '$18,600' }
              ].map((vehicle, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2 group-hover:translate-x-1 transition">
                    <span className="text-white font-medium">{vehicle.name}</span>
                    <span className="text-gray-400 text-sm">{vehicle.bookings}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: `${(vehicle.bookings / 156) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500"></span>
                    <span className="text-xs text-gray-400">{vehicle.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card className="p-8" glow>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Recent Bookings</h3>
                <button className="text-gray-400 hover:text-white transition">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'BK001',
                    customer: 'Rajesh Kumar',
                    vehicle: 'Mercedes S-Class',
                    amount: '$2,400',
                    date: '2 hours ago',
                    status: 'Active'
                  },
                  {
                    id: 'BK002',
                    customer: 'Priya Sharma',
                    vehicle: 'BMW 7 Series',
                    amount: '$1,800',
                    date: '4 hours ago',
                    status: 'Completed'
                  },
                  {
                    id: 'BK003',
                    customer: 'Amit Patel',
                    vehicle: 'Audi A8',
                    amount: '$1,950',
                    date: '6 hours ago',
                    status: 'Active'
                  },
                  {
                    id: 'BK004',
                    customer: 'Neha Singh',
                    vehicle: 'Tesla Model S',
                    amount: '$1,600',
                    date: '8 hours ago',
                    status: 'Completed'
                  },
                  {
                    id: 'BK005',
                    customer: 'Vikram Desai',
                    vehicle: 'Porsche 911',
                    amount: '$3,200',
                    date: '10 hours ago',
                    status: 'Active'
                  }
                ].map((booking, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition group cursor-pointer border border-white/5 hover:border-white/10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{booking.customer[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{booking.customer}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <MapPin size={12} />
                            <span className="truncate">{booking.vehicle}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="font-semibold text-white">{booking.amount}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {booking.date}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Active'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition font-medium">
                View All Bookings
              </button>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="p-8" glow>
            <h3 className="text-2xl font-bold text-white mb-8">Quick Stats</h3>

            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 font-medium">Fleet Utilization</span>
                  <span className="text-white font-bold">87%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-gradient-to-r from-green-500 to-cyan-400 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 font-medium">Customer Satisfaction</span>
                  <span className="text-white font-bold">96%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[96%] bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 font-medium">Payment Success Rate</span>
                  <span className="text-white font-bold">99.2%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[99%] bg-gradient-to-r from-pink-500 to-red-400 rounded-full"></div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h4 className="text-white font-bold mb-4">Key Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg. Booking Value</span>
                    <span className="text-white font-semibold">$2,150</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Customers</span>
                    <span className="text-white font-semibold">8,342</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Repeat Rate</span>
                    <span className="text-white font-semibold">64%</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:shadow-glow-purple transition">
                View Full Analytics
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

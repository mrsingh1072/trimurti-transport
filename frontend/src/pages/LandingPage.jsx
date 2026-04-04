import { Star, Zap, Shield, TrendingUp, ArrowRight, Check, User, Settings, Lock, Car, Bike, Truck, Bus, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { getDashboardStats, getBookingStats } from '../services/api'
import { formatNumber, formatLargeNumber, formatCurrency, formatPercentage } from '../utils/formatters'

export default function LandingPage() {
  const navigate = useNavigate()
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    activeBookings: 0,
    totalRevenue: 0,
    availableVehicles: 0,
    totalVehicles: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to fetch stats
        const statsResponse = await getDashboardStats()
        
        if (statsResponse && typeof statsResponse === 'object') {
          setDashboardData({
            activeBookings: statsResponse.activeBookings || statsResponse.total_bookings || 0,
            totalRevenue: statsResponse.totalRevenue || statsResponse.total_revenue || 0,
            availableVehicles: statsResponse.availableVehicles || statsResponse.available_vehicles || 0,
            totalVehicles: statsResponse.totalVehicles || statsResponse.total_vehicles || 0
          })
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load statistics')
        // Keep default values
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format stat cards dynamically
  const statCards = [
    { 
      label: 'Active Rentals', 
      value: loading ? '...' : formatNumber(dashboardData.activeBookings || 0)
    },
    { 
      label: 'Revenue', 
      value: loading ? '...' : formatLargeNumber(dashboardData.totalRevenue || 0)
    },
    { 
      label: 'Available Vehicles', 
      value: loading ? '...' : formatNumber(dashboardData.availableVehicles || 0)
    },
    { 
      label: 'Total Fleet', 
      value: loading ? '...' : formatNumber(dashboardData.totalVehicles || 0)
    }
  ]
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="section-padding pt-32 relative min-h-screen flex items-center">
        <div className="container-max text-center">
          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="glass px-4 py-2 flex items-center gap-2 mx-auto w-fit">
              <Star size={16} className="text-purple-400" />
              <span className="text-sm text-purple-400 font-semibold tracking-wide">वसुधैव कुटुम्बकम्</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
            <span className="gradient-text">Rent Any Vehicle</span>
            {' '}<br />
            RAnytime, Anywhere
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Trimurti Transport helps you rent cars, bikes, trucks, and more with transparent pricing and instant booking.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20">
            <Link to="/register" className="btn-gradient px-8 py-3 text-white flex items-center gap-2 group w-full sm:w-auto justify-center rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition">
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <button className="glass px-8 py-3 text-white hover:bg-gray-800 transition w-full sm:w-auto rounded-lg">
              Watch Demo
            </button>
          </div>

          {/* Role-based Login Options - Modern Cards */}
          <div className="mt-16 mb-20">
            <p className="text-gray-400 text-sm mb-8 font-medium">Already have an account? Select your role:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {/* Customer Login */}
              <div
                onClick={() => navigate('/login')}
                className="bg-gradient-to-br from-purple-500 to-blue-500 p-8 rounded-xl cursor-pointer hover:scale-105 transition transform duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Customer Login</h3>
                <p className="text-white/80 text-sm leading-relaxed">Book and manage your vehicles with ease</p>
                <div className="mt-6 flex items-center gap-2 text-white text-sm font-semibold">
                  Sign In <ArrowRight size={16} />
                </div>
              </div>

              {/* Staff Portal */}
              <div
                onClick={() => navigate('/staff/login')}
                className="bg-gradient-to-br from-green-500 to-teal-500 p-8 rounded-xl cursor-pointer hover:scale-105 transition transform duration-300 shadow-lg hover:shadow-2xl hover:shadow-green-500/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <Settings size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Staff Portal</h3>
                <p className="text-white/80 text-sm leading-relaxed">Manage bookings and vehicles efficiently</p>
                <div className="mt-6 flex items-center gap-2 text-white text-sm font-semibold">
                  Access Portal <ArrowRight size={16} />
                </div>
              </div>

              {/* Admin Access */}
              <div
                onClick={() => navigate('/admin/login')}
                className="bg-gradient-to-br from-orange-500 to-red-500 p-8 rounded-xl cursor-pointer hover:scale-105 transition transform duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <Lock size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Admin Access</h3>
                <p className="text-white/80 text-sm leading-relaxed">Control and monitor the entire system</p>
                <div className="mt-6 flex items-center gap-2 text-white text-sm font-semibold">
                  Admin Panel <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="mx-auto max-w-3xl">
            <Card className="p-8 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                  <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold gradient-text">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              {error && (
                <div className="mt-4 text-sm text-yellow-500 text-center">
                  {error}. Using default values.
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="section-padding bg-gray-950">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: '<30s Booking', value: 'Lightning Fast', desc: 'Book in seconds' },
              { icon: Shield, label: '99% Uptime', value: 'Reliable', desc: 'Enterprise grade' },
              { icon: TrendingUp, label: '3x ROI', value: 'Proven Results', desc: 'Real impact' },
              { icon: Star, label: '4.9/5 Rating', value: 'Loved by Users', desc: '10K+ reviews' }
            ].map((stat, i) => (
              <Card key={i} className="p-6 text-center">
                <stat.icon size={32} className="mx-auto mb-4 text-purple-400" />
                <p className="text-gray-400 text-sm mb-2 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold gradient-text mb-2">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage premium vehicle rentals at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                title: 'Smart Matching',
                desc: 'AI-powered vehicle recommendations based on customer preferences and requirements'
              },
              {
                icon: Shield,
                title: 'Premium Security',
                desc: 'Enterprise-grade security with real-time vehicle tracking and insurance integration'
              },
              {
                icon: TrendingUp,
                title: 'Analytics Dashboard',
                desc: 'Real-time insights into bookings, revenue, and customer behavior patterns'
              },
              {
                icon: Star,
                title: 'Concierge Service',
                desc: '24/7 white-glove support and personalized rental experiences for VIP customers'
              }
            ].map((feature, i) => (
              <Card key={i} className="p-8 card-hover group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/20 flex-shrink-0">
                    <feature.icon size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding bg-gray-950">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-lg text-gray-400">Four simple steps to premium vehicle rental</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Browse', desc: 'Explore our curated fleet of premium vehicles' },
              { step: '02', title: 'Customize', desc: 'Select dates, add services, and personalize' },
              { step: '03', title: 'Confirm', desc: 'Complete booking with secure payment' },
              { step: '04', title: 'Enjoy', desc: 'Get your vehicle delivered or pick up' }
            ].map((item, i) => (
              <Card key={i} className="p-6 relative group text-center">
                <div className="text-5xl font-black text-purple-500/30 mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
                
                {/* Checkmark on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition absolute top-3 right-3">
                  <Check size={20} className="text-cyan-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Rental Pricing Section */}
      <section id="pricing" className="section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              Vehicle Rental <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Transparent daily rates for every vehicle type. No hidden fees, all-inclusive pricing.
            </p>
          </div>

          {/* Passenger Vehicles */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 ml-4">🚗 Passenger Vehicles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Hatchback Card */}
              <Card className="p-8 hover:border-cyan-500/50 transition group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-cyan-500/20">
                    <Car size={28} className="text-cyan-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300">Popular</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Hatchback</h3>
                <p className="text-gray-400 text-sm mb-6">Compact & fuel-efficient</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹1500</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['5 Seater', 'AC & Power Windows', 'Insurance Included'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-cyan-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition mb-3"
                >
                  Book Now
                </button>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full glass px-6 py-3 text-white rounded-lg hover:bg-white/10 transition"
                >
                  View Vehicles
                </button>
              </Card>

              {/* SUV Card */}
              <Card className="p-8 hover:border-purple-500/50 transition group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Car size={28} className="text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">SUV</h3>
                <p className="text-gray-400 text-sm mb-6">Spacious & comfortable</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹3000</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['7 Seater', 'All-Terrain', 'Premium Interior'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-purple-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition mb-3"
                >
                  Book Now
                </button>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full glass px-6 py-3 text-white rounded-lg hover:bg-white/10 transition"
                >
                  View Vehicles
                </button>
              </Card>

              {/* Luxury Card */}
              <Card className="p-8 hover:border-yellow-500/50 transition group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-yellow-500/20">
                    <Car size={28} className="text-yellow-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">Premium</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Luxury</h3>
                <p className="text-gray-400 text-sm mb-6">Premium & prestigious</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹6000</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['Leather Seats', 'GPS & Sunroof', 'Concierge Service'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-yellow-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition mb-3"
                >
                  Book Now
                </button>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full glass px-6 py-3 text-white rounded-lg hover:bg-white/10 transition"
                >
                  View Vehicles
                </button>
              </Card>
            </div>
          </div>

          {/* Two-Wheelers */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 ml-4">🏍️ Two-Wheelers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Standard Bike */}
              <Card className="p-8 hover:border-green-500/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <Bike size={28} className="text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Standard Bike</h3>
                <p className="text-gray-400 text-sm mb-6">Everyday commuting</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹500</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['Fuel Efficient', 'Easy Handling', 'Helmet & Lock'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-green-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition mb-3"
                >
                  Book Now
                </button>
              </Card>

              {/* Sports Bike */}
              <Card className="p-8 hover:border-red-500/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <Bike size={28} className="text-red-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-300">Thrilling</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sports Bike</h3>
                <p className="text-gray-400 text-sm mb-6">High performance</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹1200</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['High Speed', 'Premium Comfort', 'Safety Gear'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-red-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition mb-3"
                >
                  Book Now
                </button>
              </Card>
            </div>
          </div>

          {/* Commercial Vehicles */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 ml-4">🚚 Commercial Vehicles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Truck Card */}
              <Card className="p-8 hover:border-orange-500/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-orange-500/20">
                    <Truck size={28} className="text-orange-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Truck</h3>
                <p className="text-gray-400 text-sm mb-6">Cargo & logistics</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹4000</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['High Capacity', 'Experienced Driver', 'GPS Tracking'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-orange-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition"
                >
                  Book Now
                </button>
              </Card>

              {/* Bus Card */}
              <Card className="p-8 hover:border-blue-500/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Bus size={28} className="text-blue-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Bus</h3>
                <p className="text-gray-400 text-sm mb-6">Group travel & tours</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹7000</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['50+ Capacity', 'AC & Comfort', 'Tour Assistance'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-blue-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition"
                >
                  Book Now
                </button>
              </Card>

              {/* Tractor Card */}
              <Card className="p-8 hover:border-yellow-600/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-yellow-600/20">
                    <Wrench size={28} className="text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Tractor</h3>
                <p className="text-gray-400 text-sm mb-6">Agricultural use</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹2000</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                <div className="space-y-3 mb-8">
                  {['Farm Equipment', 'Trained Operator', 'Fuel Included'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-yellow-600" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full btn-gradient px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-yellow-600/50 transition"
                >
                  Book Now
                </button>
              </Card>
            </div>
          </div>

          {/* Additional Charges Section */}
          <div className="mt-16 pt-16 border-t border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Additional Charges & Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {/* Driver Charge */}
              <Card className="p-6">
                <div className="p-3 rounded-lg bg-purple-500/20 w-fit mb-4">
                  <User size={24} className="text-purple-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Professional Driver</h4>
                <p className="text-gray-400 text-sm mb-4">Optional service for added convenience</p>
                <div className="text-2xl font-bold text-white">
                  ₹500<span className="text-gray-400 text-sm">/day</span>
                </div>
              </Card>

              {/* Late Return */}
              <Card className="p-6">
                <div className="p-3 rounded-lg bg-orange-500/20 w-fit mb-4">
                  <Wrench size={24} className="text-orange-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Late Return Fee</h4>
                <p className="text-gray-400 text-sm mb-4">Charged for delays beyond rental period</p>
                <div className="text-2xl font-bold text-white">
                  ₹200<span className="text-gray-400 text-sm">/hour</span>
                </div>
              </Card>

              {/* Fuel Policy */}
              <Card className="p-6">
                <div className="p-3 rounded-lg bg-cyan-500/20 w-fit mb-4">
                  <Zap size={24} className="text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Fuel Policy</h4>
                <p className="text-gray-400 text-sm mb-4">Customer responsibility for fuel/electricity</p>
                <div className="text-sm text-cyan-300 font-semibold">
                  Return with same fuel level
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              Trusted by <span className="gradient-text">Industry Leaders</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Omkar singh',
                role: 'CEO, Luxury Corp',
                quote: 'Trimurti transformed how we handle vehicle procurement. Simple, elegant, and powerful.'
              },
              {
                name: 'Rishabh singh',
                role: 'Operations Manager',
                quote: 'The dashboard is intuitive. Our team was productive within hours. Highly impressed.'
              },
              {
                name: 'Ayush Kumar',
                role: 'Founder, Cloth store',
                quote: 'Best investment we made. Saved us 40% on operational costs. Phenomenal support.'
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-8">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic text-sm">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="section-padding bg-gray-950">
        <div className="container-max">
          <Card className="p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Ready to <span className="gradient-text">Transform Your Business?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              Join thousands of successful businesses using Trimurti Transport
            </p>
            <button className="btn-gradient px-10 py-3 text-white inline-flex items-center gap-2 group">
              Create Free Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </button>
            <p className="text-gray-500 text-xs md:text-sm mt-8">
              ✨ No credit card required • 14-day free trial • Full feature access
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800 bg-gray-950">
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <p className="text-gray-500 text-sm">trimurtitransport1072@gmail.com</p>
              <p className="text-gray-500 text-sm">+91 8709905612</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Trimurti Transport. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="https://x.com/Mrsingh1072" className="text-gray-500 hover:text-white transition text-sm">Twitter</a>
              <a href="https://leetcode.com/u/mr_singh1072/" className="text-gray-500 hover:text-white transition text-sm">LinkedIn</a>
              <a href="https://github.com/mrsingh1072" className="text-gray-500 hover:text-white transition text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { Star, Zap, Shield, TrendingUp, ArrowRight, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { getDashboardStats, getBookingStats } from '../services/api'
import { formatNumber, formatLargeNumber, formatCurrency, formatPercentage } from '../utils/formatters'

export default function LandingPage() {
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
              <span className="text-sm text-gray-300">Trusted by premium brands worldwide</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
            <span className="gradient-text">Luxury Vehicle Rental</span>
            {' '}<br />
            Reimagined for Excellence
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Experience the future of premium car rentals. AI-powered matching, transparent pricing, and white-glove service for discerning travelers and businesses.
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

          {/* Role-based Login Links */}
          <div className="mb-12 pb-8 border-b border-gray-800">
            <p className="text-gray-400 text-sm mb-4">Already have an account?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition font-medium">
                🛒 Customer Login
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/staff/login" className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition font-medium">
                👷 Staff Portal
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/admin/login" className="px-4 py-2 text-sm text-amber-400 hover:text-amber-300 transition font-medium">
                🔐 Admin Access
              </Link>
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
                name: 'Rajesh Kumar',
                role: 'CEO, Luxury Corp',
                quote: 'Trimurti transformed how we handle vehicle procurement. Simple, elegant, and powerful.'
              },
              {
                name: 'Priya Sharma',
                role: 'Operations Manager',
                quote: 'The dashboard is intuitive. Our team was productive within hours. Highly impressed.'
              },
              {
                name: 'Amit Patel',
                role: 'Founder, Travel Solutions',
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
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
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
              <p className="text-gray-500 text-sm">contact@trimurti.com</p>
              <p className="text-gray-500 text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2024 Trimurti Transport. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-white transition text-sm">Twitter</a>
              <a href="#" className="text-gray-500 hover:text-white transition text-sm">LinkedIn</a>
              <a href="#" className="text-gray-500 hover:text-white transition text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

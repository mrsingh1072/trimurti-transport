import { Star, Zap, Shield, TrendingUp, ArrowRight, Check } from 'lucide-react'
import Card from '../components/Card'

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="glow-blob-purple w-96 h-96 top-0 left-0" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}></div>
      <div className="glow-blob-cyan w-96 h-96 top-1/3 right-0" style={{ animation: 'glow-pulse 5s ease-in-out infinite 1s' }}></div>
      <div className="glow-blob-blue w-96 h-96 bottom-0 left-1/3" style={{ animation: 'glow-pulse 6s ease-in-out infinite 2s' }}></div>

      {/* Hero Section */}
      <section className="section-padding pt-32 relative">
        <div className="container-max text-center">
          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="glass px-4 py-2 flex items-center gap-2 mx-auto w-fit">
              <Star size={16} className="text-purple-400" />
              <span className="text-sm text-gray-300">Trusted by premium brands worldwide</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text">Luxury Vehicle Rental</span>
            {' '}<br />
            <span className="text-white">Reimagined for Excellence</span>
          </h1>

          {/* Subtext */}
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Experience the future of premium car rentals. AI-powered matching, transparent pricing, and white-glove service for discerning travelers and businesses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20">
            <button className="btn-gradient btn-gradient-hover px-10 py-4 text-lg text-white flex items-center gap-2 group">
              Start Free Trial
              <ArrowRight size={20} className="group-hover:translate-x-2 transition" />
            </button>
            <button className="glass px-10 py-4 text-lg text-white hover:bg-white/10 transition flex items-center gap-2">
              Watch Demo
              <Play size={20} />
            </button>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl -z-10"></div>
            <Card className="p-8 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Rentals', value: '2,847' },
                  { label: 'Revenue', value: '$1.2M' },
                  { label: 'Satisfaction', value: '98.5%' },
                  { label: 'Growth', value: '+156%' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="section-padding relative">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: '<30s Booking', value: 'Lightning Fast', desc: 'Book in seconds' },
              { icon: Shield, label: '98% Reliability', value: 'Industry Leading', desc: 'Zero downtime promise' },
              { icon: TrendingUp, label: '3x ROI', value: 'Proven Results', desc: 'Real business impact' },
              { icon: Star, label: '4.9/5 Rating', value: 'Customer Loved', desc: '10K+ reviews' }
            ].map((stat, i) => (
              <Card key={i} className="p-8 text-center hover:scale-105" glow>
                <stat.icon size={40} className="mx-auto mb-4 text-purple-400" />
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <h3 className="text-2xl font-bold gradient-text mb-1">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding relative">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
              <Card key={i} className="p-8 card-hover group" hover>
                <div className="flex items-start gap-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition">
                    <feature.icon size={28} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
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
      <section id="how-it-works" className="section-padding relative">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-xl text-gray-400">Four simple steps to premium vehicle rental</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Browse', desc: 'Explore our curated fleet of premium vehicles' },
              { step: '02', title: 'Customize', desc: 'Select dates, add services, and personalize' },
              { step: '03', title: 'Confirm', desc: 'Complete booking with secure payment' },
              { step: '04', title: 'Enjoy', desc: 'Get your vehicle delivered or pick up' }
            ].map((item, i) => (
              <Card key={i} className="p-8 relative group" hover>
                <div className="text-6xl font-black bg-gradient-to-br from-purple-500/20 to-cyan-500/20 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 mb-6">{item.desc}</p>
                
                {i < 3 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight size={24} className="text-purple-500/50" />
                  </div>
                )}

                {/* Checkmark on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition absolute top-4 right-4">
                  <Check size={24} className="text-cyan-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="section-padding relative">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
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
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="section-padding relative">
        <div className="container-max">
          <Card className="p-16 text-center glow" glow>
            <h2 className="text-5xl font-black mb-6">
              Ready to <span className="gradient-text">Transform Your Business?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join thousands of successful businesses using Trimurti Transport
            </p>
            <button className="btn-gradient btn-gradient-hover px-12 py-4 text-lg text-white inline-flex items-center gap-2 group">
              Create Free Account
              <ArrowRight size={20} className="group-hover:translate-x-2 transition" />
            </button>
            <p className="text-gray-500 text-sm mt-8">✨ No credit card required • 14-day free trial • Full feature access</p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">contact@trimurti.com</p>
              <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm">© 2024 Trimurti Transport. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Play(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  )
}

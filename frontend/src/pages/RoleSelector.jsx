import { useNavigate } from 'react-router-dom'
import { ShoppingCart, UserCheck, Shield, ArrowRight } from 'lucide-react'
import GlassCard from '../components/GlassCard'

/**
 * Role Selector Page
 * - Main landing page for login selection
 * - Shows role options with descriptions
 * - Guides users to the appropriate login page
 */
export default function RoleSelector() {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      subtitle: 'Rent vehicles',
      description: 'Book and manage vehicle rentals with ease',
      icon: ShoppingCart,
      accentColor: 'from-blue-500 to-cyan-500',
      accentBorderColor: 'border-blue-500/30 bg-blue-500/5',
      accentTextColor: 'text-blue-400',
      path: '/login',
      features: ['Browse vehicles', 'Make bookings', 'Track payments']
    },
    {
      id: 'staff',
      title: 'Staff',
      subtitle: 'Manage operations',
      description: 'Staff portal for vehicle and booking management',
      icon: UserCheck,
      accentColor: 'from-purple-500 to-pink-500',
      accentBorderColor: 'border-purple-500/30 bg-purple-500/5',
      accentTextColor: 'text-purple-400',
      path: '/staff/login',
      features: ['Manage bookings', 'Track vehicles', 'Process returns'],
      requiresApproval: true
    },
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'System administration',
      description: 'Administrator portal for system management',
      icon: Shield,
      accentColor: 'from-red-600 to-orange-500',
      accentBorderColor: 'border-red-500/30 bg-red-500/5',
      accentTextColor: 'text-red-400',
      path: '/admin/login',
      features: ['Manage users', 'System settings', 'View reports'],
      requiresApproval: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-4xl">T</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Trimurti Transport
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Select your role to access the appropriate portal
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <GlassCard
                key={role.id}
                className="p-8 flex flex-col h-full hover:border-white/30 transition cursor-pointer group"
                glow
              >
                {/* Icon */}
                <div className={`bg-gradient-to-br ${role.accentColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <Icon size={28} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-1">
                  {role.title}
                </h3>
                <p className={`text-sm font-medium ${role.accentTextColor} mb-3`}>
                  {role.subtitle}
                </p>
                <p className="text-gray-400 text-sm mb-5">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-grow">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className={`${role.accentTextColor} font-bold`}>•</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Approval Badge */}
                {role.requiresApproval && (
                  <div className="mb-4 p-2 rounded-lg bg-purple-900/30 border border-purple-700/50">
                    <p className="text-xs text-purple-400 text-center">
                      ✓ Admin approval required
                    </p>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => navigate(role.path)}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition group/btn bg-gradient-to-r ${role.accentColor} text-white hover:shadow-lg`}
                  style={{
                    boxShadow: `0 0 20px rgba(${role.id === 'customer' ? '59, 130, 246' : role.id === 'staff' ? '168, 85, 247' : '220, 38, 38'}, 0.3)`
                  }}
                >
                  {role.title} Login
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition" />
                </button>
              </GlassCard>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-6 border-cyan-500/30 bg-cyan-500/5">
            <div className="flex gap-4">
              <div className="text-2xl flex-shrink-0">ℹ️</div>
              <div>
                <h4 className="font-semibold text-white mb-2">Choosing the right portal</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Each portal provides role-specific features and functionality. Select the role that matches your account type. If you're unsure which portal to use, contact your administrator.
                </p>
                <p className="text-xs text-gray-500">
                  💡 <span className="text-cyan-400">Tip:</span> You can bookmark your role's login page for quick access next time.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Having trouble logging in?{' '}
            <a href="/contact" className="text-purple-400 hover:text-purple-300 transition">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

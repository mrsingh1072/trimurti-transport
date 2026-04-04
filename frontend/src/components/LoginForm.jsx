import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react'
import GlassCard from './GlassCard'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

/**
 * Reusable LoginForm Component
 * @param {Object} props
 * @param {string} props.role - 'customer', 'staff', or 'admin'
 * @param {string} props.title - Main title (e.g., "Customer Login")
 * @param {string} props.subtitle - Subtitle description
 * @param {string} props.accentColor - Tailwind color class (e.g., 'from-blue-500 to-cyan-500')
 * @param {string} props.glowColor - Glow effect color (e.g., 'cyan-500')
 * @param {Object} props.roleConfig - Role-specific configuration
 */
export default function LoginForm({
  role = 'customer',
  title = 'Welcome Back',
  subtitle = 'Sign in to your account',
  accentColor = 'from-purple-500 to-cyan-500',
  glowColor = 'cyan-500',
  roleConfig = {}
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Role configuration defaults
  const config = {
    showSignUp: true,
    signUpText: 'Create Customer Account',
    signUpLink: '/register',
    infoMessage: null,
    warningMessage: null,
    successMessage: null,
    badge: null,
    ...roleConfig
  }

  useEffect(() => {
    // Show message from registration or other sources
    if (location.state?.message) {
      setMessage(location.state.message)
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Send role info with login request for security
      const response = await loginUser({ 
        email, 
        password, 
        requestedRole: role 
      })
      
      if (response && response.token) {
        const userRole = response.user?.role
        
        // Security check: ensure user role matches the login page role
        // (staff can't login on customer page, etc.)
        const roleValidation = validateRole(userRole, role)
        
        if (!roleValidation.valid) {
          setError(roleValidation.message)
          setLoading(false)
          return
        }
        
        login(response.user, response.token)
        
        // Debug: verify user was stored
        console.log('✅ Login Success - User stored:', response.user)
        console.log('📦 User from localStorage:', localStorage.getItem('user'))
        
        // Role-based redirection
        if (userRole === 'admin') {
          navigate('/admin')
        } else if (userRole === 'staff') {
          navigate('/staff')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password'
      if (errorMsg.includes('pending')) {
        setError('Your account is pending admin approval. Please wait for activation.')
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Validate that the user's role matches the login page they're on
   */
  const validateRole = (userRole, pageRole) => {
    // Allow role matching
    if (userRole === pageRole) {
      return { valid: true }
    }
    
    // Security: staff trying to login on customer page
    if (pageRole === 'customer' && userRole !== 'customer') {
      return {
        valid: false,
        message: `This is a ${pageRole} login page. Please use the appropriate login page for your role.`
      }
    }
    
    // Security: admin trying to login on customer/staff page
    if (pageRole !== 'admin' && userRole === 'admin') {
      return {
        valid: false,
        message: `This is a ${pageRole} login page. Admin access is restricted to the admin portal.`
      }
    }
    
    // Default validation
    return {
      valid: false,
      message: `Your account role (${userRole}) does not match this login page. Please use the correct portal.`
    }
  }

  const gradientClass = `bg-gradient-to-r ${accentColor}`

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className={`fixed top-10 left-1/3 w-96 h-96 bg-${glowColor}/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none`}></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <GlassCard className="w-full max-w-md p-8" glow>
        {/* Header */}
        <div className="text-center mb-8">
          {/* Role Badge */}
          {config.badge && (
            <div className="mb-4 inline-block">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge.className}`}>
                {config.badge.text}
              </span>
            </div>
          )}

          {/* Icon/Logo */}
          <div className={`${gradientClass} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <span className="text-white font-bold text-2xl">T</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{subtitle}</p>
        </div>

        {/* Role-specific Messages */}
        {config.infoMessage && (
          <div className={`mb-6 p-3 rounded-lg ${config.infoMessage.className}`}>
            <p className={`text-xs ${config.infoMessage.textColor}`}>
              {config.infoMessage.icon} <span className="font-medium">{config.infoMessage.text}</span>
            </p>
          </div>
        )}

        {config.warningMessage && (
          <div className={`mb-6 p-4 rounded-lg ${config.warningMessage.className}`}>
            <div className="flex items-start gap-3">
              <div className={`text-2xl flex-shrink-0 mt-0.5`}>{config.warningMessage.icon}</div>
              <div>
                <p className={`font-semibold ${config.warningMessage.titleColor} mb-1`}>
                  {config.warningMessage.title}
                </p>
                <p className={`text-sm ${config.warningMessage.textColor}`}>
                  {config.warningMessage.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {config.successMessage && (
          <div className={`mb-6 p-4 rounded-lg ${config.successMessage.className}`}>
            <p className={`text-sm ${config.successMessage.textColor}`}>
              {config.successMessage.icon} {config.successMessage.text}
            </p>
          </div>
        )}

        {/* Success Message from Navigation */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>{message}</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition disabled:cursor-not-allowed"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-300">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded bg-white/10 border border-white/20"
                disabled={loading}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 transition">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${gradientClass} text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50`}
          >
            {loading && <Loader size={20} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider & Sign Up Section */}
        {config.showSignUp && (
          <>
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-gray-500 text-sm">New to Trimurti?</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <Link
              to={config.signUpLink}
              className="block w-full text-center py-3 border border-green-500/30 bg-green-500/5 text-green-400 rounded-xl hover:bg-green-500/10 transition font-medium"
            >
              🛒 {config.signUpText}
            </Link>
          </>
        )}

        {/* Custom Footer Content */}
        {config.footerContent && (
          <div className="mt-6">
            {config.footerContent}
          </div>
        )}

        {/* Demo Credentials (only for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-400 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-400">Email: {role === 'admin' ? 'admin@trimurti.com' : role === 'staff' ? 'staff@trimurti.com' : 'customer@trimurti.com'}</p>
            <p className="text-xs text-gray-400">Pass: password123</p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

import LoginForm from '../components/LoginForm'

/**
 * Admin Login Page
 * - Secure/professional look
 * - No signup option
 * - Red/Orange theme
 * - "Authorized personnel only" message
 * - Admin Access title
 */
export default function AdminLoginPage() {
  const adminConfig = {
    showSignUp: false,
    badge: {
      text: '🔐 Admin Access',
      className: 'bg-red-600 text-red-100 border border-red-500'
    },
    infoMessage: {
      icon: '🔒',
      text: 'Administrator credentials required',
      className: 'bg-red-500/10 border border-red-500/20',
      textColor: 'text-red-400'
    },
    warningMessage: {
      icon: '⚠️',
      title: 'Authorized Personnel Only',
      text: 'This portal is restricted to system administrators. Unauthorized access attempts are logged. By logging in, you agree to the administrator terms and security policies.',
      titleColor: 'text-red-300',
      textColor: 'text-red-200',
      className: 'bg-red-900/30 border border-red-700/50 rounded-lg'
    },
    footerContent: (
      <div className="space-y-4">
        {/* Security Guidelineselines */}
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400 font-medium mb-2">🛡️ Security Guidelines</p>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• Use strong, unique passwords</li>
            <li>• Change password every 90 days</li>
            <li>• Enable two-factor authentication</li>
            <li>• Log out after each session</li>
            <li>• Report suspicious activity immediately</li>
          </ul>
        </div>

        {/* Activity Notice */}
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-xs text-orange-400">
            📝 All admin activities are logged and monitored for security and compliance purposes.
          </p>
        </div>

        {/* Support */}
        <div className="text-center text-xs text-gray-500">
          <p>Need help? <span className="text-red-400">admin-support@trimurti.com</span></p>
        </div>
      </div>
    )
  }

  return (
    <LoginForm
      role="admin"
      title="Admin Access"
      subtitle="Trimurti Transport Administration Console"
      accentColor="from-red-600 to-orange-500"
      glowColor="red-500"
      roleConfig={adminConfig}
    />
  )
}

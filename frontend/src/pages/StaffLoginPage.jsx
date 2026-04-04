import LoginForm from '../components/LoginForm'

/**
 * Staff Login Page
 * - Professional UI
 * - No signup option (managed by admins)
 * - Purple theme
 * - Staff Portal badge
 * - Shows approval message
 */
export default function StaffLoginPage() {
  const staffConfig = {
    showSignUp: false,
    badge: {
      text: '👷 Staff Portal',
      className: 'bg-purple-600 text-purple-100 border border-purple-500'
    },
    infoMessage: {
      icon: '⚙️',
      text: 'Staff accounts are managed by administrators',
      className: 'bg-purple-500/10 border border-purple-500/20',
      textColor: 'text-purple-400'
    },
    warningMessage: {
      icon: '✓',
      title: 'Account Approval Required',
      text: 'Staff accounts are created and approved by administrators. Once approved, you can access this portal.',
      titleColor: 'text-purple-300',
      textColor: 'text-purple-200',
      className: 'bg-purple-900/30 border border-purple-700/50 rounded-lg'
    },
    footerContent: (
      <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <p className="text-xs text-purple-400 font-medium mb-2">📋 Pre-Approval Checklist</p>
        <ul className="space-y-2 text-xs text-gray-400">
          <li>✓ Account created by administrator</li>
          <li>✓ Credentials provided by email</li>
          <li>✓ Role and permissions assigned</li>
          <li>✓ Welcome email received</li>
        </ul>
        <p className="mt-3 text-xs text-purple-400">
          Questions? Contact your administrator or support@trimurti.com
        </p>
      </div>
    )
  }

  return (
    <LoginForm
      role="staff"
      title="Staff Portal"
      subtitle="Access your Trimurti Transport staff account"
      accentColor="from-purple-500 to-pink-500"
      glowColor="purple-500"
      roleConfig={staffConfig}
    />
  )
}

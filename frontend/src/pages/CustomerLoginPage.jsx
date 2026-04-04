import LoginForm from '../components/LoginForm'

/**
 * Customer Login Page
 * - Friendly and welcoming
 * - Includes sign-up option
 * - Blue/Teal theme
 * - Focus on ease of access
 */
export default function CustomerLoginPage() {
  const customerConfig = {
    showSignUp: true,
    signUpText: '🛒 Create Customer Account',
    signUpLink: '/register',
    infoMessage: {
      icon: '💡',
      text: 'Easy access with a few clicks',
      className: 'bg-blue-500/10 border border-blue-500/20',
      textColor: 'text-blue-400'
    },
    footerContent: (
      <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
        <p className="text-xs text-cyan-400 font-medium mb-2">First time here?</p>
        <p className="text-xs text-gray-400 mb-3">Create an account to browse vehicles, make bookings, and manage your reservations with Trimurti Transport.</p>
        <div className="space-y-1 text-xs text-gray-500">
          <p>✓ Quick account creation</p>
          <p>✓ Secure payment processing</p>
          <p>✓ Easy booking management</p>
        </div>
      </div>
    )
  }

  return (
    <LoginForm
      role="customer"
      title="Customer Login"
      subtitle="Sign in to your Trimurti Transport account"
      accentColor="from-blue-500 to-cyan-500"
      glowColor="blue-500"
      roleConfig={customerConfig}
    />
  )
}

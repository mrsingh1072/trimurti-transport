import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Settings, Bell, Lock, DollarSign, Eye } from 'lucide-react'

const defaultSettings = {
  companyName: 'Timurti Transport',
  email: 'admin@timurti.com',
  phone: '+91-9999999999',
  address: 'Mumbai, India',
  commissionPercentage: 15,
  cancellationCharges: 20,
  emailNotifications: true,
  smsNotifications: true,
  bookingAlerts: true,
  paymentAlerts: true,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('company')

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem('adminSettings')
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Error saving settings:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-400">Manage application settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          {[
            { id: 'company', label: 'Company', icon: Settings },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'billing', label: 'Billing', icon: DollarSign },
            { id: 'security', label: 'Security', icon: Lock },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Company Settings */}
        {activeTab === 'company' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
              { key: 'smsNotifications', label: 'SMS Notifications', description: 'Get quick alerts via SMS' },
              { key: 'bookingAlerts', label: 'Booking Alerts', description: 'Notify for new bookings and updates' },
              { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Notify for payment activities' },
            ].map(option => (
              <div key={option.key} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition">
                <div>
                  <h4 className="text-white font-medium">{option.label}</h4>
                  <p className="text-gray-400 text-sm mt-1">{option.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[option.key]}
                    onChange={(e) => handleChange(option.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === 'billing' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Commission Percentage (%)</label>
                <input
                  type="number"
                  value={settings.commissionPercentage}
                  onChange={(e) => handleChange('commissionPercentage', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cancellation Charges (%)</label>
                <input
                  type="number"
                  value={settings.cancellationCharges}
                  onChange={(e) => handleChange('cancellationCharges', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Eye size={18} />
                Preview
              </h4>
              <div className="space-y-2 text-gray-300">
                <p>Commission on ₹10,000 booking: ₹{(10000 * settings.commissionPercentage / 100).toFixed(2)}</p>
                <p>Cancellation charge on ₹10,000 booking: ₹{(10000 * settings.cancellationCharges / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
            <div className="border-l-4 border-yellow-500 bg-yellow-500/10 rounded p-4">
              <h4 className="text-yellow-300 font-medium mb-2">Password & Security</h4>
              <p className="text-gray-400 text-sm">Change your password regularly to keep your account secure</p>
            </div>

            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
              Change Password
            </button>

            <div className="space-y-4">
              <h4 className="text-white font-medium">Two-Factor Authentication</h4>
              <p className="text-gray-400">Enable 2FA for enhanced security</p>
              <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                Enable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saved && <p className="text-green-400 flex items-center gap-2"><span>✓</span>Settings saved successfully</p>}
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

import { useState } from 'react'
import { User, Mail, Phone, Lock, Edit2, Save, X } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { useShowToast } from '../components/ToastContainer'
import { updateUser } from '../services/api'

export default function ProfilePage() {
  const { user } = useAuth()
  const { success, error } = useShowToast()
  const [isEditing, isEditingProfile] = useState(false)

  // Debug logging
  console.log('✅ ProfilePage is rendering')
  console.log('📱 Current user:', user)
  console.log('🔐 User ID:', user?._id)
  console.log('📧 User email:', user?.email)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateProfile = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits'
    }
    return newErrors
  }

  const validatePassword = () => {
    const newErrors = {}
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required'
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required'
    if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    return newErrors
  }

  const handleSaveProfile = async () => {
    const newErrors = validateProfile()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // Call API to update profile
      const response = await updateUser(user._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      })

      // Update localStorage with new user data
      const updatedUser = { ...user, ...response.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Show success message
      success('Profile updated successfully!')
      isEditingProfile(false)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile'
      error(errorMsg)
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    const newErrors = validatePassword()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // Call API to change password
      await updateUser(user._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      // Show success message
      success('Password changed successfully!')
      setShowPasswordChange(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to change password'
      error(errorMsg)
      console.error('Password change error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-16 px-4">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto mt-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Profile Avatar */}
        <Card className="p-8 mb-8 text-center" glow>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{user?.name || 'User'}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <span className="inline-block mt-4 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-medium border border-cyan-500/30">
            {user?.role?.toUpperCase() || 'CUSTOMER'}
          </span>
        </Card>

        {/* Personal Information */}
        <GlassCard className="p-8 mb-8" glow>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Personal Information</h3>
            {!isEditing && (
              <button
                onClick={() => isEditingProfile(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition border border-cyan-500/30"
              >
                <Edit2 size={18} />
                Edit
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <User size={20} className="text-cyan-400" />
                  <p className="text-white font-medium">{user?.name || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email</label>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Mail size={20} className="text-cyan-400" />
                  <p className="text-white font-medium">{user?.email || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Phone</label>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Phone size={20} className="text-cyan-400" />
                  <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/40 transition disabled:opacity-50"
                >
                  <Save size={20} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    isEditingProfile(false)
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || ''
                    })
                    setErrors({})
                  }}
                  className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/5 transition"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Security Section */}
        <GlassCard className="p-8" glow>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Security</h3>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition border border-purple-500/30"
              >
                <Lock size={18} />
                Change Password
              </button>
            )}
          </div>

          {!showPasswordChange ? (
            <div className="space-y-4">
              <p className="text-gray-400">
                Keep your account secure by using a strong password.
              </p>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-purple-300 text-sm">
                  ✓ Your password is encrypted and stored securely<br/>
                  ✓ Change your password regularly for better security
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                />
                {errors.currentPassword && <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                />
                {errors.newPassword && <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                />
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition disabled:opacity-50"
                >
                  <Lock size={20} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    setErrors({})
                  }}
                  className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/5 transition"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

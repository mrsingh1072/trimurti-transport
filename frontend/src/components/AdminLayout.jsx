import { useState } from 'react'
import { Menu, X, BarChart3, Truck, FileText, Settings, LogOut, Users, CreditCard, CheckCircle, User, AlertCircle, MessageCircle } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Debug log
  console.log('👤 AdminLayout Current User:', user)

  const userName = user?.name || 'Administrator'
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/bookings', label: 'Bookings', icon: FileText },
    { path: '/admin/vehicles', label: 'Vehicles', icon: Truck },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/waivers', label: 'Waivers', icon: AlertCircle },
    { path: '/admin/feedback', label: 'Feedback', icon: MessageCircle },
    { path: '/admin/staff-approvals', label: 'Staff Approvals', icon: CheckCircle },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white transition"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {isSidebarOpen && (
            <div className="ml-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="gradient-text font-bold">Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/50 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-20 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-white">Admin Control Panel</h1>
          
          {/* User Profile */}
          <div className="flex items-center gap-3 pl-6 border-l border-gray-700">
            <div>
              <p className="text-white font-medium text-sm">{userName}</p>
              <p className="text-gray-400 text-xs">{userRole}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8 bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  )
}

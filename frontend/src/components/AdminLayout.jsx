import { useState } from 'react'
import { Menu, X, BarChart3, Truck, FileText, Settings, LogOut, Users, CreditCard, CheckCircle, User, AlertCircle, MessageCircle, MapPin } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
    { path: '/admin/tracking', label: 'Live Tracking', icon: MapPin },
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
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-800 to-slate-900 border-r border-white/8 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/8">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {isSidebarOpen && (
            <div className="ml-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-white font-black text-sm">T</span>
              </div>
              <div className="font-black text-white text-lg tracking-tight">TT</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={`transition-colors duration-200 ${isActive(item.path) ? 'text-cyan-400' : 'group-hover:text-white/80'}`} />
                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-20 bg-gradient-to-r from-slate-800/40 to-slate-900/40 border-b border-white/8 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-50">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          
          {/* User Profile */}
          <div className="flex items-center gap-4 pl-8 border-l border-white/8">
            <div className="text-right">
              <p className="text-white font-semibold text-sm">{userName}</p>
              <p className="text-white/50 text-xs">{userRole}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <User size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-7 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}

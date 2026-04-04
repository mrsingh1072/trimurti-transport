import { Bell, Search, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { user } = useAuth()

  // Debug log
  console.log('👤 Topbar Current User:', user)

  const userName = user?.name || 'User'
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Role'

  return (
    <div className="fixed top-0 right-0 left-0 ml-64 h-20 bg-gradient-to-r from-gray-950/80 to-gray-900/80 backdrop-blur-xl border-b border-purple-500/10 flex items-center justify-between px-8 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search bookings, vehicles..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 ms-8">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div>
            <p className="text-white font-medium text-sm">{userName}</p>
            <p className="text-gray-400 text-xs">{userRole}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

import { LayoutDashboard, Truck, Calendar, RotateCcw, Settings, LogOut, ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Sidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Truck, label: 'Vehicles', path: '/dashboard/vehicles' },
    { icon: Calendar, label: 'Bookings', path: '/dashboard/bookings' },
    { icon: RotateCcw, label: 'Returns', path: '/dashboard/returns' },
    { icon: Settings, label: 'Admin', path: '/dashboard/admin' }
  ]

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border-r border-purple-500/20 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} pt-6 z-40 flex flex-col`}>
      {/* Collapse Button */}
      <div className="flex items-center justify-between px-4 mb-8">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="gradient-text font-bold">Trimurti</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
        >
          <ChevronLeft size={20} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-white border border-purple-500/50 shadow-glow-purple'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}

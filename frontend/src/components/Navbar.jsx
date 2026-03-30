import { Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950 border-b border-gray-800">
      <div className="container-max flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="gradient-text font-bold text-xl">Trimurti</span>
        </Link>

        {/* Desktop Menu */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-8">
            <Link to="/vehicles" className="text-gray-300 hover:text-white transition">Vehicles</Link>
            <Link to="/my-bookings" className="text-gray-300 hover:text-white transition">My Bookings</Link>
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
          </div>
        )}

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 pr-4 border-r border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 text-white hover:text-red-400 transition flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-6 py-2 text-white hover:text-purple-400 transition">
                Sign In
              </Link>
              <Link to="/register" className="btn-gradient px-6 py-2 text-white">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800">
          <div className="container-max py-4 flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <div className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 mb-2">
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
                <Link to="/vehicles" className="text-gray-300 hover:text-white transition">Vehicles</Link>
                <Link to="/my-bookings" className="text-gray-300 hover:text-white transition">My Bookings</Link>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="px-6 py-3 text-red-400 hover:text-red-300 transition text-left flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                <Link to="/login" className="text-white hover:text-purple-400 transition">
                  Sign In
                </Link>
                <Link to="/register" className="btn-gradient px-6 py-2 text-white w-full text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

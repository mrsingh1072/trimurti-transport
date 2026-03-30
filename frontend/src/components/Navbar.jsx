import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950 border-b border-gray-800">
      <div className="container-max flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="gradient-text font-bold text-xl">Trimurti</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => onNavigate('landing')}
            className="px-6 py-2 text-white hover:text-purple-400 transition"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="btn-gradient px-6 py-2 text-white"
          >
            Get Started
          </button>
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
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <button 
              onClick={() => { onNavigate('landing'); setIsOpen(false) }}
              className="text-white hover:text-purple-400 transition"
            >
              Sign In
            </button>
            <button 
              onClick={() => { onNavigate('dashboard'); setIsOpen(false) }}
              className="btn-gradient px-6 py-2 text-white w-full text-center"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

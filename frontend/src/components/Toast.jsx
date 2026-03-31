import { useEffect } from 'react'
import { Check, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  }[type]

  const Icon = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
  }[type]

  return (
    <div className={`fixed top-4 right-4 max-w-sm z-50 animate-slide-in`}>
      <div className={`border rounded-lg p-4 flex items-center gap-3 ${bgColor} backdrop-blur-sm`}>
        <Icon size={20} />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto hover:opacity-75 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

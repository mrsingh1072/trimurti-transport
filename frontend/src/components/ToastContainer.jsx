import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

// Create a global toast context and provider
export const useToast = (() => {
  let listeners = []
  let id = 0

  return {
    subscribe: (listener) => {
      listeners.push(listener)
      return () => {
        listeners = listeners.filter(l => l !== listener)
      }
    },
    show: (message, type = 'info', duration = 4000) => {
      const toastId = id++
      const toast = { id: toastId, message, type, duration }
      listeners.forEach(listener => listener(toast))
      return toastId
    }
  }
})()

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unsubscribe = useToast.subscribe((toast) => {
      setToasts(prev => [...prev, toast])
      
      if (toast.duration > 0) {
        setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration)
      }
    })

    return unsubscribe
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'info':
      default:
        return <Info size={20} />
    }
  }

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-200'
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-200'
      case 'info':
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${getColors(toast.type)} animate-in fade-in slide-in-from-right-4`}
        >
          <div className="flex-shrink-0">
            {getIcon(toast.type)}
          </div>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-2 hover:opacity-70 transition"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}

// Helper hook to use toast from Components
export const useShowToast = () => {
  return {
    success: (message) => useToast.show(message, 'success', 4000),
    error: (message) => useToast.show(message, 'error', 5000),
    info: (message) => useToast.show(message, 'info', 4000),
    custom: (message, type, duration) => useToast.show(message, type, duration)
  }
}

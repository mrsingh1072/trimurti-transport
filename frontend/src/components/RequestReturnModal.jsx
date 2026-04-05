import { useState } from 'react'
import { X, Send, Loader, AlertCircle } from 'lucide-react'
import { requestReturn as requestReturnAPI } from '../services/api'

export default function RequestReturnModal({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestReturn = async () => {
    if (!booking._id) return

    setLoading(true)
    setError('')

    try {
      const response = await requestReturnAPI(booking._id)
      setLoading(false)
      onSuccess(response.booking)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request return')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Request Return</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Booking Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Vehicle</p>
          <p className="text-white font-semibold text-lg mb-4">{booking.vehicle?.name}</p>
          
          <p className="text-gray-400 text-sm mb-2">Scheduled Return</p>
          <p className="text-white font-semibold">
            {new Date(booking.endDate).toLocaleDateString()} at {new Date(booking.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-2 text-red-300 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Message */}
        <p className="text-gray-300 text-sm mb-6">
          Confirm that you're ready to return the vehicle. Our staff will process your return and calculate any applicable fees.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-500/30 text-gray-300 hover:bg-white/5 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleRequestReturn}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={16} />
                Request Return
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

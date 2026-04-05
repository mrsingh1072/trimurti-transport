import { useState } from 'react'
import { X, Send, Loader, AlertCircle } from 'lucide-react'
import { requestWaiver as requestWaiverAPI } from '../services/api'

export default function RequestWaiverModal({ booking, onClose, onSuccess }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalPenalty = (booking.lateFee || 0) + (booking.damageFee || 0)
  const canRequestWaiver = totalPenalty > 0

  const handleRequestWaiver = async () => {
    if (!booking._id || !canRequestWaiver) return

    setLoading(true)
    setError('')

    try {
      const response = await requestWaiverAPI(booking._id, reason)
      setLoading(false)
      onSuccess(response.booking)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request waiver')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Request Penalty Waiver</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Penalty Info */}
        {canRequestWaiver ? (
          <div className="mb-6 p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <p className="text-gray-400 text-sm mb-2">Current Penalties</p>
            <div className="space-y-2 text-white font-semibold">
              {booking.lateFee > 0 && (
                <div className="flex justify-between text-orange-300">
                  <span>Late Fee</span>
                  <span>₹ {booking.lateFee.toLocaleString()}</span>
                </div>
              )}
              {booking.damageFee > 0 && (
                <div className="flex justify-between text-red-300">
                  <span>Damage Fee</span>
                  <span>₹ {booking.damageFee.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-orange-500/30 flex justify-between">
                <span>Total Penalty</span>
                <span className="text-orange-300">₹ {totalPenalty.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-sm">No penalties to waive. You're all set!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-2 text-red-300 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Reason Input */}
        {canRequestWaiver && (
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-300 mb-2 block">
              Reason for Waiver Request (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you believe the penalties should be waived..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition resize-none"
              rows="4"
            />
          </div>
        )}

        {/* Message */}
        <p className="text-gray-300 text-sm mb-6">
          {canRequestWaiver 
            ? "Submit a waiver request for the penalties. Our staff will review and respond to your request."
            : "Your booking has no pending penalties."
          }
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-500/30 text-gray-300 hover:bg-white/5 transition font-semibold"
          >
            Close
          </button>
          {canRequestWaiver && (
            <button
              onClick={handleRequestWaiver}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Request
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

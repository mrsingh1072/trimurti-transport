import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import StarRating from './StarRating'
import { submitFeedback } from '../services/api'

export default function FeedbackModal({ isOpen, booking, onClose, onSuccess }) {
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !booking) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (message.trim().length < 10) {
      setError('Feedback message must be at least 10 characters')
      return
    }

    setLoading(true)

    try {
      await submitFeedback({
        bookingId: booking._id,
        rating,
        message: message.trim(),
      })

      setMessage('')
      setRating(0)
      
      if (onSuccess) {
        onSuccess()
      }
      
      onClose()
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 rounded-2xl p-6 max-w-md w-full border border-cyan-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Share Your Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Vehicle</p>
          <p className="text-lg font-semibold text-white">
            {booking.vehicle?.name || 'Vehicle'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {booking.vehicle?.category || 'N/A'}
          </p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-300 mb-3">Rate Your Experience</p>
          <StarRating 
            rating={rating} 
            onRatingChange={setRating} 
            interactive={!loading}
            size="lg"
          />
          <p className="text-xs text-gray-500 mt-2">
            {rating > 0 ? `You rated this ${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
          </p>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-300 block mb-2">
            Your Feedback (10+ characters)
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tell us about your experience with the vehicle and rental service..."
            className="w-full bg-white/5 border border-cyan-500/30 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500/60 focus:bg-white/10 transition"
            rows={4}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {message.length} characters
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition disabled:opacity-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0 || message.trim().length < 10}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/40 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

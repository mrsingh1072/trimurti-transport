import { useState, useEffect, useRef } from 'react'
import { Star, Send, Loader, AlertCircle, CheckCircle, ArrowLeft, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { submitFeedback, getUserBookings } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import StarRating from '../components/StarRating'

export default function FeedbackPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  
  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [feedbackType, setFeedbackType] = useState('booking') // 'booking' or 'general'

  useEffect(() => {
    fetchCompletedBookings()
  }, [])

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [dropdownOpen])

  const fetchCompletedBookings = async () => {
    setLoading(true)
    try {
      const data = await getUserBookings()
      const allBookings = Array.isArray(data) ? data : data.bookings || []
      
      // Filter for completed bookings (with returnStatus or status = completed)
      const completedBookings = allBookings.filter(b => 
        b.returnStatus === 'processed' || b.status?.toLowerCase() === 'completed'
      )
      
      setBookings(completedBookings)
      console.log('📋 Completed bookings fetched:', completedBookings.length)
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setError('Failed to load your completed bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (feedbackType === 'booking' && !selectedBooking) {
      setError('Please select a booking for this feedback')
      return
    }

    if (rating === 0) {
      setError('Please select a rating (1-5 stars)')
      return
    }

    if (message.trim().length < 10) {
      setError('Feedback message must be at least 10 characters')
      return
    }

    setSubmitting(true)

    try {
      const feedbackData = {
        rating,
        message: message.trim(),
      }

      // Only include bookingId if not general feedback
      if (feedbackType === 'booking' && selectedBooking) {
        feedbackData.bookingId = selectedBooking
      }

      await submitFeedback(feedbackData)

      console.log('✓ Feedback submitted successfully')
      setSuccess(true)
      
      // Reset form
      setMessage('')
      setRating(0)
      setSelectedBooking('')
      setFeedbackType('booking')

      // Show success for 3 seconds then redirect
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 pb-16 px-4">
        {/* Background Glow */}
        <div className="fixed top-10 left-1/3 w-96 h-96 bg-green-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <Card className="p-12 text-center" glow>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle size={48} className="text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-gray-400 text-lg mb-6">
              Your feedback has been submitted successfully. We appreciate your input and will use it to improve our service.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Redirecting to dashboard in a few seconds...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/40 transition font-semibold"
            >
              Go to Dashboard Now
            </button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-16 px-4">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Share Your Feedback</span>
          </h1>
          <p className="text-gray-400">Help us improve by sharing your experience</p>
        </div>

        {/* Feedback Type Selection */}
        <Card className="p-6 mb-8" glow>
          <p className="text-sm font-semibold text-gray-300 mb-4">Feedback Type</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setFeedbackType('booking')
                setSelectedBooking('')
                setDropdownOpen(false)
              }}
              className={`flex-1 px-4 py-3 rounded-lg border transition font-medium ${
                feedbackType === 'booking'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              About a Booking
            </button>
            <button
              onClick={() => {
                setFeedbackType('general')
                setDropdownOpen(false)
              }}
              className={`flex-1 px-4 py-3 rounded-lg border transition font-medium ${
                feedbackType === 'general'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              General Feedback
            </button>
          </div>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Booking Selection (showed only if booking feedback selected) */}
          {feedbackType === 'booking' && (
            <Card className="p-6 glow relative z-20">
              <label className="text-sm font-semibold text-gray-300 block mb-4">
                Select a Booking
              </label>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size={24} className="text-cyan-400 animate-spin" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="relative z-50" ref={dropdownRef}>
                  {/* Custom Dropdown Trigger */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`w-full px-4 py-3 rounded-xl border transition duration-200 flex items-center justify-between group ${
                      dropdownOpen
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-cyan-500/30 hover:bg-white/10 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      {selectedBooking ? (
                        (() => {
                          const booking = bookings.find(b => b._id === selectedBooking)
                          return booking ? (
                            <div className="block">
                              <p className="text-white font-medium text-sm">
                                {booking.vehicle?.name || 'Vehicle'}
                              </p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          ) : null
                        })()
                      ) : (
                        <p className="text-gray-500 text-sm">Select a completed booking</p>
                      )}
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-cyan-400 transition duration-300 flex-shrink-0 ml-2 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-b from-gray-900 to-gray-950 border border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-500/10 z-[1000] max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-500/30">
                      {bookings.map((booking, index) => (
                        <button
                          key={booking._id}
                          onClick={() => {
                            setSelectedBooking(booking._id)
                            setDropdownOpen(false)
                          }}
                          className={`w-full px-4 py-3 text-left transition duration-150 border-b border-cyan-500/10 hover:bg-cyan-500/15 flex items-start gap-3 group ${
                            selectedBooking === booking._id
                              ? 'bg-cyan-500/20'
                              : 'hover:bg-white/5'
                          } ${index === bookings.length - 1 ? 'border-b-0' : ''}`}
                        >
                          {/* Option Indicator */}
                          <div className="flex-shrink-0 w-4 h-4 rounded border-2 border-cyan-400/40 mt-1 group-hover:border-cyan-400/80 transition flex items-center justify-center">
                            {selectedBooking === booking._id && (
                              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                            )}
                          </div>

                          {/* Option Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                              {booking.vehicle?.name || 'Vehicle'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1 flex flex-wrap gap-1">
                              <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                              <span>→</span>
                              <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                            </p>
                            {booking.vehicle?.category && (
                              <p className="text-gray-500 text-xs mt-1">
                                {booking.vehicle.category}
                              </p>
                            )}
                          </div>

                          {/* Category Badge */}
                          <div className="flex-shrink-0">
                            <span className="inline-block px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-300 text-xs font-medium">
                              Completed
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-yellow-300 text-sm">
                  <p>You don't have any completed bookings yet.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/history')}
                    className="text-yellow-400 hover:text-yellow-300 font-semibold underline mt-2"
                  >
                    View History
                  </button>
                </div>
              )}
            </Card>
          )}

          {/* Star Rating */}
          <Card className="p-6 glow relative z-0">
            <p className="text-sm font-semibold text-gray-300 mb-4">Rate Your Experience</p>
            <div className="flex items-center gap-6">
              <StarRating 
                rating={rating} 
                onRatingChange={setRating} 
                interactive={!submitting}
                size="lg"
                className="justify-start"
              />
              <div className="text-right flex-1">
                <p className="text-2xl font-bold text-white">
                  {rating > 0 ? rating : '—'} / 5
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {rating > 0 ? `You rated this ${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
                </p>
              </div>
            </div>
          </Card>

          {/* Message Input */}
          <Card className="p-6 glow relative z-0">
            <label className="text-sm font-semibold text-gray-300 block mb-3">
              Your Feedback (10+ characters)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your experience, what went well, and what could be improved..."
              className="w-full bg-white/5 border border-cyan-500/30 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500/60 focus:bg-white/10 transition"
              rows={5}
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-3">
              <p className={`text-xs ${message.length < 10 ? 'text-red-400' : 'text-gray-500'}`}>
                {message.length} characters (minimum 10)
              </p>
              {message.length > 0 && (
                <p className="text-xs text-gray-500">
                  {1000 - message.length} characters remaining
                </p>
              )}
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm flex items-center gap-3">
              <AlertCircle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || message.trim().length < 10}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/40 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-12 p-6 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-white font-semibold mb-3">💡 Tips for Great Feedback</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Be specific about what you liked or didn't like</li>
            <li>✓ Share your honest rating (1-5 stars)</li>
            <li>✓ Include suggestions for improvement</li>
            <li>✓ Your feedback helps us serve you better</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

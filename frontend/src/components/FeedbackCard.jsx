import { Calendar, User, Truck } from 'lucide-react'
import GlassCard from './GlassCard'
import StarRating from './StarRating'

/**
 * FeedbackCard Component
 * 
 * Displays a single feedback item with user details, rating, and message
 * 
 * @param {object} feedback - Feedback object with user, message, rating, createdAt
 * @param {boolean} compact - Show compact version (default: false)
 * @param {string} className - Additional CSS classes
 */
export default function FeedbackCard({ feedback, compact = false, className = '' }) {
  if (!feedback) return null

  const userName = feedback.user?.name || feedback.user?.email?.split('@')[0] || 'Anonymous'
  const vehicleName = feedback.booking?.vehicle?.name || 'Vehicle'
  const vehicleCategory = feedback.booking?.vehicle?.category || ''
  const date = new Date(feedback.createdAt)
  const formattedDate = date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  const timeAgo = getTimeAgo(date)

  return (
    <GlassCard className={`p-5 hover:border-cyan-500/50 transition ${className}`} glow>
      <div className="flex flex-col gap-4">
        {/* Header with User & Date */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <User size={16} className="text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500">{vehicleName}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">{formattedDate}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-3">
          <StarRating rating={feedback.rating} size="sm" className="justify-start" />
          <span className="text-sm font-semibold text-yellow-400">
            {feedback.rating.toFixed(1)} / 5.0
          </span>
        </div>

        {/* Message */}
        {!compact && feedback.message && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-gray-300 text-sm leading-relaxed">{feedback.message}</p>
          </div>
        )}

        {/* Footer - Vehicle & Category */}
        {!compact && vehicleCategory && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <Truck size={16} className="text-cyan-400 flex-shrink-0" />
            <span className="text-xs text-gray-400">{vehicleCategory}</span>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

/**
 * Helper function to get relative time
 * @param {Date} date 
 * @returns {string} relative time (e.g., "2 days ago")
 */
function getTimeAgo(date) {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return 'long ago'
}

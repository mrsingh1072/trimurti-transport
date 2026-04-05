import { useState, useEffect } from 'react'
import { Loader, AlertCircle, Star, TrendingUp } from 'lucide-react'
import Card from './Card'
import FeedbackCard from './FeedbackCard'
import { getAllFeedback, getAverageRating } from '../services/api'

/**
 * FeedbackList Component
 * 
 * Displays all customer feedback with statistics and filtering
 * Used in Admin/Staff panel for monitoring customer satisfaction
 */
export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, highest, lowest

  useEffect(() => {
    fetchFeedbackData()
  }, [])

  const fetchFeedbackData = async () => {
    setLoading(true)
    setError('')
    try {
      const [feedbackData, statsData] = await Promise.all([
        getAllFeedback(),
        getAverageRating()
      ])
      
      setFeedbacks(Array.isArray(feedbackData) ? feedbackData : [])
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching feedback:', err)
      setError(err.response?.data?.message || 'Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Rating */}
          <Card className="p-6 group hover" glow>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 group-hover:from-yellow-500/40 group-hover:to-orange-500/40 transition">
                <Star size={24} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-2">Average Rating</p>
            <h2 className="text-3xl font-bold text-white">{stats.averageRating?.toFixed(2) || 'N/A'}</h2>
            <p className="text-xs text-gray-500 mt-3">out of 5 stars</p>
          </Card>

          {/* Total Feedback */}
          <Card className="p-6 group hover" glow>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition">
                <TrendingUp size={24} className="text-blue-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-2">Total Feedback</p>
            <h2 className="text-3xl font-bold text-white">{feedbacks.length}</h2>
            <p className="text-xs text-gray-500 mt-3">customer reviews</p>
          </Card>

          {/* 5 Star Count */}
          <Card className="p-6 group hover" glow>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/40 group-hover:to-emerald-500/40 transition">
                <Star size={24} className="text-green-400 fill-green-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-2">5-Star Reviews</p>
            <h2 className="text-3xl font-bold text-white">{stats.distribution?.[5] || 0}</h2>
            <p className="text-xs text-gray-500 mt-3">excellent ratings</p>
          </Card>

          {/* Satisfaction Rate */}
          <Card className="p-6 group hover" glow>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition">
                <TrendingUp size={24} className="text-purple-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-2">Satisfaction Rate</p>
            <h2 className="text-3xl font-bold text-white">
              {feedbacks.length > 0 
                ? `${Math.round((feedbacks.filter(f => f.rating >= 4).length / feedbacks.length) * 100)}%`
                : '—'
              }
            </h2>
            <p className="text-xs text-gray-500 mt-3">4+ star ratings</p>
          </Card>
        </div>
      )}

      {/* Rating Distribution (if stats available) */}
      {stats && stats.distribution && (
        <Card className="p-6" glow>
          <h3 className="text-lg font-bold text-white mb-6">Rating Distribution</h3>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = stats.distribution[stars] || 0
              const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0
              
              return (
                <div key={stars} className="flex items-center gap-4">
                  <div className="w-16 flex items-center gap-1 text-yellow-400">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className={i < stars ? 'text-lg' : 'hidden'}>
                          ★
                        </span>
                      ))}
                    <span className="text-xs text-gray-400 ml-auto">{stars}</span>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm font-semibold text-gray-300">{count}</span>
                    <span className="text-xs text-gray-500"> ({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Feedback List */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {feedbacks.length > 0 ? (
        <>
          {/* Sort Controls */}
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-white">Customer Feedback</h3>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-500/60 hover:bg-white/20 transition"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Feedback Cards */}
          <div className="space-y-4">
            {sortedFeedbacks.map(feedback => (
              <FeedbackCard key={feedback._id} feedback={feedback} />
            ))}
          </div>
        </>
      ) : (
        <Card className="p-12 text-center" glow>
          <Star size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg font-semibold">No feedback yet</p>
          <p className="text-gray-500 text-sm mt-2">Customer feedback will appear here</p>
        </Card>
      )}
    </div>
  )
}

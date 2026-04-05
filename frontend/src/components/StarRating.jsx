import { Star } from 'lucide-react'

/**
 * StarRating Component
 * 
 * Displays or allows selection of a 1-5 star rating
 * 
 * @param {number} rating - Current rating (0-5)
 * @param {function} onRatingChange - Callback when rating changes (only in interactive mode)
 * @param {boolean} interactive - Allow clicking to change rating (default: false)
 * @param {string} size - Star size: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} className - Additional CSS classes
 */
export default function StarRating({ 
  rating = 0, 
  onRatingChange, 
  interactive = false, 
  size = 'md',
  className = ''
}) {
  const sizeClasses = {
    sm: 'text-lg gap-0.5',
    md: 'text-2xl gap-1',
    lg: 'text-4xl gap-2'
  }

  const starSize = {
    sm: 16,
    md: 20,
    lg: 28
  }

  return (
    <div className={`flex ${sizeClasses[size]} ${className}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          disabled={!interactive}
          className={`transition-all transform ${
            interactive 
              ? 'cursor-pointer hover:scale-110 active:scale-95' 
              : 'cursor-default'
          } ${
            star <= rating 
              ? 'text-yellow-400 drop-shadow-lg drop-shadow-yellow-400/50' 
              : 'text-gray-600'
          }`}
          title={interactive ? `Rate ${star} stars` : `${star} stars`}
        >
          {star <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

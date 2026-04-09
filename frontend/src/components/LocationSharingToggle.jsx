import { useState } from 'react'
import { Share2, Eye, EyeOff } from 'lucide-react'
import GlassCard from './GlassCard'

export default function LocationSharingToggle({
  bookingId,
  enabled = false,
  onEnable,
  onDisable,
  loading = false
}) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (isEnabled) {
        await onDisable?.()
      } else {
        await onEnable?.()
      }
      setIsEnabled(!isEnabled)
    } catch (error) {
      console.error('Error toggling location sharing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Share2 size={20} className="text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Location Sharing</h4>
            <p className="text-xs text-gray-400">
              {isEnabled ? 'Your location is being shared' : 'Location sharing is off'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading || loading}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isEnabled ? 'bg-green-500/30 border border-green-500/50' : 'bg-gray-500/30 border border-gray-500/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
              isEnabled ? 'translate-x-6 bg-green-500' : 'translate-x-0 bg-gray-500'
            }`}
          >
            {isEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
          </div>
        </button>
      </div>
    </GlassCard>
  )
}

import { useState } from 'react'
import { X, Calendar, Clock, AlertCircle, Loader } from 'lucide-react'
import { createBooking } from '../services/api'

export default function BookingModal({ vehicle, onClose, onBookingSuccess }) {
  // Rental type toggle
  const [rentalType, setRentalType] = useState('days') // 'hours' or 'days'
  
  // Date inputs (always present)
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('10:00')
  
  // Duration inputs
  const [durationValue, setDurationValue] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate prices and dropoff date
  const calculatePricing = () => {
    if (!durationValue || !pickupDate) {
      return { price: 0, hours: 0, dropoffDate: null }
    }

    const parsedDuration = parseFloat(durationValue)
    if (parsedDuration <= 0) return { price: 0, hours: 0, dropoffDate: null }

    const pricePerHour = vehicle.pricePerDay / 24
    let totalPrice = 0
    let hours = parsedDuration

    if (rentalType === 'hours') {
      // Hourly pricing
      hours = parsedDuration
      
      // Auto-convert 24+ hours to day pricing
      if (hours >= 24) {
        const wholeDays = Math.floor(hours / 24)
        const remainingHours = hours % 24
        totalPrice = (wholeDays * vehicle.pricePerDay) + (remainingHours * pricePerHour)
      } else {
        totalPrice = hours * pricePerHour
      }
    } else {
      // Daily pricing
      totalPrice = parsedDuration * vehicle.pricePerDay
      hours = parsedDuration * 24
    }

    // Calculate dropoff date/time
    const [year, month, day] = pickupDate.split('-')
    const pickup = new Date(year, month - 1, day)
    const [pickupHourStr, pickupMinStr] = pickupTime.split(':')
    pickup.setHours(parseInt(pickupHourStr))
    pickup.setMinutes(parseInt(pickupMinStr))

    // Add hours to pickup date
    const dropoff = new Date(pickup)
    dropoff.setHours(dropoff.getHours() + hours)

    return {
      price: Math.round(totalPrice * 100) / 100,
      hours,
      dropoffDate: dropoff,
    }
  }

  const pricing = calculatePricing()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!pickupDate || !durationValue) {
      setError('Please fill in all fields')
      return
    }

    const parsedDuration = parseFloat(durationValue)
    if (parsedDuration <= 0) {
      setError('Duration must be greater than 0')
      return
    }

    // Max booking limit (720 hours = 30 days)
    const MAX_HOURS = 720
    if (rentalType === 'hours' && parsedDuration > MAX_HOURS) {
      setError(`Booking duration cannot exceed ${MAX_HOURS} hours (30 days)`)
      return
    } else if (rentalType === 'days' && parsedDuration * 24 > MAX_HOURS) {
      setError(`Booking duration cannot exceed 30 days`)
      return
    }

    setLoading(true)

    try {
      // Calculate start and end dates for backward compatibility
      const [year, month, day] = pickupDate.split('-')
      const startDate = new Date(year, month - 1, day)
      const [hourStr, minStr] = pickupTime.split(':')
      startDate.setHours(parseInt(hourStr))
      startDate.setMinutes(parseInt(minStr))

      const endDate = pricing.dropoffDate

      const response = await createBooking({
        vehicleId: vehicle._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationType: rentalType,
        durationValue: parseFloat(durationValue),
      })

      if (response) {
        onBookingSuccess()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const pricePerHour = vehicle.pricePerDay / 24

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Book {vehicle.name}</h2>
            <p className="text-gray-400 text-sm mt-1">Choose your rental type</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm flex gap-3">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ✨ Rental Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Rental Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRentalType('hours')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  rentalType === 'hours'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Clock size={18} />
                Hours
              </button>
              <button
                type="button"
                onClick={() => setRentalType('days')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  rentalType === 'days'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Calendar size={18} />
                Days
              </button>
            </div>
          </div>

          {/* Pickup Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pickup Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={today}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                required
              />
            </div>
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pickup Time</label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-3 text-gray-500 pointer-events-none" />
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
              />
            </div>
          </div>

          {/* Duration Input - Dynamic Label */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration ({rentalType === 'hours' ? 'hours' : 'days'})
            </label>
            <input
              type="number"
              value={durationValue}
              onChange={(e) => setDurationValue(e.target.value)}
              placeholder={rentalType === 'hours' ? 'e.g., 5' : 'e.g., 2'}
              min="0.5"
              step="0.5"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {rentalType === 'hours' 
                ? 'Max: 720 hours (30 days)' 
                : 'Max: 30 days'}
            </p>
          </div>

          {/* Live Price Preview */}
          {pickupDate && durationValue && pricing.price > 0 && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration</span>
                <span className="text-white font-medium">
                  {rentalType === 'hours' 
                    ? `${durationValue} hours` 
                    : `${durationValue} days`}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Price per {rentalType === 'hours' ? 'hour' : 'day'}
                </span>
                <span className="text-white font-medium">
                  ₹{(rentalType === 'hours' ? pricePerHour : vehicle.pricePerDay).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </span>
              </div>

              {/* Auto-conversion note */}
              {rentalType === 'hours' && parseFloat(durationValue) >= 24 && (
                <div className="text-xs text-cyan-300 p-2 bg-cyan-500/20 rounded border border-cyan-500/30">
                  ✨ {parseFloat(durationValue) >= 24 ? '24+ hours converted to day pricing' : ''}
                </div>
              )}

              <div className="h-px bg-white/10 my-2"></div>

              <div className="flex justify-between text-lg">
                <span className="text-white font-bold">Estimated Price</span>
                <span className="gradient-text font-bold">₹{pricing.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Dropoff Info */}
          {pricing.dropoffDate && (
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Expected Dropoff:</p>
              <p className="text-sm text-white font-medium">
                {pricing.dropoffDate.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !pickupDate || !durationValue}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm">
          <p className="text-cyan-300 font-medium mb-2">Booking Benefits:</p>
          <ul className="text-cyan-300/80 text-xs space-y-1">
            <li>✓ Free cancellation up to 24 hours</li>
            <li>✓ Fuel included in rental</li>
            <li>✓ Full insurance coverage</li>
            <li>✓ 24/7 roadside assistance</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

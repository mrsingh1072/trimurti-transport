import { useState } from 'react'
import { X, Calendar, AlertCircle, Loader } from 'lucide-react'
import { updateBooking } from '../services/api'

export default function EditBookingModal({ booking, onClose, onUpdateSuccess }) {
  const [startDate, setStartDate] = useState(booking.startDate?.split('T')[0] || '')
  const [endDate, setEndDate] = useState(booking.endDate?.split('T')[0] || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      return days > 0 ? days : 0
    }
    return 0
  }

  const totalPrice = calculateDays() * (booking.vehicle?.pricePerDay || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
      setError('End date must be after start date')
      return
    }

    setLoading(true)

    try {
      const response = await updateBooking(booking._id, {
        startDate: startDate,
        endDate: endDate
      })

      if (response) {
        onUpdateSuccess()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Booking</h2>
            <p className="text-gray-400 text-sm mt-1">Update your rental dates</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Vehicle Info */}
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Vehicle</p>
          <p className="text-white font-bold text-lg">{booking.vehicle?.name}</p>
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
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                required
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                required
              />
            </div>
          </div>

          {/* Summary */}
          {startDate && endDate && calculateDays() > 0 && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">New Duration</span>
                <span className="text-white font-medium">{calculateDays()} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per Day</span>
                <span className="text-white font-medium">₹{booking.vehicle?.pricePerDay?.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between text-lg">
                <span className="text-white font-bold">New Total</span>
                <span className="gradient-text font-bold">₹{totalPrice.toLocaleString()}</span>
              </div>
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
              disabled={loading || !startDate || !endDate}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? 'Updating...' : 'Update Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

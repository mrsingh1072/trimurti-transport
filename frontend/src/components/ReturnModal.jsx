import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { processReturn } from '../services/api'

export default function ReturnModal({ booking, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    actualReturnDate: new Date().toISOString().split('T')[0],
    lateFee: 0,
    damageFee: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'actualReturnDate' ? value : parseFloat(value) || 0,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)

      const data = {
        bookingId: booking._id,
        actualReturnDate: formData.actualReturnDate,
        lateFee: formData.lateFee,
        damageFee: formData.damageFee,
      }

      await processReturn(data)

      // Show success message
      alert('Return processed successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error processing return:', err)
      setError(err.response?.data?.message || 'Failed to process return')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Process Return</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-400">
              <span className="font-medium text-white">{booking.vehicle?.name}</span> from{' '}
              <span className="text-gray-300">
                {new Date(booking.startDate).toLocaleDateString()} to{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Customer:</span>
              <span className="text-white ml-2">{booking.user?.name}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Actual Return Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Actual Return Date
              </label>
              <input
                type="date"
                name="actualReturnDate"
                value={formData.actualReturnDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Late Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Late Fee (₹)
              </label>
              <input
                type="number"
                name="lateFee"
                value={formData.lateFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Damage Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Damage Fee (₹)
              </label>
              <input
                type="number"
                name="damageFee"
                value={formData.damageFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Fee Summary */}
            <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-3 text-sm">
              <p className="text-gray-300">
                Total Additional Fees:{' '}
                <span className="text-purple-400 font-bold">
                  ₹{(formData.lateFee + formData.damageFee).toFixed(2)}
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader size={16} className="animate-spin" />}
                {loading ? 'Processing...' : 'Process Return'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

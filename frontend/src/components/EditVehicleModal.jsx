import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = ['Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB']
const CONDITIONS = ['Good', 'Average', 'Poor']

export default function EditVehicleModal({ isOpen, vehicle, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Car',
    pricePerDay: '',
    location: '',
    condition: 'Good',
    availability: true,
  })

  useEffect(() => {
    if (vehicle && isOpen) {
      setFormData({
        name: vehicle.name || '',
        category: vehicle.category || 'Car',
        pricePerDay: vehicle.pricePerDay || '',
        location: vehicle.location || '',
        condition: vehicle.condition || 'Good',
        availability: vehicle.availability !== undefined ? vehicle.availability : true,
      })
    }
  }, [vehicle, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      alert('Vehicle name is required')
      return
    }
    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      alert('Price per day must be greater than 0')
      return
    }
    if (!formData.location.trim()) {
      alert('Location is required')
      return
    }

    onSubmit(formData)
  }

  if (!isOpen || !vehicle) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Vehicle</h2>
            <p className="text-gray-400 text-sm mt-1">Update vehicle details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Maruti Swift"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition"
            />
          </div>

          {/* Category & Condition Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Location Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Per Day (₹) *
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                placeholder="500"
                min="0"
                step="10"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Delhi"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <input
              type="checkbox"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="w-4 h-4 accent-purple-500"
            />
            <label className="text-sm font-medium text-gray-300">
              Available for booking
            </label>
          </div>

          {/* Button Group */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition font-medium disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

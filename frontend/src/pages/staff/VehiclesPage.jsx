import { useEffect, useState } from 'react'
import { RotateCcw, ChevronDown } from 'lucide-react'
import StaffLayout from '../../components/StaffLayout'
import { getVehicles, updateVehicle } from '../../services/api'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState({})

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const res = await getVehicles()
      const data = res.data || res
      setVehicles(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityToggle = async (vehicle) => {
    try {
      setUpdating((prev) => ({
        ...prev,
        [vehicle._id]: true,
      }))

      const updatedData = {
        ...vehicle,
        availability: !vehicle.availability,
      }

      await updateVehicle(vehicle._id, updatedData)

      // Update local state
      setVehicles((prev) =>
        prev.map((v) =>
          v._id === vehicle._id
            ? { ...v, availability: !v.availability }
            : v
        )
      )
    } catch (err) {
      console.error('Error updating vehicle:', err)
      alert('Failed to update availability')
    } finally {
      setUpdating((prev) => ({
        ...prev,
        [vehicle._id]: false,
      }))
    }
  }

  const handleConditionChange = async (vehicle, newCondition) => {
    try {
      setUpdating((prev) => ({
        ...prev,
        [vehicle._id]: true,
      }))

      const updatedData = {
        ...vehicle,
        condition: newCondition,
      }

      await updateVehicle(vehicle._id, updatedData)

      // Update local state
      setVehicles((prev) =>
        prev.map((v) =>
          v._id === vehicle._id
            ? { ...v, condition: newCondition }
            : v
        )
      )
    } catch (err) {
      console.error('Error updating vehicle condition:', err)
      alert('Failed to update condition')
    } finally {
      setUpdating((prev) => ({
        ...prev,
        [vehicle._id]: false,
      }))
    }
  }

  const getConditionBadge = (condition) => {
    const badges = {
      good: 'bg-green-500/20 text-green-400',
      fair: 'bg-yellow-500/20 text-yellow-400',
      damaged: 'bg-red-500/20 text-red-400',
    }
    return badges[condition] || 'bg-gray-500/20 text-gray-400'
  }

  const getAvailabilityBadge = (availability) => {
    return availability
      ? 'bg-blue-500/20 text-blue-400'
      : 'bg-orange-500/20 text-orange-400'
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Manage Vehicles</h2>
            <p className="text-gray-400">Update vehicle availability and condition</p>
          </div>
          <button
            onClick={fetchVehicles}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-40 mb-3" />
                <div className="h-4 bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">No vehicles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition"
              >
                {/* Vehicle Name */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{vehicle.name}</h3>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityBadge(
                        vehicle.availability
                      )}`}
                    >
                      {vehicle.availability ? '✓ Available' : '✗ Not Available'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionBadge(
                        vehicle.condition
                      )}`}
                    >
                      {vehicle.condition?.charAt(0).toUpperCase() +
                        vehicle.condition?.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white">{vehicle.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white">{vehicle.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price/Day</span>
                    <span className="text-white">₹{vehicle.pricePerDay?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-3 border-t border-gray-700 pt-4">
                  {/* Availability Toggle */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Availability</p>
                    <button
                      onClick={() => handleAvailabilityToggle(vehicle)}
                      disabled={updating[vehicle._id]}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                        vehicle.availability
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                      } disabled:opacity-50`}
                    >
                      {updating[vehicle._id]
                        ? 'Updating...'
                        : vehicle.availability
                        ? 'Mark as Not Available'
                        : 'Mark as Available'}
                    </button>
                  </div>

                  {/* Condition Dropdown */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Vehicle Condition</p>
                    <div className="relative">
                      <select
                        value={vehicle.condition || 'good'}
                        onChange={(e) =>
                          handleConditionChange(vehicle, e.target.value)
                        }
                        disabled={updating[vehicle._id]}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition disabled:opacity-50 appearance-none cursor-pointer"
                      >
                        <option value="good">Good Condition</option>
                        <option value="fair">Fair Condition</option>
                        <option value="damaged">Damaged</option>
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && vehicles.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400">Total Vehicles</p>
                <p className="text-2xl font-bold text-white">{vehicles.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-400">
                  {vehicles.filter((v) => v.availability).length}
                </p>
              </div>
              <div>
                <p className="text-gray-400">In Use</p>
                <p className="text-2xl font-bold text-orange-400">
                  {vehicles.filter((v) => !v.availability).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  )
}

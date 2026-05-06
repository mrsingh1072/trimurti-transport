import { useEffect, useState } from 'react'
import { RotateCcw, ChevronDown, Plus, Edit2, Trash2, Filter } from 'lucide-react'
import StaffLayout from '../../components/StaffLayout'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/api'
import AddVehicleModal from '../../components/AddVehicleModal'
import EditVehicleModal from '../../components/EditVehicleModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Toast from '../../components/Toast'

const CATEGORIES = ['Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB']

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState({})
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingVehicleId, setDeletingVehicleId] = useState(null)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Toast state
  const [toast, setToast] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, selectedCategory, searchTerm])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
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

  const filterVehicles = () => {
    let filtered = vehicles

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((v) => v.category === selectedCategory)
    }

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredVehicles(filtered)
  }

  const handleAddVehicle = async (formData) => {
    try {
      setIsSubmitting(true)
      await createVehicle(formData)
      setShowAddModal(false)
      setToast({ type: 'success', message: 'Vehicle Added Successfully!' })
      fetchVehicles()
    } catch (err) {
      console.error('Error creating vehicle:', err)
      setToast({ type: 'error', message: 'Failed to create vehicle' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditVehicle = async (formData) => {
    try {
      setIsSubmitting(true)
      await updateVehicle(editingVehicle._id, formData)
      setShowEditModal(false)
      setEditingVehicle(null)
      setToast({ type: 'success', message: 'Vehicle Updated Successfully!' })
      fetchVehicles()
    } catch (err) {
      console.error('Error updating vehicle:', err)
      setToast({ type: 'error', message: 'Failed to update vehicle' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteVehicle = async () => {
    try {
      setIsDeleting(true)
      await deleteVehicle(deletingVehicleId)
      setShowDeleteConfirm(false)
      setDeletingVehicleId(null)
      setToast({ type: 'success', message: 'Vehicle Deleted Successfully!' })
      fetchVehicles()
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      setToast({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete vehicle',
      })
    } finally {
      setIsDeleting(false)
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
      setToast({ type: 'success', message: 'Availability Updated!' })
    } catch (err) {
      console.error('Error updating vehicle:', err)
      setToast({ type: 'error', message: 'Failed to update availability' })
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
      setToast({ type: 'success', message: 'Condition Updated!' })
    } catch (err) {
      console.error('Error updating vehicle condition:', err)
      setToast({ type: 'error', message: 'Failed to update condition' })
    } finally {
      setUpdating((prev) => ({
        ...prev,
        [vehicle._id]: false,
      }))
    }
  }

  const getConditionBadge = (condition) => {
    const badges = {
      Good: 'bg-green-500/20 text-green-400',
      Average: 'bg-yellow-500/20 text-yellow-400',
      Poor: 'bg-red-500/20 text-red-400',
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
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Manage Vehicles</h2>
            <p className="text-gray-400">Add, edit, and manage your vehicle fleet</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchVehicles}
              disabled={loading}
              className="px-6 py-2 bg-gray-800/50 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Filter */}
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer pr-10"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
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
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">
              {vehicles.length === 0 ? 'No vehicles found. Start by adding one!' : 'No vehicles match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition"
              >
                {/* Vehicle Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{vehicle.name}</h3>
                    <div className="flex gap-2 flex-wrap">
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
                        {vehicle.condition}
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingVehicle(vehicle)
                        setShowEditModal(true)
                      }}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingVehicleId(vehicle._id)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
                      title={`Delete vehicle '${vehicle.name}'`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white font-medium">{vehicle.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white font-medium">{vehicle.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price/Day</span>
                    <span className="text-white font-medium">₹{vehicle.pricePerDay?.toLocaleString() || 0}</span>
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
                        value={vehicle.condition || 'Good'}
                        onChange={(e) =>
                          handleConditionChange(vehicle, e.target.value)
                        }
                        disabled={updating[vehicle._id]}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition disabled:opacity-50 appearance-none cursor-pointer"
                      >
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Poor">Poor</option>
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

      {/* Modals */}
      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddVehicle}
        isLoading={isSubmitting}
      />

      <EditVehicleModal
        isOpen={showEditModal}
        vehicle={editingVehicle}
        onClose={() => {
          setShowEditModal(false)
          setEditingVehicle(null)
        }}
        onSubmit={handleEditVehicle}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle '${
          vehicles.find((v) => v._id === deletingVehicleId)?.name || ''
        }'? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteVehicle}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeletingVehicleId(null)
        }}
        isLoading={isDeleting}
        isDangerous={true}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </StaffLayout>
  )
}

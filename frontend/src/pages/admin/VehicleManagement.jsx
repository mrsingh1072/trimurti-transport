import { useEffect, useState } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import ModalForm from '../../components/admin/ModalForm'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/api'

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    pricePerDay: '',
    location: '',
    condition: 'good',
    availability: true,
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const res = await getVehicles()
      // Handle both array and paginated response structures
      const data = Array.isArray(res) ? res : (res?.items || res?.data || [])
      setVehicles(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingId(vehicle._id)
      setFormData({
        name: vehicle.name,
        category: vehicle.category,
        pricePerDay: vehicle.pricePerDay,
        location: vehicle.location,
        condition: vehicle.condition,
        availability: vehicle.availability,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        category: '',
        pricePerDay: '',
        location: '',
        condition: 'good',
        availability: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (data) => {
    try {
      // Normalize category and condition for backend
      const normalizedData = {
        ...data,
        category: data.category
          ? data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase()
          : '',
        condition: data.condition
          ? (data.condition === 'damaged' ? 'Poor' : data.condition.charAt(0).toUpperCase() + data.condition.slice(1).toLowerCase())
          : 'Good',
      }
      if (editingId) {
        await updateVehicle(editingId, normalizedData)
      } else {
        console.log('[ADMIN] Submitting vehicle as admin')
        console.log('[ADMIN] Payload:', normalizedData)
        const response = await createVehicle(normalizedData)
        console.log('[ADMIN] Response:', response)
        if (response && (response.success || response.vehicle)) {
          setIsModalOpen(false)
          fetchVehicles()
          alert('Vehicle added successfully!')
        } else {
          alert(response?.message || 'Failed to add vehicle')
        }
        return
      }
      setIsModalOpen(false)
      fetchVehicles()
    } catch (err) {
      console.error('Error saving vehicle:', err)
      alert('Failed to save vehicle')
    }
  }

  const handleDelete = async (vehicle) => {
    const input = prompt(`Type DELETE to confirm deletion of ${vehicle.name}`)
    if (input !== 'DELETE') {
      alert('Deletion cancelled. You must type DELETE to confirm.')
      return
    }
    try {
      const res = await deleteVehicle(vehicle._id)
      if (res && res.success) {
        fetchVehicles()
      } else {
        alert(res?.message || 'Failed to delete vehicle')
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete vehicle')
    }
  }

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Price/Day', accessor: 'pricePerDay', cell: (row) => `₹${row.pricePerDay}` },
    { header: 'Location', accessor: 'location' },
    { 
      header: 'Availability', 
      accessor: 'availability',
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.availability ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
        }`}>
          {row.availability ? '✓ Available' : '✗ Not Available'}
        </span>
      )
    },
    {
      header: 'Condition',
      accessor: 'condition',
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.condition === 'good' ? 'bg-green-500/20 text-green-400' :
          row.condition === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {row.condition?.charAt(0).toUpperCase() + row.condition?.slice(1)}
        </span>
      )
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Vehicle Management</h2>
            <p className="text-gray-400">Manage all vehicles in the system</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchVehicles}
              className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition"
            >
              <RotateCcw size={18} className="inline mr-2" />
              Refresh
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={vehicles}
          loading={loading}
          actions={(row) => [
            { label: 'Edit', onClick: () => handleOpenModal(row) },
            { label: 'Delete', variant: 'danger', onClick: () => handleDelete(row) },
          ]}
        />
      </div>

      {/* Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Vehicle' : 'Add Vehicle'}
        fields={[
          { name: 'name', label: 'Vehicle Name', placeholder: 'Tesla Model 3', type: 'text' },
          { name: 'category', label: 'Category', placeholder: 'Sedan', type: 'text' },
          { name: 'pricePerDay', label: 'Price per Day (₹)', placeholder: '5000', type: 'number', step: '100' },
          { name: 'location', label: 'Location', placeholder: 'Delhi', type: 'text' },
          {
            name: 'condition',
            label: 'Condition',
            type: 'select',
            options: [
              { label: 'Good', value: 'good' },
              { label: 'Fair', value: 'fair' },
              { label: 'Damaged', value: 'damaged' },
            ],
          },
        ]}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={false}
        submitText={editingId ? 'Update Vehicle' : 'Add Vehicle'}
      />
    </AdminLayout>
  )
}

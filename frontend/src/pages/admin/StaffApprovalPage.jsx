import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getPendingStaff, getAllStaff, approveStaff as approveStaffAPI, rejectStaff as rejectStaffAPI, registerfromAdmin } from '../../services/api'
import { Check, X, Loader, Clock, Plus } from 'lucide-react'

export default function StaffApprovalPage() {
  const [pendingStaff, setPendingStaff] = useState([])
  const [allStaff, setAllStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingStaff, setCreatingStaff] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const pending = await getPendingStaff()
      const all = await getAllStaff()
      setPendingStaff(pending)
      setAllStaff(all)
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (staffId) => {
    setApproving(staffId)
    try {
      await approveStaffAPI(staffId)
      setPendingStaff(pendingStaff.filter(s => s._id !== staffId))
      const staff = allStaff.find(s => s._id === staffId)
      if (staff) {
        staff.status = 'active'
      }
      setAllStaff([...allStaff])
    } catch (error) {
      console.error('Error approving staff:', error)
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (staffId) => {
    setApproving(staffId)
    try {
      await rejectStaffAPI(staffId)
      setPendingStaff(pendingStaff.filter(s => s._id !== staffId))
      setAllStaff(allStaff.filter(s => s._id !== staffId))
    } catch (error) {
      console.error('Error rejecting staff:', error)
    } finally {
      setApproving(null)
    }
  }

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert('Please fill all fields')
      return
    }

    setCreatingStaff(true)
    try {
      const response = await registerfromAdmin({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'staff'
      })
      
      // Add the new staff to pending list
      setPendingStaff([...pendingStaff, response.user])
      setAllStaff([...allStaff, response.user])
      
      // Reset form and close modal
      setFormData({ name: '', email: '', phone: '', password: '' })
      setShowCreateModal(false)
      alert('Staff account created successfully! They will appear in pending approvals.')
    } catch (error) {
      console.error('Error creating staff:', error)
      alert(error.response?.data?.message || 'Failed to create staff account')
    } finally {
      setCreatingStaff(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN')
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Staff Management</h2>
            <p className="text-gray-400">Review and approve staff account requests</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
          >
            <Plus size={20} />
            Create New Staff
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition ${
              activeTab === 'pending'
                ? 'border-amber-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock size={18} />
            Pending Approvals ({pendingStaff.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition ${
              activeTab === 'all'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            All Staff ({allStaff.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
            <Loader className="animate-spin mx-auto mb-4 text-purple-400" size={32} />
            <p className="text-gray-400">Loading staff members...</p>
          </div>
        ) : activeTab === 'pending' ? (
          <div>
            {pendingStaff.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
                <Check className="mx-auto mb-4 text-green-400" size={32} />
                <p className="text-gray-300 font-medium">All staff members approved!</p>
                <p className="text-gray-400 text-sm mt-2">No pending approvals at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingStaff.map(staff => (
                  <div
                    key={staff._id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex items-center justify-between hover:border-gray-600 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <Clock size={20} className="text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{staff.name}</h3>
                          <div className="flex gap-4 text-sm text-gray-400 mt-1">
                            <span>{staff.email}</span>
                            <span>{staff.phone}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Applied: {formatDate(staff.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(staff._id)}
                        disabled={approving === staff._id}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition font-medium"
                      >
                        {approving === staff._id ? (
                          <Loader size={18} className="animate-spin" />
                        ) : (
                          <Check size={18} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(staff._id)}
                        disabled={approving === staff._id}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition font-medium"
                      >
                        {approving === staff._id ? (
                          <Loader size={18} className="animate-spin" />
                        ) : (
                          <X size={18} />
                        )}
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {allStaff.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No staff members yet</p>
              </div>
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStaff.map(staff => (
                      <tr key={staff._id} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                        <td className="px-6 py-3 text-sm text-white font-medium">{staff.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">{staff.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">{staff.phone}</td>
                        <td className="px-6 py-3 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              staff.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {staff.status === 'active' ? '✓ Active' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-400">{formatDate(staff.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Staff Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">Create New Staff Account</h3>
              
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Enter staff name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Enter password"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({ name: '', email: '', phone: '', password: '' })
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingStaff}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition font-medium"
                  >
                    {creatingStaff ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Create Staff
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

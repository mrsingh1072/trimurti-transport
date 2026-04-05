import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getPendingWaivers, handleWaiver } from '../../services/api'
import { CheckCircle, XCircle, MessageCircle, AlertCircle } from 'lucide-react'

export default function WaiverManagement() {
  const [waivers, setWaivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected

  useEffect(() => {
    fetchWaivers()
  }, [])

  const fetchWaivers = async () => {
    try {
      setLoading(true)
      const data = await getPendingWaivers()
      setWaivers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching waivers:', error)
      setWaivers([])
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReject = async (bookingId, approve) => {
    if (!confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this waiver?`)) {
      return
    }

    setProcessingId(bookingId)
    try {
      await handleWaiver(bookingId, approve)
      // Refresh the list
      await fetchWaivers()
      alert(`Waiver ${approve ? 'approved' : 'rejected'} successfully!`)
    } catch (error) {
      console.error('Error processing waiver:', error)
      alert(`Failed to ${approve ? 'approve' : 'reject'} waiver. Please try again.`)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (booking) => {
    if (booking.waiverApproved) {
      return (
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-2">
          <CheckCircle size={16} /> Approved
        </span>
      )
    }
    if (booking.waiverRequested && !booking.waiverApproved) {
      return (
        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center gap-2">
          <AlertCircle size={16} /> Pending
        </span>
      )
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateTotalPenalty = (booking) => {
    return (booking.lateFee || 0) + (booking.damageFee || 0)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading waivers...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Waiver Management</h2>
          <p className="text-gray-400">Review and approve/reject customer waiver requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg p-4">
            <div className="text-yellow-400 text-sm font-medium mb-1">Pending Waivers</div>
            <div className="text-3xl font-bold text-white">
              {waivers.filter(w => !w.waiverApproved).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
            <div className="text-green-400 text-sm font-medium mb-1">Total Waivers</div>
            <div className="text-3xl font-bold text-white">{waivers.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
            <div className="text-purple-400 text-sm font-medium mb-1">Total Penalty Amount</div>
            <div className="text-3xl font-bold text-white">
              ₹{waivers.reduce((sum, w) => sum + calculateTotalPenalty(w), 0)}
            </div>
          </div>
        </div>

        {/* Waivers List */}
        {waivers.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
            <MessageCircle className="mx-auto mb-4 text-gray-500" size={48} />
            <p className="text-gray-400 text-lg">No pending waiver requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {waivers.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Section - Customer & Vehicle Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {booking.user?.name || 'Unknown Customer'}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>📧 {booking.user?.email || 'N/A'}</p>
                        <p>📱 {booking.user?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {booking.vehicle?.name || 'Unknown Vehicle'}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>📅 Booking ID: {booking._id?.substring(0, 8).toUpperCase()}</p>
                        <p>📍 Return Date: {formatDate(booking.expectedReturnDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Penalty & Reason */}
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <h4 className="text-red-400 font-semibold mb-3">Penalty Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Late Fee:</span>
                          <span className="text-white font-medium">₹{booking.lateFee || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Damage Fee:</span>
                          <span className="text-white font-medium">₹{booking.damageFee || 0}</span>
                        </div>
                        <div className="border-t border-red-500/20 pt-2 mt-2 flex justify-between">
                          <span className="text-gray-400 font-semibold">Total Penalty:</span>
                          <span className="text-red-400 font-bold">₹{calculateTotalPenalty(booking)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                        <MessageCircle size={16} /> Waiver Reason
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {booking.waiverReason || 'No reason provided'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Status:</span>
                      {getStatusBadge(booking)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!booking.waiverApproved && (
                  <div className="mt-6 pt-6 border-t border-gray-700 flex gap-3 justify-end">
                    <button
                      onClick={() => handleApproveReject(booking._id, false)}
                      disabled={processingId === booking._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition font-medium"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveReject(booking._id, true)}
                      disabled={processingId === booking._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition font-medium"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                  </div>
                )}

                {booking.waiverApproved && (
                  <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                    <p className="text-green-400 font-semibold">✓ Waiver has been approved</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

import { useEffect, useState } from 'react'
import { Users, User, Users2, Shield, Trash2, Search, Filter, RotateCcw } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { getUsers, getUserStats, deleteUser } from '../../services/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    staff: 0,
    admins: 0,
    staffStats: {},
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersData, statsData] = await Promise.all([
        getUsers(),
        getUserStats(),
      ])
      
      setUsers(Array.isArray(usersData) ? usersData : [])
      setStats(statsData || {})
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        u =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phone?.includes(searchTerm)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    setDeleting(userId)
    try {
      await deleteUser(userId)
      setUsers(users.filter(u => u._id !== userId))
      alert('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const StatCard = ({ title, value, icon: Icon, bgColor }) => (
    <div className={`${bgColor} border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <Icon className="text-gray-500" size={32} />
      </div>
    </div>
  )

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400'
      case 'staff':
        return 'bg-blue-500/20 text-blue-400'
      case 'customer':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-amber-500/20 text-amber-400'
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
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
            <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
            <p className="text-gray-400">View and manage all customers and staff members</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition font-medium"
          >
            <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={Users}
            bgColor="bg-gray-800/50"
          />
          <StatCard
            title="Customers"
            value={stats.customers || 0}
            icon={User}
            bgColor="bg-gray-800/50"
          />
          <StatCard
            title="Staff Members"
            value={stats.staff || 0}
            icon={Users2}
            bgColor="bg-gray-800/50"
          />
          <StatCard
            title="Admins"
            value={stats.admins || 0}
            icon={Shield}
            bgColor="bg-gray-800/50"
          />
        </div>

        {/* Staff Status Breakdown */}
        {stats.staffStats && Object.keys(stats.staffStats).length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Staff Status Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-400 text-sm font-medium">Pending Approval</p>
                <p className="text-2xl font-bold text-white mt-2">{stats.staffStats.pending || 0}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-white mt-2">{stats.staffStats.active || 0}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-white mt-2">{stats.staffStats.rejected || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="staff">Staff</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto mb-4 text-gray-500" size={32} />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                    <td className="px-6 py-3 text-sm text-white font-medium">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-300">{user.phone || '-'}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {user.status ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deleting === user._id || user.role === 'admin'}
                        className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed transition"
                        title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            💡 <strong>Total Users Showing:</strong> {filteredUsers.length} of {users.length}
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

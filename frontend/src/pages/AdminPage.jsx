import { Users, Truck, Settings, Lock, Shield, Key } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Admin Settings</span>
        </h1>
        <p className="text-gray-400">Manage system configuration and user permissions</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value="156"
          color="text-purple-400"
        />
        <StatCard
          icon={Truck}
          label="Managed Vehicles"
          value="24"
          color="text-cyan-400"
        />
        <StatCard
          icon={Shield}
          label="Active Admins"
          value="3"
          color="text-pink-400"
        />
        <StatCard
          icon={Settings}
          label="System Health"
          value="98.5%"
          color="text-green-400"
          change="+1.2%"
          positive={true}
        />
      </div>

      {/* User Management */}
      <GlassCard className="p-8" glow>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">User Management</h3>
            <p className="text-gray-400 text-sm mt-1">Manage user roles and permissions</p>
          </div>
          <button className="btn-gradient px-6 py-3 rounded-xl text-white hover:shadow-glow-purple transition">
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Name</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Email</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Role</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Rajesh Kumar', email: 'rajesh@trimurti.com', role: 'Admin', status: 'Active' },
                { name: 'Priya Singh', email: 'priya@trimurti.com', role: 'Staff', status: 'Active' },
                { name: 'Arun Kumar', email: 'arun@trimurti.com', role: 'Staff', status: 'Active' },
                { name: 'John Doe', email: 'john@trimurti.com', role: 'Customer', status: 'Inactive' }
              ].map((user, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-4 px-4 text-white font-medium">{user.name}</td>
                  <td className="py-4 px-4 text-gray-300">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-purple-400 hover:text-purple-300 transition text-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* System Configuration */}
        <GlassCard className="p-8" glow>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Settings size={24} className="text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">System Configuration</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition cursor-pointer">
              <p className="text-white font-medium mb-1">Payment Gateway Settings</p>
              <p className="text-gray-400 text-sm">Configure payment processing methods</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition cursor-pointer">
              <p className="text-white font-medium mb-1">Email Configuration</p>
              <p className="text-gray-400 text-sm">Setup email notifications and templates</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition cursor-pointer">
              <p className="text-white font-medium mb-1">Pricing Configuration</p>
              <p className="text-gray-400 text-sm">Manage vehicle pricing and rates</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition cursor-pointer">
              <p className="text-white font-medium mb-1">API Keys</p>
              <p className="text-gray-400 text-sm">Manage third-party integrations</p>
            </div>
          </div>
        </GlassCard>

        {/* Security Settings */}
        <GlassCard className="p-8" glow>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Lock size={24} className="text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Security</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-gray-400 text-sm">Enhance account security</p>
              </div>
              <div className="w-12 h-6 bg-green-500/30 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-5 h-5 bg-green-400 rounded-full ml-auto"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition">
              <div>
                <p className="text-white font-medium">Data Encryption</p>
                <p className="text-gray-400 text-sm">End-to-end encryption enabled</p>
              </div>
              <div className="w-12 h-6 bg-green-500/30 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-5 h-5 bg-green-400 rounded-full ml-auto"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition">
              <div>
                <p className="text-white font-medium">IP Whitelist</p>
                <p className="text-gray-400 text-sm">Restricted access control</p>
              </div>
              <div className="w-12 h-6 bg-gray-500/30 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            <button className="w-full py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition font-medium text-sm mt-4">
              <Key size={18} className="mr-2 inline" />
              Reset All API Keys
            </button>
          </div>
        </GlassCard>
      </div>

      {/* System Logs */}
      <GlassCard className="p-8" glow>
        <h3 className="text-2xl font-bold text-white mb-6">Recent Activities</h3>
        <div className="space-y-3">
          {[
            { action: 'User Created', detail: 'New admin user added', time: '2 hours ago', level: 'info' },
            { action: 'Vehicle Updated', detail: 'Mahindra Thar pricing changed', time: '5 hours ago', level: 'info' },
            { action: 'Booking Completed', detail: 'Payment received ₹3,000', time: '1 day ago', level: 'success' },
            { action: 'System Update', detail: 'Security patches applied', time: '2 days ago', level: 'warning' },
            { action: 'Login Failed', detail: '3 failed attempts detected', time: '3 days ago', level: 'error' }
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition">
              <div className={`w-1 h-8 rounded-full ${
                log.level === 'info' ? 'bg-blue-500' :
                log.level === 'success' ? 'bg-green-500' :
                log.level === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-white font-medium">{log.action}</p>
                <p className="text-gray-400 text-sm">{log.detail}</p>
              </div>
              <span className="text-gray-500 text-sm">{log.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

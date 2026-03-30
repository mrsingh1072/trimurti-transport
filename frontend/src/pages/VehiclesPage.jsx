import { useState, useEffect } from 'react'
import { Truck, Plus, Search, Filter } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { getVehicles } from '../services/api'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAvailability, setFilterAvailability] = useState('all')

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      try {
        const data = await getVehicles()
        setVehicles(Array.isArray(data) ? data : data.items || [])
      } catch (error) {
        console.error('Failed to fetch vehicles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchVehicles()
  }, [])

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterAvailability === 'all' || 
                         (filterAvailability === 'available' ? vehicle.availability : !vehicle.availability)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Vehicle Fleet</span>
          </h1>
          <p className="text-gray-400">Manage and monitor your vehicle inventory</p>
        </div>
        <button className="btn-gradient px-6 py-3 rounded-xl text-white flex items-center gap-2 hover:shadow-glow-purple transition">
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition appearance-none"
          >
            <option value="all">All Vehicles</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <GlassCard key={vehicle._id} className="p-6 group hover" glow>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition">
                  <Truck size={24} className="text-cyan-400" />
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  vehicle.availability 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {vehicle.availability ? 'Available' : 'Booked'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{vehicle.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white font-medium">{vehicle.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Price/Day</span>
                  <span className="text-white font-medium">₹{vehicle.pricePerDay.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white font-medium">{vehicle.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Condition</span>
                  <span className="text-white font-medium capitalize">{vehicle.condition}</span>
                </div>
              </div>

              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-white text-sm font-medium hover:from-purple-500/50 hover:to-cyan-500/50 transition">
                View Details
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {!loading && filteredVehicles.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Truck size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No vehicles found</p>
        </GlassCard>
      )}
    </div>
  )
}

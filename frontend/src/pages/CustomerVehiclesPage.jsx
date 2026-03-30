import { useState, useEffect } from 'react'
import { Truck, Search, Filter, MapPin, Calendar } from 'lucide-react'
import { getVehicles } from '../services/api'
import GlassCard from '../components/GlassCard'
import BookingModal from '../components/BookingModal'

export default function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const data = await getVehicles()
      const vehiclesList = Array.isArray(data) ? data : data.items || []
      setVehicles(vehiclesList)
      filterVehicles(vehiclesList, searchTerm, selectedCategory, priceRange)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = (vehicleList, search, category, prices) => {
    const filtered = vehicleList.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
                           vehicle.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || vehicle.category === category
      const matchesPrice = vehicle.pricePerDay >= prices[0] && vehicle.pricePerDay <= prices[1]
      return matchesSearch && matchesCategory && matchesPrice
    })
    setFilteredVehicles(filtered)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    filterVehicles(vehicles, value, selectedCategory, priceRange)
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    filterVehicles(vehicles, searchTerm, value, priceRange)
  }

  const handlePriceChange = (value) => {
    setPriceRange(value)
    filterVehicles(vehicles, searchTerm, selectedCategory, value)
  }

  const categories = ['all', ...new Set(vehicles.map(v => v.category))]
  const maxPrice = Math.max(...vehicles.map(v => v.pricePerDay), 1000)

  return (
    <div className="min-h-screen bg-gray-950 pt-28 pb-16 px-4">
      {/* Background Glow */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Browse Vehicles</span>
          </h1>
          <p className="text-gray-400 text-lg">Find the perfect vehicle for your journey</p>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Price: ₹{priceRange[1].toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="text-xs text-gray-500 mt-1">0 to ₹{maxPrice.toLocaleString()}</div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-bold">{filteredVehicles.length}</span> vehicle{filteredVehicles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                  <GlassCard key={vehicle._id} className="group overflow-hidden" glow>
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-cyan-500/20 h-48 flex items-center justify-center">
                      <Truck size={80} className="text-cyan-400 opacity-50" />
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{vehicle.name}</h3>
                          <p className="text-gray-400 text-sm">{vehicle.category}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          vehicle.availability
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {vehicle.availability ? 'Available' : 'Booked'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-6 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-2">
                            <MapPin size={16} />
                            Location
                          </span>
                          <span className="text-white font-medium">{vehicle.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Price/Day</span>
                          <span className="text-white font-bold">₹{vehicle.pricePerDay.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Condition</span>
                          <span className="text-white capitalize">{vehicle.condition}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setShowBookingModal(true)
                        }}
                        disabled={!vehicle.availability}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Calendar size={18} />
                        {vehicle.availability ? 'Book Now' : 'Not Available'}
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center" glow>
                <Truck size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">No vehicles match your criteria</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
              </GlassCard>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedVehicle && (
        <BookingModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedVehicle(null)
          }}
          onBookingSuccess={() => {
            setShowBookingModal(false)
            setSelectedVehicle(null)
            fetchVehicles()
          }}
        />
      )}
    </div>
  )
}

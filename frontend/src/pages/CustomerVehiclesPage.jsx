import { useState, useEffect } from 'react'
import { Truck, Search, Filter, MapPin, Calendar, ChevronDown } from 'lucide-react'
import { getVehicles } from '../services/api'
import GlassCard from '../components/GlassCard'
import BookingModal from '../components/BookingModal'

export default function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
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
      filterVehicles(vehiclesList, searchTerm, selectedCategory, selectedLocation, priceRange)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = (vehicleList, search, category, location, prices) => {
    const filtered = vehicleList.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
                           vehicle.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || vehicle.category === category
      const matchesLocation = location === 'all' || vehicle.location === location
      const matchesPrice = vehicle.pricePerDay >= prices[0] && vehicle.pricePerDay <= prices[1]
      return matchesSearch && matchesCategory && matchesLocation && matchesPrice
    })
    setFilteredVehicles(filtered)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    filterVehicles(vehicles, value, selectedCategory, selectedLocation, priceRange)
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    filterVehicles(vehicles, searchTerm, value, selectedLocation, priceRange)
  }

  const handleLocationChange = (value) => {
    setSelectedLocation(value)
    filterVehicles(vehicles, searchTerm, selectedCategory, value, priceRange)
  }

  const handlePriceChange = (value) => {
    setPriceRange(value)
    filterVehicles(vehicles, searchTerm, selectedCategory, selectedLocation, value)
  }

  const categories = ['all', ...new Set(vehicles.map(v => v.category))]
  const locations = ['all', ...new Set(vehicles.map(v => v.location).filter(Boolean))]
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Filter size={20} />
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition appearance-none pr-10"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Location</label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition appearance-none pr-10"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Max Price: ₹{priceRange[1].toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-400">
            Found <span className="text-white font-bold text-lg">{filteredVehicles.length}</span> vehicle{filteredVehicles.length !== 1 ? 's' : ''}
            {(searchTerm || selectedCategory !== 'all' || selectedLocation !== 'all' || priceRange[1] < maxPrice) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedLocation('all')
                  setPriceRange([0, maxPrice])
                  filterVehicles(vehicles, '', 'all', 'all', [0, maxPrice])
                }}
                className="ml-4 text-cyan-400 hover:text-cyan-300 underline text-sm"
              >
                Clear filters
              </button>
            )}
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
                  <GlassCard key={vehicle._id} className="group overflow-hidden hover:border-cyan-500/50 transition" glow>
                    {/* Vehicle Image Area */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 h-48 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition">
                      <Truck size={80} className="text-cyan-400 opacity-60 group-hover:opacity-80 transition" />
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur ${
                          vehicle.availability
                            ? 'bg-green-500/30 text-green-200 border border-green-500/50'
                            : 'bg-red-500/30 text-red-200 border border-red-500/50'
                        }`}>
                          {vehicle.availability ? '✓ Available' : '✕ Booked'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">{vehicle.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">{vehicle.category}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 mb-6 py-4 border-y border-white/10">
                        {vehicle.location && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-2">
                              <MapPin size={16} />
                              Location
                            </span>
                            <span className="text-white font-medium">{vehicle.location}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Price/Day</span>
                          <span className="text-cyan-300 font-bold text-lg">₹{vehicle.pricePerDay?.toLocaleString() || '0'}</span>
                        </div>
                        {vehicle.condition && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Condition</span>
                            <span className="text-white capitalize bg-white/5 px-3 py-1 rounded-lg text-xs">{vehicle.condition}</span>
                          </div>
                        )}
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setShowBookingModal(true)
                        }}
                        disabled={!vehicle.availability}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/40 hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
                <p className="text-gray-400 text-lg font-semibold">No vehicles found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search criteria</p>
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

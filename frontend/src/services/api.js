import axios from 'axios'

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Error handler
const handleError = (error) => {
  console.error('API Error:', error.response?.data || error.message)
  throw error
}

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/vehicles/stats')
    return response.data
  } catch (error) {
    handleError(error)
    // Return fallback data
    return {
      totalVehicles: 0,
      activeBookings: 0,
      availableVehicles: 0,
      totalRevenue: 0
    }
  }
}

// Get all vehicles
export const getVehicles = async () => {
  try {
    const response = await apiClient.get('/vehicles')
    return response.data
  } catch (error) {
    handleError(error)
    return []
  }
}

// Get all bookings
export const getBookings = async () => {
  try {
    const response = await apiClient.get('/bookings')
    return response.data.bookings || response.data
  } catch (error) {
    handleError(error)
    return []
  }
}

// Get booking stats
export const getBookingStats = async () => {
  try {
    const response = await apiClient.get('/bookings/stats')
    return response.data
  } catch (error) {
    handleError(error)
    return {
      totalBookings: 0,
      activeBookings: 0,
      totalRevenue: 0
    }
  }
}

// Get vehicles count
export const getVehicleCount = async () => {
  try {
    const response = await apiClient.get('/vehicles/count')
    return response.data
  } catch (error) {
    handleError(error)
    return { total: 0, available: 0 }
  }
}

export default apiClient

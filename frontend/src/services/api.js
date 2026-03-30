import axios from 'axios'

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if it exists
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

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
    // Handle paginated response from backend
    const vehicles = response.data.items || response.data
    return Array.isArray(vehicles) ? vehicles : []
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

// ===================== AUTHENTICATION =====================

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData)
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

// Register staff from admin (no automatic login)
export const registerfromAdmin = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// ===================== VEHICLE OPERATIONS =====================

// Create booking
export const createBooking = async (bookingData) => {
  try {
    const response = await apiClient.post('/bookings', bookingData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Get user's bookings
export const getUserBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/my')
    return response.data.bookings || response.data
  } catch (error) {
    handleError(error)
    return []
  }
}

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/cancel`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Update booking (edit dates)
export const updateBooking = async (bookingId, updateData) => {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}`, updateData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// ===================== STAFF OPERATIONS =====================

// Process return
export const processReturn = async (returnData) => {
  try {
    const response = await apiClient.post('/returns', returnData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Create vehicle
export const createVehicle = async (vehicleData) => {
  try {
    const response = await apiClient.post('/vehicles', vehicleData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Update vehicle
export const updateVehicle = async (vehicleId, updateData) => {
  try {
    const response = await apiClient.put(`/vehicles/${vehicleId}`, updateData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Delete vehicle
export const deleteVehicle = async (vehicleId) => {
  try {
    const response = await apiClient.delete(`/vehicles/${vehicleId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// ===================== ADMIN OPERATIONS =====================

// Get all users (admin only)
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users')
    return response.data?.users || []
  } catch (error) {
    handleError(error)
    return []
  }
}

// Get user statistics
export const getUserStats = async () => {
  try {
    const response = await apiClient.get('/users/stats')
    return response.data
  } catch (error) {
    handleError(error)
    return {
      totalUsers: 0,
      customers: 0,
      staff: 0,
      admins: 0,
      staffStats: {}
    }
  }
}

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const response = await apiClient.get(`/users/role/${role}`)
    return response.data?.users || []
  } catch (error) {
    handleError(error)
    return []
  }
}

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Get all payments (admin only)
export const getPayments = async () => {
  try {
    const response = await apiClient.get('/payments')
    return response.data
  } catch (error) {
    handleError(error)
    return []
  }
}

// Create payment
export const createPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/payments', paymentData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Update payment
export const updatePayment = async (paymentId, updateData) => {
  try {
    const response = await apiClient.put(`/payments/${paymentId}`, updateData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Delete payment
export const deletePayment = async (paymentId) => {
  try {
    const response = await apiClient.delete(`/payments/${paymentId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Update user
export const updateUser = async (userId, updateData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, updateData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// ===================== STAFF APPROVAL (ADMIN ONLY) =====================

// Get pending staff
export const getPendingStaff = async () => {
  try {
    const response = await apiClient.get('/auth/staff/pending')
    return response.data.staff || []
  } catch (error) {
    handleError(error)
    return []
  }
}

// Get all staff
export const getAllStaff = async () => {
  try {
    const response = await apiClient.get('/auth/staff/all')
    return response.data.staff || []
  } catch (error) {
    handleError(error)
    return []
  }
}

// Approve staff member
export const approveStaff = async (staffId) => {
  try {
    const response = await apiClient.put(`/auth/staff/${staffId}/approve`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Reject staff member
export const rejectStaff = async (staffId) => {
  try {
    const response = await apiClient.put(`/auth/staff/${staffId}/reject`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export default apiClient

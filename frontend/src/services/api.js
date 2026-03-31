import axios from 'axios'

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if it exists (but NOT for auth endpoints)
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    console.log('\n📤 [API REQUEST]:', config.method.toUpperCase(), config.url);
    
    // CRITICAL: Do NOT send token during login/register requests
    const isAuthEndpoint = config.url.includes('/auth/login') || config.url.includes('/auth/register');
    
    if (isAuthEndpoint) {
      console.log('   ⚠️  Auth endpoint detected - NOT attaching token');
      // Remove any existing Authorization header
      delete config.headers.Authorization;
    } else if (token) {
      console.log('   ✅ Token found in localStorage, attaching to request');
      console.log('   - Token length:', token.length);
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.log('   ⚠️  No token in localStorage');
    }
    return config
  },
  error => Promise.reject(error)
)

// Error handler
const handleError = (error) => {
  console.error('\n❌ [API ERROR]:', {
    status: error.response?.status,
    message: error.response?.data?.message || error.message,
    url: error.config?.url,
    method: error.config?.method
  })
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
    console.log('\n🔑 [LOGIN] Sending credentials for:', credentials.email);
    const response = await apiClient.post('/auth/login', credentials)
    
    if (response.data.token) {
      console.log('✅ [LOGIN] Success - Token received');
      console.log('   - Token length:', response.data.token.length);
      console.log('   - User:', { 
        id: response.data.user?.id,
        email: response.data.user?.email,
        role: response.data.user?.role,
        status: response.data.user?.status
      });
      
      // Store in localStorage
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      console.log('   ✅ Token and user stored in localStorage');
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

// Verify token (diagnostic endpoint)
export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('⚠️  [VERIFY TOKEN] No token in localStorage');
      return null;
    }
    
    console.log('\n🔐 [VERIFY TOKEN] Testing token validity...');
    const response = await apiClient.get('/auth/verify-token')
    console.log('✅ [VERIFY TOKEN] Token is valid:', response.data);
    return response.data
  } catch (error) {
    console.log('❌ [VERIFY TOKEN] Token is invalid or expired');
    handleError(error)
  }
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

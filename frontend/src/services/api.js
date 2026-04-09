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
    return response.data.data || response.data
  } catch (error) {
    handleError(error)
    return []
  }
}

// Create order for payment (Razorpay)
export const createPaymentOrder = async (bookingId, amount) => {
  try {
    console.log('\n💸 [CREATE PAYMENT ORDER] Starting...');
    console.log('   - Booking ID:', bookingId);
    console.log('   - Amount:', amount);
    
    const payload = { bookingId, amount };
    console.log('   - Payload:', JSON.stringify(payload));
    
    const response = await apiClient.post('/payments/create-order', payload)
    
    console.log('✅ [CREATE PAYMENT ORDER] Success');
    console.log('   - Order ID:', response.data.data?.orderId);
    console.log('   - Amount:', response.data.data?.amount);
    
    return response.data.data
  } catch (error) {
    console.error('❌ [CREATE PAYMENT ORDER] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    })
    handleError(error)
    throw error
  }
}

// Verify payment (Razorpay signature verification)
export const verifyPayment = async (bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    console.log('\n✔️ [VERIFY PAYMENT] Starting verification...');
    console.log('   - Booking ID:', bookingId);
    console.log('   - Order ID:', razorpayOrderId);
    console.log('   - Payment ID:', razorpayPaymentId);
    
    const payload = {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };
    
    const response = await apiClient.post('/payments/verify', payload)
    
    console.log('✅ [VERIFY PAYMENT] Success');
    console.log('   - Payment verified and booking updated');
    
    return response.data.data
  } catch (error) {
    console.error('❌ [VERIFY PAYMENT] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    })
    handleError(error)
    throw error
  }
}

// Pay fine (late fee + damage fee) - Create order
export const createFinePaymentOrder = async (bookingId) => {
  try {
    console.log('\n💰 [CREATE FINE ORDER] Starting...');
    console.log('   - Booking ID:', bookingId);
    
    const response = await apiClient.post('/payments/pay-fine', { bookingId })
    
    console.log('✅ [CREATE FINE ORDER] Success');
    console.log('   - Order ID:', response.data.data?.orderId);
    console.log('   - Amount:', response.data.data?.amount);
    
    return response.data.data
  } catch (error) {
    console.error('❌ [CREATE FINE ORDER] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    })
    handleError(error)
    throw error
  }
}

// Verify fine payment (Razorpay signature verification)
export const verifyFinePayment = async (bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    console.log('\n✔️ [VERIFY FINE PAYMENT] Starting verification...');
    console.log('   - Booking ID:', bookingId);
    console.log('   - Order ID:', razorpayOrderId);
    console.log('   - Payment ID:', razorpayPaymentId);
    
    const payload = {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };
    
    const response = await apiClient.post('/payments/verify-fine', payload)
    
    console.log('✅ [VERIFY FINE PAYMENT] Success');
    console.log('   - Fine payment verified and completed');
    
    return response.data.data
  } catch (error) {
    console.error('❌ [VERIFY FINE PAYMENT] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    })
    handleError(error)
    throw error
  }
}

// Pay fine - DEPRECATED (use createFinePaymentOrder instead)
export const payFine = async (bookingId) => {
  try {
    const response = await apiClient.post('/payments/pay-fine', { bookingId })
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

// Get payment stats (admin only)
export const getPaymentStats = async () => {
  try {
    const response = await apiClient.get('/payments/stats/overview')
    return response.data.data
  } catch (error) {
    handleError(error)
    return null
  }
}

// Get single payment
export const getPaymentById = async (paymentId) => {
  try {
    const response = await apiClient.get(`/payments/${paymentId}`)
    return response.data.data
  } catch (error) {
    handleError(error)
    return null
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

// ===================== ENHANCED BOOKING OPERATIONS =====================

// Get booking details
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await apiClient.get(`/bookings/details/${bookingId}`)
    return response.data.booking
  } catch (error) {
    handleError(error)
    return null
  }
}

// REQUEST RETURN (Customer)
export const requestReturn = async (bookingId) => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/request-return`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// REQUEST WAIVER (Customer)
export const requestWaiver = async (bookingId, reason) => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/request-waiver`, { reason })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// PROCESS RETURN (Staff/Admin)
export const processReturn = async (bookingId, actualReturnDate, damageFee) => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/process-return`, {
      actualReturnDate,
      damageFee
    })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// UPDATE PENALTY (Staff/Admin)
export const updatePenalty = async (bookingId, lateFee, damageFee) => {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/penalty`, {
      lateFee,
      damageFee
    })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// HANDLE WAIVER (Staff/Admin)
export const handleWaiver = async (bookingId, approve) => {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/waiver`, { approve })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// STAFF/ADMIN: GET LATE BOOKINGS
export const getLateBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/late/bookings')
    return response.data.bookings
  } catch (error) {
    handleError(error)
    return []
  }
}

// STAFF/ADMIN: GET PENDING RETURNS
export const getPendingReturns = async () => {
  try {
    const response = await apiClient.get('/bookings/returns/pending')
    return response.data.bookings
  } catch (error) {
    handleError(error)
    return []
  }
}

// STAFF/ADMIN: GET PENDING WAIVERS
export const getPendingWaivers = async () => {
  try {
    const response = await apiClient.get('/bookings/waivers/pending')
    return response.data.bookings
  } catch (error) {
    handleError(error)
    return []
  }
}

// ===================== ADMIN OPERATIONS =====================

// ADMIN: Dashboard
export const getAdminDashboard = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard')
    return response.data
  } catch (error) {
    handleError(error)
    return null
  }
}

// ADMIN: View all bookings with filters
export const viewAllBookings = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString()
    const url = `/admin/bookings/all${params ? '?' + params : ''}`
    const response = await apiClient.get(url)
    return response.data.bookings
  } catch (error) {
    handleError(error)
    return []
  }
}

// ADMIN: View late bookings
export const viewLateBookings = async () => {
  try {
    const response = await apiClient.get('/admin/bookings/late')
    return response.data.bookings
  } catch (error) {
    handleError(error)
    return []
  }
}

// ADMIN: View pending returns
export const viewPendingReturns = async () => {
  try {
    const response = await apiClient.get('/admin/bookings/pending-returns')
    return response.data.bookings
  } catch (error) {
    handleError(error)
    return []
  }
}

// ADMIN: View pending waivers
export const viewPendingWaivers = async () => {
  try {
    const response = await apiClient.get('/admin/bookings/pending-waivers')
    return response.data.bookings
  } catch (error) {
    handleError(error)
    return []
  }
}

// ADMIN: Override booking
export const overrideBooking = async (bookingId, overrideData) => {
  try {
    const response = await apiClient.put(`/admin/bookings/${bookingId}/override`, overrideData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// ADMIN: View action log
export const viewActionLog = async () => {
  try {
    const response = await apiClient.get('/admin/action-log')
    return response.data.actionLog
  } catch (error) {
    handleError(error)
    return []
  }
}

// ADMIN: Get revenue analytics
export const getRevenueAnalytics = async () => {
  try {
    const response = await apiClient.get('/admin/analytics/revenue')
    return response.data
  } catch (error) {
    handleError(error)
    return null
  }
}

// ===================== FEEDBACK & RATING SYSTEM =====================

// CUSTOMER: Submit feedback
export const submitFeedback = async (feedbackData) => {
  try {
    console.log('\n📝 [SUBMIT FEEDBACK] Starting...');
    console.log('   - Booking ID:', feedbackData.bookingId);
    console.log('   - Rating:', feedbackData.rating);
    
    const response = await apiClient.post('/feedback', feedbackData)
    
    console.log('✅ [SUBMIT FEEDBACK] Success');
    return response.data
  } catch (error) {
    console.error('❌ [SUBMIT FEEDBACK] Error:', error.response?.data?.message || error.message);
    handleError(error)
    throw error
  }
}

// PUBLIC: Get latest feedback (for landing page)
export const getLatestFeedback = async () => {
  try {
    const response = await apiClient.get('/feedback/latest')
    console.log(`⭐ [GET LATEST FEEDBACK] Retrieved ${response.data.count} feedbacks`);
    return response.data.feedbacks || []
  } catch (error) {
    console.error('❌ [GET LATEST FEEDBACK] Error:', error.message);
    return []
  }
}

// ADMIN/STAFF: Get all feedback
export const getAllFeedback = async () => {
  try {
    console.log('\n📊 [GET ALL FEEDBACK] Fetching...');
    const response = await apiClient.get('/feedback')
    
    console.log(`✅ [GET ALL FEEDBACK] Retrieved ${response.data.count} feedbacks`);
    return response.data.feedbacks || []
  } catch (error) {
    console.error('❌ [GET ALL FEEDBACK] Error:', error.message);
    handleError(error)
    return []
  }
}

// PUBLIC: Get average rating
export const getAverageRating = async () => {
  try {
    const response = await apiClient.get('/feedback/average')
    return response.data
  } catch (error) {
    console.error('❌ [GET AVERAGE RATING] Error:', error.message);
    return {
      averageRating: 0,
      totalFeedbacks: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }
}

// 📍 Get live tracking data for dashboard (Admin/Staff only)
export const getLiveTracking = async () => {
  try {
    console.log('📍 [GET LIVE TRACKING] Fetching active vehicles with locations...')
    const response = await apiClient.get('/tracking/live')
    console.log(`✅ [GET LIVE TRACKING] Retrieved ${response.data.count || 0} active vehicles`)
    return response.data.data || []
  } catch (error) {
    console.error('❌ [GET LIVE TRACKING] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    })
    // Return empty array instead of throwing to allow graceful fallback
    return []
  }
}

export default apiClient

import axios from 'axios'
import io from 'socket.io-client'

const API_URL = 'http://localhost:5000/api'
const SOCKET_URL = 'http://localhost:5000'

// Tracking API Client
const trackingApiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to tracking API requests
trackingApiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Socket.IO instance
let socket = null
let locationWatchId = null

/**
 * Initialize Socket.IO connection for tracking
 */
export const initializeSocketConnection = (userId, bookingId, role = 'customer') => {
  return new Promise((resolve, reject) => {
    try {
      const token = localStorage.getItem('authToken')
      
      socket = io(SOCKET_URL, {
        auth: {
          token,
          userId,
          bookingId,
          role
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      })

      socket.on('connect', () => {
        console.log('✅ [SOCKET] Connected to tracking server')
        resolve(socket)
      })

      socket.on('connect_error', error => {
        console.error('❌ [SOCKET] Connection error:', error)
        reject(error)
      })

      socket.on('error', error => {
        console.error('❌ [SOCKET] Error:', error)
      })
    } catch (error) {
      console.error('❌ Error initializing socket:', error)
      reject(error)
    }
  })
}

/**
 * Disconnect Socket.IO
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log('✅ Socket disconnected')
  }
}

/**
 * Get current Socket.IO instance
 */
export const getSocket = () => socket

/**
 * Start tracking - initialize tracking in backend
 */
export const startTracking = async (bookingId, vehicleId) => {
  try {
    const response = await trackingApiClient.post(`/tracking/${bookingId}/initialize`, {
      vehicleId
    })
    console.log('✅ Tracking started:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error starting tracking:', error)
    throw error
  }
}

/**
 * Send location update via Socket.IO
 */
export const sendLocationUpdate = (lat, lng, speed = 0, accuracy = null) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️  Socket not connected')
    return
  }

  socket.emit('location-update', {
    lat,
    lng,
    speed,
    accuracy
  })
}

/**
 * Watch user location and send updates
 */
export const startLocationTracking = (bookingId, interval = 5000) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported')
      reject(new Error('Geolocation not supported'))
      return
    }

    // First, get current location immediately
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy, speed } = position.coords
        console.log('📍 Current location:', { latitude, longitude, accuracy, speed })
        sendLocationUpdate(latitude, longitude, speed || 0, accuracy)

        // Then set up continuous tracking
        locationWatchId = navigator.geolocation.watchPosition(
          position => {
            const { latitude, longitude, accuracy, speed } = position.coords
            console.log('📍 Location update:', { latitude, longitude, speed })
            sendLocationUpdate(latitude, longitude, speed || 0, accuracy)
          },
          error => {
            console.error('❌ Geolocation error:', error.message)
            if (error.code === 1) {
              console.error('Permission denied. User did not allow location sharing.')
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )

        resolve(locationWatchId)
      },
      error => {
        console.error('❌ Error getting current location:', error.message)
        reject(error)
      }
    )
  })
}

/**
 * Stop location tracking
 */
export const stopLocationTracking = () => {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId)
    locationWatchId = null
    console.log('✅ Location tracking stopped')
  }
}

/**
 * End tracking session
 */
export const endTracking = async (bookingId) => {
  try {
    // Stop location tracking
    stopLocationTracking()

    // Emit socket event
    if (socket && socket.connected) {
      socket.emit('end-tracking', { bookingId })
    }

    // API call
    const response = await trackingApiClient.post(`/tracking/${bookingId}/end`)
    console.log('✅ Tracking ended:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error ending tracking:', error)
    throw error
  }
}

/**
 * Get tracking data for a booking
 */
export const getTrackingData = async (bookingId) => {
  try {
    const response = await trackingApiClient.get(`/tracking/${bookingId}`)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching tracking data:', error)
    throw error
  }
}

/**
 * Get trip summary
 */
export const getTripSummary = async (bookingId) => {
  try {
    const response = await trackingApiClient.get(`/tracking/${bookingId}/summary`)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching trip summary:', error)
    throw error
  }
}

/**
 * Request all active vehicles (admin/staff)
 */
export const requestActiveVehicles = () => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      reject(new Error('Socket not connected'))
      return
    }

    socket.emit('request-active-vehicles', callback => {
      if (callback?.success) {
        console.log('✅ Active vehicles requested')
        resolve()
      } else {
        reject(new Error('Failed to request active vehicles'))
      }
    })
  })
}

/**
 * Listen to active vehicles updates
 */
export const onActiveVehiclesUpdate = (callback) => {
  if (!socket) return

  socket.on('active-vehicles', data => {
    console.log('📊 Received active vehicles:', data.vehicles?.length)
    callback(data.vehicles)
  })
}

/**
 * Listen to vehicle updates (real-time)
 */
export const onVehicleUpdate = (callback) => {
  if (!socket) return

  socket.on('location-updated', data => {
    console.log('📍 Vehicle location updated:', data)
    callback(data)
  })
}

/**
 * Listen to vehicle updated (admin dashboard)
 */
export const onVehicleUpdated = (callback) => {
  if (!socket) return

  socket.on('vehicle-updated', data => {
    console.log('🚗 Vehicle updated (admin):', data)
    callback(data)
  })
}

/**
 * Enable location sharing
 */
export const enableLocationSharing = async (bookingId) => {
  try {
    const response = await trackingApiClient.post(
      `/tracking/${bookingId}/location-sharing/enable`
    )
    console.log('✅ Location sharing enabled')
    return response.data
  } catch (error) {
    console.error('❌ Error enabling location sharing:', error)
    throw error
  }
}

/**
 * Disable location sharing
 */
export const disableLocationSharing = async (bookingId) => {
  try {
    const response = await trackingApiClient.post(
      `/tracking/${bookingId}/location-sharing/disable`
    )
    console.log('✅ Location sharing disabled')
    return response.data
  } catch (error) {
    console.error('❌ Error disabling location sharing:', error)
    throw error
  }
}

/**
 * Get geofence alerts
 */
export const getGeofenceAlerts = async (bookingId) => {
  try {
    const response = await trackingApiClient.get(`/tracking/${bookingId}/geofence-alerts`)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching geofence alerts:', error)
    throw error
  }
}

/**
 * Listen to geofence alerts
 */
export const onGeofenceAlert = (callback) => {
  if (!socket) return

  socket.on('geofence-alert', data => {
    console.log('⚠️  Geofence alert:', data)
    callback(data)
  })
}

/**
 * Listen to tracking started
 */
export const onTrackingStarted = (callback) => {
  if (!socket) return

  socket.on('tracking-started', data => {
    console.log('✅ Tracking started via socket:', data)
    callback(data)
  })
}

/**
 * Listen to tracking ended
 */
export const onTrackingEnded = (callback) => {
  if (!socket) return

  socket.on('tracking-ended', data => {
    console.log('✅ Tracking ended via socket:', data)
    callback(data)
  })
}

/**
 * Update location via API (alternative to Socket.IO)
 * Sends real-time GPS coordinates to backend
 */
export const updateLocation = async (bookingId, { latitude, longitude, accuracy = null, speed = 0 }) => {
  try {
    console.log('📍 [TRACKING SERVICE] Updating location via API:', { bookingId, latitude, longitude })
    const response = await trackingApiClient.post(`/tracking/${bookingId}/location`, {
      lat: latitude,
      lng: longitude,
      accuracy,
      speed
    })
    console.log('✅ [TRACKING SERVICE] Location update success')
    return response.data
  } catch (error) {
    console.error('❌ [TRACKING SERVICE] Failed to update location:', error.message)
    throw error
  }
}

export default {
  initializeSocketConnection,
  disconnectSocket,
  getSocket,
  startTracking,
  sendLocationUpdate,
  startLocationTracking,
  stopLocationTracking,
  endTracking,
  getTrackingData,
  getTripSummary,
  requestActiveVehicles,
  onActiveVehiclesUpdate,
  onVehicleUpdate,
  onVehicleUpdated,
  enableLocationSharing,
  disableLocationSharing,
  getGeofenceAlerts,
  onGeofenceAlert,
  onTrackingStarted,
  onTrackingEnded
}

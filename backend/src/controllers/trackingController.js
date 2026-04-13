const trackingService = require('../services/trackingService');
const VehicleTracking = require('../models/VehicleTracking');
const Booking = require('../models/Booking');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * 🔐 SECURITY HELPER: Validate booking belongs to user
 * For location sharing: Allow any active booking
 * For location updates: Only ONGOING/CONFIRMED bookings
 */
const validateBookingAccess = async (bookingId, userId, requireActive = false) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  console.log('🔍 Validating booking:', {
    bookingId,
    userId,
    bookingUser: booking.user.toString(),
    bookingStatus: booking.status,
    bookingReturnStatus: booking.returnStatus,
    requireActive
  });

  // ✅ Check booking belongs to user
  if (booking.user.toString() !== userId.toString()) {
    throw new Error('Unauthorized: This booking does not belong to you');
  }

  // ✅ If requireActive flag is true, check booking must be ONGOING or CONFIRMED
  // Otherwise, just check it's not completed
  if (requireActive) {
    // For location updates during trip - STRICT check
    if (booking.status !== BOOKING_STATUS.ONGOING && booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new Error(`❌ Booking is not active (status: ${booking.status}). Tracking only available for active bookings.`);
    }
  } else {
    // For location sharing toggle - PERMISSIVE check
    // Only reject if COMPLETED
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new Error('❌ Cannot enable tracking for completed bookings.');
    }
  }

  return booking;
};

/**
 * Update vehicle location - ✅ CUSTOMER ONLY
 * 
 * - Validates booking belongs to user
 * - Only works for ACTIVE bookings
 * - Creates tracking if doesn't exist
 */
const updateLocation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { lat, lng, speed = 0, accuracy = null } = req.body;

    // Validate input
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    console.log('📍 Location update:', { bookingId, lat, lng });

    // Validate booking access - REQUIRE ACTIVE for live updates
    const booking = await validateBookingAccess(bookingId, req.user._id, true);

    // Initialize tracking if not exists
    let tracking = await VehicleTracking.findOne({ booking: bookingId, isActive: true });
    if (!tracking) {
      tracking = await trackingService.initializeTracking(bookingId, booking.vehicle, req.user._id);
    }

    // Update location in VehicleTracking collection
    const updated = await trackingService.updateLocation(bookingId, lat, lng, speed, accuracy);

    // 📍 ALSO UPDATE BOOKING DOCUMENT for dashboard quick access
    booking.currentLocation = {
      latitude: lat,
      longitude: lng,
      updatedAt: new Date()
    };
    booking.isTracking = true;
    await booking.save();

    console.log('✅ Booking location updated:', { bookingId, lat, lng });

    res.json({
      message: 'Location updated successfully',
      tracking: {
        _id: updated._id,
        status: updated.status,
        currentLocation: updated.currentLocation,
        currentSpeed: updated.currentSpeed,
        lastUpdate: updated.lastUpdate
      }
    });
  } catch (error) {
    console.error('❌ Error updating location:', error.message);
    const statusCode = error.message?.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({ message: error.message || 'Failed to update location' });
  }
};

/**
 * Get tracking data for own booking - ✅ CUSTOMER ONLY
 */
const getTrackingByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log('📊 Get tracking:', { bookingId });

    // Validate booking access
    await validateBookingAccess(bookingId, req.user._id);

    const tracking = await trackingService.getTrackingByBooking(bookingId);

    if (!tracking) {
      return res.status(404).json({ message: 'No tracking data available yet' });
    }

    res.json({
      tracking: {
        _id: tracking._id,
        status: tracking.status,
        currentLocation: tracking.currentLocation,
        currentSpeed: tracking.currentSpeed,
        maxSpeed: tracking.maxSpeed,
        lastUpdate: tracking.lastUpdate,
        locationHistory: tracking.locationHistory,
        tripEvents: tracking.tripEvents,
        totalDistance: tracking.totalDistance,
        locationSharingEnabled: tracking.locationSharingEnabled
      }
    });
  } catch (error) {
    console.error('❌ Error getting tracking:', error.message);
    const statusCode = error.message?.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({ message: error.message || 'Failed to get tracking data' });
  }
};

/**
 * Get trip summary - ✅ CUSTOMER ONLY
 */
const getTripSummary = async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log('📈 Trip summary:', { bookingId });

    // Validate booking access
    await validateBookingAccess(bookingId, req.user._id);

    const summary = await trackingService.getTripSummary(bookingId);

    res.json({ summary });
  } catch (error) {
    console.error('❌ Error getting trip summary:', error.message);
    const statusCode = error.message?.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({ message: error.message || 'Failed to get trip summary' });
  }
};

/**
 * End tracking - ✅ CUSTOMER ONLY
 */
const endTracking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log('⏹️ End tracking:', { bookingId });

    // Validate booking access - REQUIRE ACTIVE for ending tracking
    await validateBookingAccess(bookingId, req.user._id, true);

    const tracking = await trackingService.endTracking(bookingId);

    res.json({
      message: 'Tracking ended',
      tracking: {
        _id: tracking._id,
        status: tracking.status,
        totalDistance: tracking.totalDistance,
        totalMovingTime: tracking.totalMovingTime,
        maxSpeed: tracking.maxSpeed
      }
    });
  } catch (error) {
    console.error('❌ Error ending tracking:', error.message);
    const statusCode = error.message?.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({ message: error.message || 'Failed to end tracking' });
  }
};

/**
 * Enable location sharing - ✅ CUSTOMER ONLY
 */
const enableLocationSharing = async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log('🔐 Enable location sharing request:', { bookingId, userId: req.user?._id });

    // Validate booking access (permissive - allow any non-completed booking)
    const booking = await validateBookingAccess(bookingId, req.user._id, false);

    const tracking = await trackingService.enableLocationSharing(bookingId);

    // 📍 UPDATE BOOKING: Set isTracking to true
    booking.isTracking = true;
    await booking.save();

    console.log('✅ Location sharing enabled for booking:', bookingId);

    res.json({
      success: true,
      message: 'Location sharing enabled',
      data: {
        bookingId,
        locationSharingEnabled: tracking.locationSharingEnabled,
        trackingId: tracking._id
      }
    });
  } catch (error) {
    console.error('❌ Error enabling location sharing:', error.message);
    const statusCode = error.message?.includes('Unauthorized') ? 403 : error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Failed to enable location sharing',
      error: error.message
    });
  }
};

/**
 * Disable location sharing - ✅ CUSTOMER ONLY
 */
const disableLocationSharing = async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log('🔐 Disable location sharing request:', { bookingId, userId: req.user?._id });

    // Validate booking access (permissive - allow any booking)
    const booking = await validateBookingAccess(bookingId, req.user._id, false);

    const tracking = await trackingService.disableLocationSharing(bookingId);

    // 📍 UPDATE BOOKING: Set isTracking to false
    booking.isTracking = false;
    await booking.save();

    console.log('✅ Location sharing disabled for booking:', bookingId);

    res.json({
      success: true,
      message: 'Location sharing disabled',
      data: {
        bookingId,
        locationSharingEnabled: tracking.locationSharingEnabled,
        trackingId: tracking._id
      }
    });
  } catch (error) {
    console.error('❌ Error disabling location sharing:', error.message);
    const statusCode = error.message?.includes('Unauthorized') ? 403 : error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Failed to disable location sharing',
      error: error.message
    });
  }
};

/**
 * Get all active vehicles - ✅ STAFF/ADMIN ONLY
 * 
 * Show all active bookings with real-time location
 */
const getActiveVehicles = async (req, res) => {
  try {
    const { status } = req.query;

    console.log('🚗 Get active vehicles:', { status, userId: req.user?._id });

    let vehicles;

    if (status) {
      vehicles = await trackingService.getVehiclesByStatus(status);
    } else {
      vehicles = await trackingService.getActiveTracking();
    }

    res.json({
      count: vehicles.length,
      vehicles: vehicles.map(v => ({
        _id: v._id,
        bookingId: v.booking._id,
        vehicleId: v.vehicle._id,
        vehicleName: v.vehicle.model,
        registrationNumber: v.vehicle.registrationNumber,
        userName: v.user.name,
        userPhone: v.user.phone,
        status: v.status,
        currentLocation: v.currentLocation,
        currentSpeed: v.currentSpeed,
        maxSpeed: v.maxSpeed,
        lastUpdate: v.lastUpdate,
        totalDistance: v.totalDistance
      }))
    });
  } catch (error) {
    console.error('❌ Error getting active vehicles:', error.message);
    res.status(500).json({ message: error.message || 'Failed to get active vehicles' });
  }
};

/**
 * Get live tracking data - ✅ STAFF/ADMIN ONLY (or customers for their own)
 * 
 * Returns all bookings with location tracking enabled
 * Includes vehicle, customer, and current location information
 * Shows bookings even while waiting for first location update
 * 
 * Parameters:
 * - includeWaiting: (query param, default=true) Include vehicles waiting for first location
 * 
 * Response structure:
 * {
 *   success: boolean,
 *   count: number,
 *   data: [
 *     {
 *       _id: string,
 *       bookingId: string,
 *       vehicleName: string,
 *       customerName: string,
 *       status: "waiting" | "active" | "completed",
 *       locationSharingEnabled: boolean,
 *       latitude: number | null,
 *       longitude: number | null,
 *       lastUpdated: Date | null
 *     }
 *   ]
 * }
 */
const getLiveTracking = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const { includeWaiting = 'true' } = req.query;
    
    console.log('🔴 Fetch live tracking data:', { userId, userRole, includeWaiting });

    // ✅ ROLE-BASED ACCESS CONTROL
    // Allow staff and admin to see all, customers to see their own
    let filter = { isTracking: true };
    
    if (userRole === 'customer') {
      filter.user = userId;
      console.log('👤 CUSTOMER MODE - Fetching only own bookings');
    } else if (userRole === 'staff' || userRole === 'admin') {
      console.log('👨‍💼 STAFF/ADMIN MODE - Fetching all tracked bookings');
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only staff, admin, and customers can access tracking data.'
      });
    }

    // Fetch bookings with tracking enabled
    const bookings = await Booking.find(filter)
      .populate('user', 'name phone email')
      .populate('vehicle', 'name model registrationNumber vehicleType')
      .sort({ updatedAt: -1 });

    console.log(`📊 Total bookings found: ${bookings.length}`);
    
    // Transform to response format
    const liveVehicles = bookings
      .map(booking => {
        // Determine tracking status
        const hasCoordinates = booking.currentLocation?.latitude && booking.currentLocation?.longitude;
        let trackingStatus = 'completed'; // default
        
        if (booking.status === 'completed') {
          trackingStatus = 'completed';
        } else if (hasCoordinates) {
          trackingStatus = 'active';
        } else {
          trackingStatus = 'waiting';
        }

        const vehicleData = {
          _id: booking._id.toString(),
          bookingId: booking._id.toString(),
          vehicleName: booking.vehicle?.name || booking.vehicle?.model || 'Unknown Vehicle',
          customerName: booking.user?.name || 'Unknown Customer',
          status: trackingStatus,
          locationSharingEnabled: booking.isTracking === true,
          latitude: booking.currentLocation?.latitude || null,
          longitude: booking.currentLocation?.longitude || null,
          lastUpdated: booking.currentLocation?.updatedAt || null,
          // Additional fields for dashboard/UI
          customerPhone: booking.user?.phone,
          registrationNumber: booking.vehicle?.registrationNumber || 'N/A',
          vehicleType: booking.vehicle?.vehicleType || 'N/A',
          bookingStatus: booking.status,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        };

        return vehicleData;
      })
      .filter(v => {
        // Filter out "waiting" vehicles if includeWaiting is false
        if (includeWaiting === 'false' && v.status === 'waiting') {
          return false;
        }
        return true;
      });

    const waitingCount = liveVehicles.filter(v => v.status === 'waiting').length;
    const activeCount = liveVehicles.filter(v => v.status === 'active').length;
    const completedCount = liveVehicles.filter(v => v.status === 'completed').length;

    console.log(`✅ Returning ${liveVehicles.length} tracked vehicles - Active: ${activeCount}, Waiting: ${waitingCount}, Completed: ${completedCount}`);

    res.json({
      success: true,
      count: liveVehicles.length,
      summary: {
        active: activeCount,
        waiting: waitingCount,
        completed: completedCount
      },
      data: liveVehicles
    });
  } catch (error) {
    console.error('❌ Error fetching live tracking:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch live tracking data',
      error: error.message
    });
  }
};

module.exports = {
  updateLocation,
  getTrackingByBooking,
  getTripSummary,
  enableLocationSharing,
  disableLocationSharing,
  endTracking,
  getActiveVehicles,
  getLiveTracking
};

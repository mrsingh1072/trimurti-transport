const express = require('express');
const router = express.Router();

const trackingController = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../config/constants');

/**
 * 🔐 ROLE-BASED ACCESS CONTROL
 * 
 * CUSTOMER: Can only manage their own booking location
 * STAFF: Can view all active vehicles
 * ADMIN: Full access to all tracking data
 */

// ==========================================
// STAFF/ADMIN ROUTES (View all vehicles) - MUST BE FIRST
// ==========================================

// Get all active vehicles for dashboard monitoring
// ✅ Only Staff and Admin can access
router.get(
  '/admin/vehicles/active', 
  protect, 
  authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN), 
  trackingController.getActiveVehicles
);

// Get live tracking data for all active bookings with location sharing enabled
// ✅ Staff and Admin get ALL vehicles
// ✅ Customers get THEIR OWN tracked bookings (NEW!)
router.get(
  '/live',
  protect,
  trackingController.getLiveTracking
);

// ==========================================
// CUSTOMER ROUTES (Only access own booking)
// ==========================================

// Update own vehicle location (during active ride)
router.post('/:bookingId/location', protect, trackingController.updateLocation);

// Get own booking tracking data
router.get('/:bookingId', protect, trackingController.getTrackingByBooking);

// Toggle location sharing for own booking
router.post('/:bookingId/location-sharing/enable', protect, trackingController.enableLocationSharing);
router.post('/:bookingId/location-sharing/disable', protect, trackingController.disableLocationSharing);

// Get own trip summary after ride
router.get('/:bookingId/summary', protect, trackingController.getTripSummary);

// End own ride tracking
router.post('/:bookingId/end', protect, trackingController.endTracking);

module.exports = router;

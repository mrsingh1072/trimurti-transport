const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../config/constants');

// All admin routes require admin role
router.use(protect, authorize(USER_ROLES.ADMIN));

// ADMIN DASHBOARD
router.get('/dashboard', adminController.getDashboard);

// ADMIN MONITORING
router.get('/bookings/all', adminController.viewAllBookings);
router.get('/bookings/late', adminController.viewLateBookings);
router.get('/bookings/pending-returns', adminController.viewPendingReturns);
router.get('/bookings/pending-waivers', adminController.viewPendingWaivers);

// ADMIN OVERRIDE
router.put('/bookings/:id/override', adminController.overrideBooking);

// ADMIN ACTION LOG
router.get('/action-log', adminController.viewActionLog);

// ADMIN ANALYTICS
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

module.exports = router;

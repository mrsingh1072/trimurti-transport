const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../config/constants');

// Controllers
const customerCouponController = require('../controllers/customerCouponController');
const staffCouponController = require('../controllers/staffCouponController');
const adminCouponController = require('../controllers/adminCouponController');

/**
 * CUSTOMER COUPON ROUTES
 * /api/coupons/*
 */

// Apply coupon to booking
router.post('/apply', protect, customerCouponController.applyCoupon);

// Get all active coupons for current booking amount
router.get('/active', protect, customerCouponController.getActiveCoupons);

// Validate a coupon before applying
router.post('/validate', protect, customerCouponController.validateCoupon);

// Get best coupon for user
router.get('/best', protect, customerCouponController.getBestCoupon);

// Get upcoming festivals and offers
router.get('/upcoming', protect, customerCouponController.getUpcomingOffers);

// Get wallet balance
router.get('/wallet/balance', protect, customerCouponController.getWalletBalance);

// Get referral code
router.get('/referral/code', protect, customerCouponController.getReferralCode);

// Get coupon usage history
router.get('/history', protect, customerCouponController.getCouponUsageHistory);

// Check loyalty status
router.get('/loyalty/status', protect, customerCouponController.checkLoyaltyStatus);

/**
 * STAFF COUPON ROUTES
 * /api/staff/coupons/*
 */

// Get discount analytics
router.get(
  '/analytics',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.getDiscountAnalytics
);

// Get discounted bookings
router.get(
  '/discount-bookings',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.getDiscountedBookings
);

// Get active coupons
router.get(
  '/list',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.getActiveCoupons
);

// Get coupon stats
router.get(
  '/stats/:couponId',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.getCouponStats
);

// Check for suspicious activity
router.get(
  '/check-suspicious/:userId',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.checkSuspiciousActivity
);

// Get top offers
router.get(
  '/top-offers',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.getTopOffers
);

// Get recommendations for customer
router.get(
  '/recommendations',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.getRecommendations
);

// Get today's metrics
router.get(
  '/daily-metrics',
  protect,
  authorize(USER_ROLES.STAFF),
  staffCouponController.getDailyMetrics
);

/**
 * ADMIN COUPON ROUTES
 * /api/admin/coupons/*
 */

// Create coupon
router.post(
  '/create',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.createCoupon
);

// Get all coupons
router.get(
  '/list',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.getAllCoupons
);

// Update coupon
router.put(
  '/update/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.updateCoupon
);

// Delete coupon
router.delete(
  '/delete/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.deleteCoupon
);

// Toggle coupon status (activate/deactivate)
router.patch(
  '/toggle/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.toggleCouponStatus
);

// Get coupon stats
router.get(
  '/stats/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.getCouponStats
);

/**
 * FESTIVAL OFFER ROUTES
 * /api/admin/festival/*
 */

// Create festival offer
router.post(
  '/festival/create',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.createFestivalOffer
);

// Get all festival offers
router.get(
  '/festival/list',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.getAllFestivalOffers
);

// Update festival offer
router.put(
  '/festival/update/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.updateFestivalOffer
);

// Toggle festival offer status
router.patch(
  '/festival/toggle/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.toggleFestivalOfferStatus
);

/**
 * ADMIN ANALYTICS & REPORTING
 */

// Get dashboard stats
router.get(
  '/dashboard/stats',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.getDashboardStats
);

// Approve referral reward
router.post(
  '/referral/approve/:referralId',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.approveCouponReferral
);

// Export discount report
router.get(
  '/report/export',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminCouponController.exportDiscountReport
);

module.exports = router;

const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { validate } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createBookingSchema } = require('../validations/bookingValidation');
const { USER_ROLES } = require('../config/constants');

// PUBLIC ROUTES
router.get('/stats', bookingController.getBookingStats);

// CUSTOMER ROUTES (Protected)
router.post('/', protect, validate(createBookingSchema), bookingController.createBooking);
router.get('/my', protect, bookingController.getMyBookings);
router.get('/details/:id', protect, bookingController.getBookingDetails);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

// CUSTOMER RETURN & WAIVER REQUESTS
router.post('/:id/request-return', protect, bookingController.requestReturn);
router.post('/:id/request-waiver', protect, bookingController.requestWaiver);

// STAFF/ADMIN RETURN PROCESSING
router.post('/:id/process-return', protect, authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN), bookingController.processReturn);

// STAFF/ADMIN PENALTY MANAGEMENT
router.put('/:id/penalty', protect, authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN), bookingController.updatePenalty);

// STAFF/ADMIN WAIVER HANDLING
router.put('/:id/waiver', protect, authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN), bookingController.handleWaiver);

// STAFF/ADMIN MONITORING
router.get('/late/bookings', protect, authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN), bookingController.getLateBookings);
router.get('/returns/pending', protect, authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN), bookingController.getPendingReturns);
router.get('/waivers/pending', protect, authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN), bookingController.getPendingWaivers);

// ADMIN ROUTES
router.get('/', bookingController.getAllBookings);

module.exports = router;

const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { createBookingSchema } = require('../validations/bookingValidation');

router.post('/', protect, validate(createBookingSchema), bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/stats', bookingController.getBookingStats);
router.get('/my', protect, bookingController.getMyBookings);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;

const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../config/constants');

// Customer creates payment order for their booking
router.post('/create-order', protect, paymentController.createOrder);

// Customer/Staff/Admin verifies booking payment
router.post('/verify', protect, paymentController.verifyPayment);

// Customer creates fine payment order (late fee + damage fee)
router.post('/pay-fine', protect, paymentController.createFinePaymentOrder);

// Customer verifies fine payment
router.post('/verify-fine', protect, paymentController.verifyFinePayment);

// Get payments (customer sees own, staff/admin see all)
router.get('/', protect, paymentController.getPayments);

// Get single payment details
router.get('/:id', protect, paymentController.getPaymentById);

// Get payment statistics (admin only)
router.get(
  '/stats/overview',
  protect,
  authorize(USER_ROLES.ADMIN),
  paymentController.getStats
);

module.exports = router;

const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { validate } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createPaymentSchema } = require('../validations/paymentValidation');
const { USER_ROLES } = require('../config/constants');

router.post(
  '/',
  protect,
  authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validate(createPaymentSchema),
  paymentController.createPayment
);

module.exports = router;

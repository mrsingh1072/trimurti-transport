const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../validations/authValidation');
const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../config/constants');

// Public auth routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Admin only routes for staff approval
router.get('/staff/pending', protect, authorize(USER_ROLES.ADMIN), authController.getPendingStaff);
router.get('/staff/all', protect, authorize(USER_ROLES.ADMIN), authController.getAllStaff);
router.put('/staff/:staffId/approve', protect, authorize(USER_ROLES.ADMIN), authController.approveStaff);
router.put('/staff/:staffId/reject', protect, authorize(USER_ROLES.ADMIN), authController.rejectStaff);

module.exports = router;

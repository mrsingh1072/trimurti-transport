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

// Diagnostic endpoint - test if token is valid
router.get('/verify-token', protect, (req, res) => {
  console.log('\n✅ [VERIFY TOKEN] Success - Token is valid');
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      name: req.user.name
    }
  });
});

// Admin only routes for staff approval
router.get('/staff/pending', protect, authorize(USER_ROLES.ADMIN), authController.getPendingStaff);
router.get('/staff/all', protect, authorize(USER_ROLES.ADMIN), authController.getAllStaff);
router.put('/staff/:staffId/approve', protect, authorize(USER_ROLES.ADMIN), authController.approveStaff);
router.put('/staff/:staffId/reject', protect, authorize(USER_ROLES.ADMIN), authController.rejectStaff);

module.exports = router;

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUsersByRole,
  getUserStats,
  getUserById,
  deleteUser,
} = require('../controllers/userController');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// All user routes require authentication and admin authorization
router.use(protect);
router.use(authorize(USER_ROLES.ADMIN));

// Get all users
router.get('/', getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Get users by role (customer, staff, admin)
router.get('/role/:role', getUsersByRole);

// Get single user
router.get('/:id', getUserById);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;

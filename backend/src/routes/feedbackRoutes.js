const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// PUBLIC: Get latest 3 feedback (for landing page)
router.get('/latest', feedbackController.getLatestFeedback);

// PUBLIC: Get average rating
router.get('/average', feedbackController.getAverageRating);

// CUSTOMER: Submit feedback (protected, customer only)
router.post('/', protect, authorize(USER_ROLES.CUSTOMER), feedbackController.submitFeedback);

// ADMIN/STAFF: Get all feedback (protected, admin/staff only)
router.get('/', protect, authorize(USER_ROLES.ADMIN, USER_ROLES.STAFF), feedbackController.getAllFeedback);

module.exports = router;

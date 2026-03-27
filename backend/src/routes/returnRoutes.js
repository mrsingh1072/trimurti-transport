const express = require('express');
const router = express.Router();

const returnController = require('../controllers/returnController');
const { validate } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { processReturnSchema } = require('../validations/returnValidation');
const { USER_ROLES } = require('../config/constants');

router.post(
  '/',
  protect,
  authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validate(processReturnSchema),
  returnController.processReturn
);

module.exports = router;

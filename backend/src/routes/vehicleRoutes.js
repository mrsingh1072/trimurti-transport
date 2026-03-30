const express = require('express');
const router = express.Router();

const vehicleController = require('../controllers/vehicleController');
const { validate } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createVehicleSchema, updateVehicleSchema } = require('../validations/vehicleValidation');
const { USER_ROLES } = require('../config/constants');

router.post(
  '/',
  protect,
  authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);

router.get('/', vehicleController.getVehicles);
router.get('/stats', vehicleController.getVehicleStats);
router.get('/count', vehicleController.getVehicleCount);
router.get('/:id', vehicleController.getVehicleById);

router.put(
  '/:id',
  protect,
  authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  protect,
  authorize(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  vehicleController.deleteVehicle
);

module.exports = router;

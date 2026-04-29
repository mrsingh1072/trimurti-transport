const vehicleService = require('../services/vehicleService');

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

const getVehicles = async (req, res) => {
  const result = await vehicleService.listVehicles(req.query);
  res.json(result);
};

const getVehicleById = async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  res.json(vehicle);
};

const updateVehicle = async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  res.json({ message: 'Vehicle updated', vehicle });
};

const deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const getVehicleStats = async (req, res) => {
  const stats = await vehicleService.getVehicleStats();
  res.json(stats);
};

const getVehicleCount = async (req, res) => {
  const count = await vehicleService.getVehicleCount();
  res.json(count);
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
  getVehicleCount,
};

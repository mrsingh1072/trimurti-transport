const Vehicle = require('../models/Vehicle');

const createVehicle = async (data) => {
  const vehicle = await Vehicle.create(data);
  return vehicle;
};

const listVehicles = async ({ page = 1, limit = 10, category, location, availability }) => {
  const query = {};
  if (category) query.category = category;
  if (location) query.location = location;
  if (availability !== undefined) query.availability = availability === 'true';

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Vehicle.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Vehicle.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / limit) || 1,
  };
};

const getVehicleById = (id) => Vehicle.findById(id);

const updateVehicle = async (id, data) => {
  const vehicle = await Vehicle.findByIdAndUpdate(id, data, { new: true });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return vehicle;
};

const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return vehicle;
};

module.exports = {
  createVehicle,
  listVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};

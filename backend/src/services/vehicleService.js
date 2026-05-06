const Vehicle = require('../models/Vehicle');

const createVehicle = async (data) => {
  // Always set isDeleted to false on create
  data.isDeleted = false;
  const vehicle = await Vehicle.create(data);
  return vehicle;
};

const listVehicles = async ({ page = 1, limit = 10, category, location, availability }) => {
  const query = { isDeleted: false };
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

const getVehicleById = (id) => Vehicle.findOne({ _id: id, isDeleted: false });

const updateVehicle = async (id, data) => {
  const vehicle = await Vehicle.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return vehicle;
};

// Prevent delete if active/pending/ongoing bookings exist
const Booking = require('../models/Booking');
const deleteVehicle = async (id, user) => {
  const now = new Date();

  // Only block delete for active or upcoming bookings. Historical records should not block soft delete.
  const activeBookings = await Booking.countDocuments({
    vehicle: id,
    status: { $in: ['pending', 'confirmed', 'ongoing'] },
    endDate: { $gte: now },
  });
  if (activeBookings > 0) {
    const error = new Error('Vehicle cannot be deleted because it has active or upcoming bookings.');
    error.statusCode = 400;
    throw error;
  }
  const update = {
    isDeleted: true,
    deletedBy: user?._id || null,
    deletedByRole: user?.role || null,
    deletedAt: new Date(),
  };
  const vehicle = await Vehicle.findOneAndUpdate({ _id: id, isDeleted: false }, update, { new: true });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return vehicle;
};

const getVehicleStats = async () => {
  const [total, available] = await Promise.all([
    Vehicle.countDocuments({ isDeleted: false }),
    Vehicle.countDocuments({ availability: true, isDeleted: false }),
  ]);
  return {
    totalVehicles: total,
    availableVehicles: available,
    activeBookings: total - available,
    totalRevenue: 0, // Calculate from completed bookings if needed
  };
};

const getVehicleCount = async () => {
  const [total, available] = await Promise.all([
    Vehicle.countDocuments({ isDeleted: false }),
    Vehicle.countDocuments({ availability: true, isDeleted: false }),
  ]);
  return { total, available };
};

module.exports = {
  createVehicle,
  listVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
  getVehicleCount,
};

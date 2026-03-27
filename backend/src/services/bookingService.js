const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { BOOKING_STATUS } = require('../config/constants');
const { calculateBaseRentalCost, calculateLateFee } = require('../utils/pricingUtils');

const hasOverlap = async (vehicleId, startDate, endDate) => {
  const overlapping = await Booking.findOne({
    vehicle: vehicleId,
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ONGOING] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
    ],
  });
  return !!overlapping;
};

const createBooking = async (userId, { vehicleId, startDate, endDate }) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  if (!vehicle.availability) {
    const error = new Error('Vehicle is not available for booking');
    error.statusCode = 400;
    throw error;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) {
    const error = new Error('End date must be after start date');
    error.statusCode = 400;
    throw error;
  }

  const overlap = await hasOverlap(vehicleId, start, end);
  if (overlap) {
    const error = new Error('Vehicle is already booked for the selected dates');
    error.statusCode = 400;
    throw error;
  }

  const totalPrice = calculateBaseRentalCost(vehicle.pricePerDay, start, end);

  const booking = await Booking.create({
    user: userId,
    vehicle: vehicleId,
    startDate: start,
    endDate: end,
    totalPrice,
    status: BOOKING_STATUS.CONFIRMED,
  });

  vehicle.availability = false;
  await vehicle.save();

  return booking;
};

const getUserBookings = (userId) => {
  return Booking.find({ user: userId })
    .populate('vehicle')
    .sort({ createdAt: -1 });
};

const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId).populate('vehicle');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (booking.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to cancel this booking');
    error.statusCode = 403;
    throw error;
  }

  if (![BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING].includes(booking.status)) {
    const error = new Error('Only pending or confirmed bookings can be cancelled');
    error.statusCode = 400;
    throw error;
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  if (booking.vehicle) {
    booking.vehicle.availability = true;
    await booking.vehicle.save();
  }

  return booking;
};

const processReturnLogic = async ({ bookingId, actualReturnDate, damageDescription, damageCost }) => {
  const BookingModel = Booking;
  const booking = await BookingModel.findById(bookingId).populate('vehicle');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (![BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ONGOING].includes(booking.status)) {
    const error = new Error('Only active bookings can be returned');
    error.statusCode = 400;
    throw error;
  }

  const actualReturn = new Date(actualReturnDate || Date.now());
  const lateFee = calculateLateFee(
    booking.vehicle.pricePerDay,
    booking.endDate,
    actualReturn
  );
  const damageFee = damageCost ? Number(damageCost) : 0;

  const finalAmount = booking.totalPrice + lateFee + damageFee;

  booking.actualReturnDate = actualReturn;
  booking.lateFee = lateFee;
  booking.damageFee = damageFee;
  booking.finalAmount = finalAmount;
  booking.status = BOOKING_STATUS.COMPLETED;
  await booking.save();

  if (booking.vehicle) {
    booking.vehicle.availability = true;
    await booking.vehicle.save();
  }

  return { booking, finalAmount, lateFee, damageFee, damageDescription };
};

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  processReturnLogic,
};

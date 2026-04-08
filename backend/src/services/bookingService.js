const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { BOOKING_STATUS, RETURN_STATUS } = require('../config/constants');
const { calculateBaseRentalCost, calculateLateFee, calculateLateFeeBydHours } = require('../utils/pricingUtils');
const { diffInHours, diffInDays } = require('../utils/dateUtils');

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

const createBooking = async (userId, { vehicleId, startDate, endDate, durationType = 'days', durationValue = null }) => {
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
  let end = new Date(endDate);
  
  // VALIDATION: Start date must be before end date
  if (start >= end) {
    const error = new Error('End date must be after start date');
    error.statusCode = 400;
    throw error;
  }

  // VALIDATION: Maximum booking limit (720 hours = 30 days)
  const MAX_HOURS = 720;
  let hoursRequested = diffInHours(start, end);
  if (hoursRequested > MAX_HOURS) {
    const error = new Error(`Booking duration cannot exceed ${MAX_HOURS} hours (30 days)`);
    error.statusCode = 400;
    throw error;
  }

  // DETERMINE DURATION (support both old and new formats)
  let finalDurationType = durationType || 'days';
  let finalDurationValue = durationValue;
  let totalPrice = 0;

  // If duration parameters provided (NEW FORMAT: hourly or daily)
  if (durationValue !== null && ['hours', 'days'].includes(durationType)) {
    // Validate duration value
    if (durationValue <= 0) {
      const error = new Error('Duration must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    finalDurationType = durationType;
    finalDurationValue = durationValue;

    // AUTO-CONVERSION: 24+ hours → days
    if (durationType === 'hours' && durationValue >= 24) {
      const wholeHours = Math.floor(durationValue);
      const wholeDays = Math.floor(wholeHours / 24);
      const remainingHours = wholeHours % 24;

      const pricePerHour = vehicle.pricePerDay / 24;

      totalPrice = (wholeDays * vehicle.pricePerDay) + (remainingHours * pricePerHour);
      
      // Recalculate end date based on hours
      end = new Date(start);
      end.setHours(end.getHours() + durationValue);

      // If >= 24 hours, store as days
      finalDurationType = 'days';
      finalDurationValue = wholeDays + (remainingHours > 0 ? (remainingHours / 24) : 0);
    } else if (durationType === 'hours') {
      // Less than 24 hours - store as hours
      const pricePerHour = vehicle.pricePerDay / 24;
      totalPrice = durationValue * pricePerHour;
      
      // Calculate end date based on hours
      end = new Date(start);
      end.setHours(end.getHours() + durationValue);
    } else if (durationType === 'days') {
      // Daily rental
      totalPrice = durationValue * vehicle.pricePerDay;
      
      // Calculate end date based on days
      end = new Date(start);
      end.setDate(end.getDate() + durationValue);
    }
  } else {
    // OLD FORMAT: Using startDate and endDate (backward compatibility)
    finalDurationType = 'days';
    finalDurationValue = diffInDays(start, end);
    totalPrice = calculateBaseRentalCost(vehicle.pricePerDay, start, end);
  }

  // Ensure price is valid
  totalPrice = Math.max(totalPrice, 1);

  // CHECK FOR BOOKING CONFLICTS
  const overlap = await hasOverlap(vehicleId, start, end);
  if (overlap) {
    const error = new Error('Vehicle is already booked for the selected dates');
    error.statusCode = 400;
    throw error;
  }

  // CREATE BOOKING with all calculated values
  const booking = await Booking.create({
    user: userId,
    vehicle: vehicleId,
    startDate: start,
    endDate: end,
    totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
    status: BOOKING_STATUS.CONFIRMED,
    pickupDateTime: start,
    dropoffDateTime: end,
    durationType: finalDurationType,
    durationValue: finalDurationValue,
    returnStatus: RETURN_STATUS.NONE,
  });

  vehicle.availability = false;
  await vehicle.save();

  console.log(`✅ Booking created: ${finalDurationValue} ${finalDurationType} @ ₹${booking.totalPrice}`);

  return booking;
};

const getUserBookings = (userId) => {
  return Booking.find({ user: userId })
    .populate('vehicle')
    .sort({ createdAt: -1 });
};

const getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate('vehicle')
    .populate('user', 'name email phone');
  
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  return booking;
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

// AUTO LATE DETECTION
const checkAndMarkLateBookings = async () => {
  const now = new Date();
  const lateBookings = await Booking.updateMany(
    {
      status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ONGOING] },
      endDate: { $lt: now },
      isLate: false,
    },
    { isLate: true }
  );
  return lateBookings;
};

// REQUEST RETURN (Customer)
const requestReturn = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (booking.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to request return for this booking');
    error.statusCode = 403;
    throw error;
  }

  // Check if return has already been requested
  if (booking.returnStatus === RETURN_STATUS.REQUESTED) {
    const error = new Error('Return already requested');
    error.statusCode = 400;
    throw error;
  }

  // Check if vehicle has already been returned
  if (booking.returnStatus === RETURN_STATUS.PROCESSED) {
    const error = new Error('Vehicle already returned');
    error.statusCode = 400;
    throw error;
  }

  booking.returnStatus = RETURN_STATUS.REQUESTED;
  await booking.save();

  return booking;
};

// REQUEST WAIVER (Customer)
const requestWaiver = async (bookingId, userId, reason) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (booking.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to request waiver for this booking');
    error.statusCode = 403;
    throw error;
  }

  if (booking.lateFee <= 0 && booking.damageFee <= 0) {
    const error = new Error('No penalties to waive');
    error.statusCode = 400;
    throw error;
  }

  booking.waiverRequested = true;
  booking.waiverReason = reason || '';
  await booking.save();

  return booking;
};

// PROCESS RETURN (Staff/Admin)
const processReturn = async (bookingId, { actualReturnDate, damageFee }, modifiedBy = 'staff') => {
  const booking = await Booking.findById(bookingId).populate('vehicle');
  
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if return has been requested
  if (booking.returnStatus !== RETURN_STATUS.REQUESTED) {
    const error = new Error('Return has not been requested for this booking');
    error.statusCode = 400;
    throw error;
  }

  const actualReturn = new Date(actualReturnDate || Date.now());
  
  // Calculate late fee
  let lateFee = 0;
  if (actualReturn > booking.endDate) {
    lateFee = calculateLateFee(
      booking.vehicle.pricePerDay,
      booking.endDate,
      actualReturn
    );
  }

  const damageFeeAmount = damageFee ? Number(damageFee) : 0;
  const finalAmount = booking.totalPrice + lateFee + damageFeeAmount;

  booking.actualReturnDate = actualReturn;
  booking.lateFee = lateFee;
  booking.damageFee = damageFeeAmount;
  booking.finalAmount = finalAmount;
  booking.returnStatus = RETURN_STATUS.PROCESSED;
  booking.status = BOOKING_STATUS.COMPLETED;
  booking.isLate = actualReturn > booking.endDate;
  booking.penaltyModifiedBy = modifiedBy;
  booking.penaltyModifiedAt = new Date();

  await booking.save();

  if (booking.vehicle) {
    booking.vehicle.availability = true;
    await booking.vehicle.save();
  }

  return booking;
};

// UPDATE PENALTY (Staff/Admin - add/update/remove)
const updatePenalty = async (bookingId, { lateFee, damageFee }, modifiedBy = 'staff') => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (![BOOKING_STATUS.ONGOING, BOOKING_STATUS.COMPLETED].includes(booking.status)) {
    const error = new Error('Can only modify penalties for active or completed bookings');
    error.statusCode = 400;
    throw error;
  }

  // Update penalties (can be set to 0 to remove)
  booking.lateFee = lateFee !== undefined ? Number(lateFee) : booking.lateFee;
  booking.damageFee = damageFee !== undefined ? Number(damageFee) : booking.damageFee;
  
  // Recalculate final amount
  booking.finalAmount = booking.totalPrice + booking.lateFee + booking.damageFee;
  
  // Log who modified the penalty
  booking.penaltyModifiedBy = modifiedBy;
  booking.penaltyModifiedAt = new Date();

  await booking.save();

  return booking;
};

// HANDLE WAIVER (Staff/Admin - approve/reject)
const handleWaiver = async (bookingId, approve, modifiedBy = 'staff') => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (!booking.waiverRequested) {
    const error = new Error('No waiver request pending for this booking');
    error.statusCode = 400;
    throw error;
  }

  if (approve) {
    booking.waiverApproved = true;
    booking.lateFee = 0;
    booking.damageFee = 0;
    booking.finalAmount = booking.totalPrice;
  } else {
    booking.waiverApproved = false;
  }

  booking.waiverRequested = false;
  booking.penaltyModifiedBy = modifiedBy;
  booking.penaltyModifiedAt = new Date();

  await booking.save();

  return booking;
};

const processReturnLogic = async ({ bookingId, actualReturnDate, damageDescription, damageCost }) => {
  const booking = await Booking.findById(bookingId).populate('vehicle');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if return has been requested
  if (booking.returnStatus !== RETURN_STATUS.REQUESTED) {
    const error = new Error('Return has not been requested for this booking');
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

const getAllBookings = async () => {
  return Booking.find()
    .populate('vehicle')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

// GET LATE BOOKINGS (Admin/Staff)
const getLateBookings = async () => {
  return Booking.find({ isLate: true })
    .populate('vehicle')
    .populate('user', 'name email phone')
    .sort({ endDate: -1 });
};

// GET PENDING RETURN REQUESTS (Admin/Staff)
const getPendingReturnRequests = async () => {
  return Booking.find({ returnStatus: RETURN_STATUS.REQUESTED })
    .populate('vehicle')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
};

// GET PENDING WAIVER REQUESTS (Admin/Staff)
const getPendingWaiverRequests = async () => {
  return Booking.find({ waiverRequested: true, waiverApproved: false })
    .populate('vehicle')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
};

const getBookingStats = async () => {
  const now = new Date();
  
  const [total, active, completed, cancelled] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: BOOKING_STATUS.ONGOING }),
    Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED }),
    Booking.countDocuments({ status: BOOKING_STATUS.CANCELLED }),
  ]);

  // Get late bookings count
  const lateBookings = await Booking.countDocuments({ isLate: true });

  // Calculate total revenue from completed bookings
  const revenueData = await Booking.aggregate([
    { $match: { status: BOOKING_STATUS.COMPLETED } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$finalAmount' },
        totalPenalties: { $sum: { $add: ['$lateFee', '$damageFee'] } },
      },
    },
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;
  const totalPenalties = revenueData[0]?.totalPenalties || 0;

  return {
    totalBookings: total,
    activeBookings: active,
    completedBookings: completed,
    cancelledBookings: cancelled,
    lateBookings,
    totalRevenue,
    totalPenalties,
  };
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  checkAndMarkLateBookings,
  requestReturn,
  requestWaiver,
  processReturn,
  updatePenalty,
  handleWaiver,
  processReturnLogic,
  getAllBookings,
  getLateBookings,
  getPendingReturnRequests,
  getPendingWaiverRequests,
  getBookingStats,
};

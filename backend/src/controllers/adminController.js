const bookingService = require('../services/bookingService');
const Booking = require('../models/Booking');

// ADMIN DASHBOARD - Get comprehensive stats
const getDashboard = async (req, res) => {
  const stats = await bookingService.getBookingStats();
  
  // Get additional admin-specific data
  const lateReturns = await bookingService.getLateBookings();
  const pendingReturns = await bookingService.getPendingReturnRequests();
  const pendingWaivers = await bookingService.getPendingWaiverRequests();

  res.json({
    stats,
    monitoring: {
      lateReturns: lateReturns.length,
      pendingReturns: pendingReturns.length,
      pendingWaivers: pendingWaivers.length,
    },
  });
};

// ADMIN: VIEW ALL BOOKINGS WITH FILTERS
const viewAllBookings = async (req, res) => {
  const { status, returnStatus, isLate } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (returnStatus) filter.returnStatus = returnStatus;
  if (isLate !== undefined) filter.isLate = isLate === 'true';

  const bookings = await Booking.find(filter)
    .populate('vehicle')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.json({ bookings, total: bookings.length });
};

// ADMIN: VIEW LATE BOOKINGS
const viewLateBookings = async (req, res) => {
  const bookings = await bookingService.getLateBookings();
  res.json({ bookings, total: bookings.length });
};

// ADMIN: VIEW PENDING RETURNS
const viewPendingReturns = async (req, res) => {
  const bookings = await bookingService.getPendingReturnRequests();
  res.json({ bookings, total: bookings.length });
};

// ADMIN: VIEW PENDING WAIVERS
const viewPendingWaivers = async (req, res) => {
  const bookings = await bookingService.getPendingWaiverRequests();
  res.json({ bookings, total: bookings.length });
};

// ADMIN OVERRIDE: Modify any booking
const overrideBooking = async (req, res) => {
  const { status, returnStatus, lateFee, damageFee, isLate } = req.body;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      ...(status && { status }),
      ...(returnStatus && { returnStatus }),
      ...(lateFee !== undefined && { lateFee }),
      ...(damageFee !== undefined && { damageFee }),
      ...(isLate !== undefined && { isLate }),
      penaltyModifiedBy: 'admin',
      penaltyModifiedAt: new Date(),
    },
    { new: true }
  )
    .populate('vehicle')
    .populate('user', 'name email phone');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Recalculate final amount if penalties were modified
  if (booking.lateFee !== undefined || booking.damageFee !== undefined) {
    booking.finalAmount = booking.totalPrice + booking.lateFee + booking.damageFee;
    await booking.save();
  }

  res.json({ message: 'Booking overridden successfully', booking });
};

// ADMIN: View action log (who modified penalties)
const viewActionLog = async (req, res) => {
  const bookings = await Booking.find({
    penaltyModifiedAt: { $ne: null },
  })
    .populate('vehicle', 'name plateNumber')
    .populate('user', 'name email')
    .select('_id vehicle user lateFee damageFee finalAmount penaltyModifiedBy penaltyModifiedAt')
    .sort({ penaltyModifiedAt: -1 });

  res.json({ actionLog: bookings, total: bookings.length });
};

// ADMIN: Revenue Analytics
const getRevenueAnalytics = async (req, res) => {
  const analyticsData = await Booking.aggregate([
    {
      $match: { status: 'completed' },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$finalAmount' },
        totalBookings: { $sum: 1 },
        totalPenalties: { $sum: { $add: ['$lateFee', '$damageFee'] } },
        avgPenalty: { $avg: { $add: ['$lateFee', '$damageFee'] } },
      },
    },
  ]);

  const data = analyticsData[0] || {
    totalRevenue: 0,
    totalBookings: 0,
    totalPenalties: 0,
    avgPenalty: 0,
  };

  res.json(data);
};

module.exports = {
  getDashboard,
  viewAllBookings,
  viewLateBookings,
  viewPendingReturns,
  viewPendingWaivers,
  overrideBooking,
  viewActionLog,
  getRevenueAnalytics,
};

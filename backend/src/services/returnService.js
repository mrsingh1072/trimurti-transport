const { processReturnLogic } = require('./bookingService');
const { createPayment } = require('./paymentService');
const Booking = require('../models/Booking');
const { BOOKING_STATUS } = require('../config/constants');

const processReturn = async ({ bookingId, actualReturnDate, damageDescription, damageCost, paymentMethod }) => {
  const { booking, finalAmount, lateFee, damageFee } = await processReturnLogic({
    bookingId,
    actualReturnDate,
    damageDescription,
    damageCost,
  });

  const payment = await createPayment({
    bookingId: booking._id,
    amount: finalAmount,
    method: paymentMethod || 'cash',
  });

  return { booking, payment, lateFee, damageFee, finalAmount };
};

const getReturns = async () => {
  return Booking.find({ status: BOOKING_STATUS.COMPLETED })
    .populate('vehicle')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

const getReturnStats = async () => {
  const [totalReturns, totalRevenue] = await Promise.all([
    Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED }),
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.COMPLETED } },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalAmount' },
        },
      },
    ]),
  ]);

  const revenue = totalRevenue[0]?.total || 0;

  return {
    totalReturns,
    totalRevenue: revenue,
  };
};

module.exports = { processReturn, getReturns, getReturnStats };

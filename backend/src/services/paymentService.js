const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { PAYMENT_STATUS } = require('../config/constants');

const createPayment = async ({ bookingId, amount, method }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  const payment = await Payment.create({
    booking: bookingId,
    amount,
    method,
    status: PAYMENT_STATUS.COMPLETED,
  });

  return payment;
};

module.exports = { createPayment };

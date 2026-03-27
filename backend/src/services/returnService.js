const { processReturnLogic } = require('./bookingService');
const { createPayment } = require('./paymentService');

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

module.exports = { processReturn };

const { LATE_FEE_RATE_PER_DAY } = require('../config/constants');
const { diffInDays } = require('./dateUtils');

const calculateBaseRentalCost = (pricePerDay, startDate, endDate) => {
  const days = diffInDays(startDate, endDate);
  return Math.max(days, 1) * pricePerDay;
};

const calculateLateFee = (pricePerDay, plannedEndDate, actualReturnDate) => {
  const lateDays = diffInDays(plannedEndDate, actualReturnDate);
  if (lateDays <= 0) return 0;
  return lateDays * pricePerDay * LATE_FEE_RATE_PER_DAY;
};

module.exports = { calculateBaseRentalCost, calculateLateFee };

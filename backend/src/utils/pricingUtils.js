const { LATE_FEE_RATE_PER_DAY, LATE_FEE_RATE_PER_HOUR } = require('../config/constants');
const { diffInDays, diffInHours } = require('./dateUtils');

const calculateBaseRentalCost = (pricePerDay, startDate, endDate) => {
  const days = diffInDays(startDate, endDate);
  return Math.max(days, 1) * pricePerDay;
};

const calculateBaseRentalCostByHours = (pricePerHour, startDate, endDate) => {
  const hours = diffInHours(startDate, endDate);
  return Math.max(hours, 1) * pricePerHour;
};

const calculateLateFee = (pricePerDay, plannedEndDate, actualReturnDate) => {
  const lateDays = diffInDays(plannedEndDate, actualReturnDate);
  if (lateDays <= 0) return 0;
  return lateDays * pricePerDay * LATE_FEE_RATE_PER_DAY;
};

const calculateLateFeeBydHours = (pricePerHour, plannedEndDate, actualReturnDate) => {
  const lateHours = diffInHours(plannedEndDate, actualReturnDate);
  if (lateHours <= 0) return 0;
  return lateHours * pricePerHour * LATE_FEE_RATE_PER_HOUR;
};

module.exports = {
  calculateBaseRentalCost,
  calculateBaseRentalCostByHours,
  calculateLateFee,
  calculateLateFeeBydHours,
};

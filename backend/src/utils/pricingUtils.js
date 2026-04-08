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

/**
 * ✨ ENHANCED: Calculate rental price for both hourly and daily rentals
 * Auto-converts 24+ hours to days for better pricing
 * 
 * @param {number} pricePerDay - Daily rental price
 * @param {string} durationType - 'hours' or 'days'
 * @param {number} durationValue - Number of hours or days
 * @returns {number} Calculated total price
 */
const calculateRentalPrice = (pricePerDay, durationType, durationValue) => {
  if (durationValue <= 0) return 0;
  
  const pricePerHour = pricePerDay / 24;

  if (durationType === 'hours') {
    // Check if 24+ hours should be converted to days
    if (durationValue >= 24) {
      const wholeDays = Math.floor(durationValue / 24);
      const remainingHours = durationValue % 24;
      return (wholeDays * pricePerDay) + (remainingHours * pricePerHour);
    } else {
      // Less than 24 hours - charge hourly
      return durationValue * pricePerHour;
    }
  } else if (durationType === 'days') {
    // Daily rental
    return durationValue * pricePerDay;
  }

  return 0;
};

/**
 * ✨ NEW: Format duration for display (e.g., "5 hours", "2 days")
 */
const formatDuration = (durationType, durationValue) => {
  if (!durationType || !durationValue) return '';
  
  const type = durationType === 'hours' ? 'hour' : 'day';
  const suffix = durationValue === 1 ? '' : 's';
  return `${durationValue} ${type}${suffix}`;
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
  calculateRentalPrice,
  formatDuration,
  calculateLateFee,
  calculateLateFeeBydHours,
};

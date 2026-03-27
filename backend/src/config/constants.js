module.exports = {
  USER_ROLES: {
    CUSTOMER: 'customer',
    STAFF: 'staff',
    ADMIN: 'admin',
  },
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    ONGOING: 'ongoing',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  LATE_FEE_RATE_PER_DAY: 0.5, // 50% of daily price per late day
};

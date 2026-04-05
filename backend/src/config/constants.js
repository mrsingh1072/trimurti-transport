module.exports = {
  USER_ROLES: {
    CUSTOMER: 'customer',
    STAFF: 'staff',
    ADMIN: 'admin',
  },
  USER_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    REJECTED: 'rejected',
  },
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    ONGOING: 'ongoing',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },
  RETURN_STATUS: {
    NONE: 'none',
    REQUESTED: 'requested',
    PROCESSED: 'processed',
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  DURATION_TYPE: {
    HOURS: 'hours',
    DAYS: 'days',
  },
  PENALTY_MODIFIER_TYPE: {
    STAFF: 'staff',
    ADMIN: 'admin',
  },
  LATE_FEE_RATE_PER_DAY: 0.5, // 50% of daily price per late day
  LATE_FEE_RATE_PER_HOUR: 0.05, // 5% of hourly price per late hour
};

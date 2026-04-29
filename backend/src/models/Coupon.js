const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // No cap if null
      min: 0,
    },
    minBookingAmount: {
      type: Number,
      default: 500, // Minimum ₹500
      min: 0,
    },
    maxUsageLimit: {
      type: Number,
      default: null, // Unlimited if null
      min: 1,
    },
    usagePerUserLimit: {
      type: Number,
      default: 1, // Default 1 use per user (for new user coupon = 1, loyalty = limited)
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    couponType: {
      type: String,
      enum: ['new_user', 'loyalty', 'festival', 'referral', 'premium', 'seasonal'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    // City-specific targeting
    applicableCities: {
      type: [String], // ['Mumbai', 'Bangalore'] or empty for all cities
      default: [],
    },
    // Vehicle-specific targeting
    applicableVehicles: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Vehicle',
      default: [],
    },
    // Book only for specific duration types
    applicableDurationTypes: {
      type: [String], // ['hours', 'days'] or empty for all
      default: [],
    },
    // Exclude certain customers
    excludedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    // Staff can enable/disable coupon for manual application
    staffManualApplyAllowed: {
      type: Boolean,
      default: false,
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
couponSchema.index({ couponCode: 1, isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ couponType: 1, isActive: 1 });
couponSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Coupon', couponSchema);

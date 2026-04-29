const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    couponCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountApplied: {
      type: Number,
      required: true,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['applied', 'reversed', 'expired'],
      default: 'applied',
      index: true,
    },
    reversalReason: {
      type: String,
      default: null,
    },
    appliedBy: {
      type: String,
      enum: ['customer', 'staff', 'system'],
      default: 'customer',
    },
    appliedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Track suspicious usage pattern
    ipAddress: {
      type: String,
      default: null,
    },
    deviceFingerprint: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for analytics and abuse detection
couponUsageSchema.index({ user: 1, createdAt: -1 });
couponUsageSchema.index({ coupon: 1, createdAt: -1 });
couponUsageSchema.index({ status: 1 });
couponUsageSchema.index({ appliedBy: 1 });
couponUsageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CouponUsage', couponUsageSchema);

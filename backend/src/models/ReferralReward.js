const mongoose = require('mongoose');

const referralRewardSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    referrerRewardAmount: {
      type: Number,
      default: 200, // ₹200 wallet credit
      min: 0,
    },
    refereeDiscountAmount: {
      type: Number,
      default: 150, // ₹150 OFF on first booking
      min: 0,
    },
    referrerRewardClaimed: {
      type: Boolean,
      default: false,
    },
    refereeDiscountUsed: {
      type: Boolean,
      default: false,
    },
    // First booking reference
    firstBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

referralRewardSchema.index({ referrer: 1, createdAt: -1 });
referralRewardSchema.index({ referredUser: 1 });
referralRewardSchema.index({ status: 1 });
referralRewardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReferralReward', referralRewardSchema);

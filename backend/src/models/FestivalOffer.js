const mongoose = require('mongoose');

const festivalOfferSchema = new mongoose.Schema(
  {
    festivalName: {
      type: String,
      required: true,
      enum: [
        'Sankranti',
        'Ugadi',
        'Dasara',
        'Diwali',
        'Christmas',
        'NewYear',
        'SummerSale',
        'Other',
      ],
      index: true,
    },
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
      required: true,
      min: 0,
    },
    minBookingAmount: {
      type: Number,
      required: true,
      default: 500,
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
      default: false, // Must be manually activated by admin
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Campaign configuration
    maxUsageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usagePerUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Targeting
    applicableCities: {
      type: [String],
      default: [],
    },
    applicableVehicleTypes: {
      type: [String],
      default: [],
    },
    // Campaign performance
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    totalDiscountGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Admin tracking
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
festivalOfferSchema.index({ festivalName: 1, isActive: 1 });
festivalOfferSchema.index({ startDate: 1, endDate: 1 });
festivalOfferSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FestivalOffer', festivalOfferSchema);

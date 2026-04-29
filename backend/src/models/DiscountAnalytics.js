const mongoose = require('mongoose');

const discountAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    // Daily metrics
    totalBookingsWithDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDiscountGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOriginalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalNetRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageDiscountPerBooking: {
      type: Number,
      default: 0,
      min: 0,
    },
    // New customer acquisition
    newCustomersWithDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Repeat bookings
    repeatCustomersWithDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Coupon-wise breakdown
    couponBreakdown: [
      {
        coupon: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Coupon',
        },
        couponCode: String,
        usageCount: {
          type: Number,
          default: 0,
        },
        discountGiven: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Festival campaign performance
    festivalCampaigns: [
      {
        festivalOffer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'FestivalOffer',
        },
        festivalName: String,
        impressions: Number,
        clicks: Number,
        conversions: Number,
        roi: Number, // (conversions * avgOrderValue) / cost
      },
    ],
    // Referral metrics
    referralRewards: {
      totalReferred: {
        type: Number,
        default: 0,
      },
      creditsGiven: {
        type: Number,
        default: 0,
      },
    },
    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

discountAnalyticsSchema.index({ date: -1 });

module.exports = mongoose.model('DiscountAnalytics', discountAnalyticsSchema);

const DiscountAnalytics = require('../models/DiscountAnalytics');
const CouponUsage = require('../models/CouponUsage');
const Coupon = require('../models/Coupon');
const FestivalOffer = require('../models/FestivalOffer');
const ReferralReward = require('../models/ReferralReward');
const WalletCredit = require('../models/WalletCredit');
const Booking = require('../models/Booking');

/**
 * Analytics Service
 * Tracks discount metrics and calculates ROI for campaigns
 */

class AnalyticsService {
  /**
   * Record daily discount analytics
   */
  static async recordDailyAnalytics(date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all discounted bookings for the day
      const discountedUsages = await CouponUsage.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'applied',
      })
        .populate('coupon')
        .populate('booking', 'user totalPrice finalAmount');

      const totalBookingsWithDiscount = discountedUsages.length;
      const totalDiscountGiven = discountedUsages.reduce(
        (sum, usage) => sum + usage.discountApplied,
        0
      );
      const totalOriginalRevenue = discountedUsages.reduce(
        (sum, usage) => sum + usage.originalAmount,
        0
      );
      const totalNetRevenue = totalOriginalRevenue - totalDiscountGiven;

      // Get unique new customers using discounts
      const newCustomerUsages = await CouponUsage.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'applied',
          },
        },
        {
          $group: {
            _id: '$user',
          },
        },
      ]);

      let newCustomersWithDiscount = 0;
      for (const usage of newCustomerUsages) {
        const firstBookingWithDiscount = await Booking.findOne({
          user: usage._id,
        }).sort({ createdAt: 1 });

        if (firstBookingWithDiscount) {
          const discountRecord = await CouponUsage.findOne({
            booking: firstBookingWithDiscount._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          });

          if (discountRecord) {
            newCustomersWithDiscount++;
          }
        }
      }

      // Coupon breakdown
      const couponBreakdown = await CouponUsage.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'applied',
          },
        },
        {
          $group: {
            _id: '$coupon',
            couponCode: { $first: '$couponCode' },
            usageCount: { $sum: 1 },
            discountGiven: { $sum: '$discountApplied' },
          },
        },
        {
          $sort: { discountGiven: -1 },
        },
      ]);

      // Create or update daily analytics record
      await DiscountAnalytics.updateOne(
        { date: startOfDay },
        {
          $set: {
            totalBookingsWithDiscount,
            totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100,
            totalOriginalRevenue: Math.round(totalOriginalRevenue * 100) / 100,
            totalNetRevenue: Math.round(totalNetRevenue * 100) / 100,
            averageDiscountPerBooking:
              totalBookingsWithDiscount > 0
                ? Math.round(
                    (totalDiscountGiven / totalBookingsWithDiscount) * 100
                  ) / 100
                : 0,
            newCustomersWithDiscount,
            couponBreakdown,
          },
        },
        { upsert: true }
      );

      return {
        success: true,
        message: 'Daily analytics recorded',
        data: {
          totalBookingsWithDiscount,
          totalDiscountGiven,
          totalNetRevenue,
        },
      };
    } catch (error) {
      console.error('❌ Error recording daily analytics:', error);
      return {
        success: false,
        message: 'Error recording analytics',
      };
    }
  }

  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics(startDate, endDate) {
    try {
      const analytics = await DiscountAnalytics.find({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }).sort({ date: -1 });

      if (analytics.length === 0) {
        return {
          totalBookingsWithDiscount: 0,
          totalDiscountGiven: 0,
          totalNetRevenue: 0,
          averageDiscountPerBooking: 0,
          newCustomersWithDiscount: 0,
          repeatCustomersWithDiscount: 0,
          topCoupons: [],
          charts: {
            usageTrend: [],
            revenueTrend: [],
          },
        };
      }

      const totalBookingsWithDiscount = analytics.reduce(
        (sum, a) => sum + (a.totalBookingsWithDiscount || 0),
        0
      );
      const totalDiscountGiven = analytics.reduce(
        (sum, a) => sum + (a.totalDiscountGiven || 0),
        0
      );
      const totalNetRevenue = analytics.reduce(
        (sum, a) => sum + (a.totalNetRevenue || 0),
        0
      );
      const newCustomersWithDiscount = analytics.reduce(
        (sum, a) => sum + (a.newCustomersWithDiscount || 0),
        0
      );

      // Collect all coupons from all analytics records
      const allCoupons = {};
      analytics.forEach((record) => {
        if (record.couponBreakdown) {
          record.couponBreakdown.forEach((coupon) => {
            if (!allCoupons[coupon.couponCode]) {
              allCoupons[coupon.couponCode] = {
                coupon: coupon._id,
                couponCode: coupon.couponCode,
                usageCount: 0,
                discountGiven: 0,
              };
            }
            allCoupons[coupon.couponCode].usageCount +=
              coupon.usageCount;
            allCoupons[coupon.couponCode].discountGiven +=
              coupon.discountGiven;
          });
        }
      });

      const topCoupons = Object.values(allCoupons)
        .sort((a, b) => b.discountGiven - a.discountGiven)
        .slice(0, 5);

      return {
        totalBookingsWithDiscount,
        totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100,
        totalNetRevenue: Math.round(totalNetRevenue * 100) / 100,
        newCustomersWithDiscount,
        topCoupons,
        dailyTrend: analytics.map((a) => ({
          date: a.date,
          bookings: a.totalBookingsWithDiscount,
          discount: a.totalDiscountGiven,
          revenue: a.totalNetRevenue,
        })),
      };
    } catch (error) {
      console.error('❌ Error getting dashboard metrics:', error);
      return {
        totalBookingsWithDiscount: 0,
        totalDiscountGiven: 0,
        topCoupons: [],
      };
    }
  }

  /**
   * Get coupon performance stats
   */
  static async getCouponStats(couponId) {
    try {
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        return { success: false, message: 'Coupon not found' };
      }

      const usages = await CouponUsage.find({
        coupon: couponId,
        status: 'applied',
      });

      const stats = {
        couponCode: coupon.couponCode,
        totalUsage: coupon.usedCount,
        totalDiscountGiven: usages.reduce(
          (sum, u) => sum + u.discountApplied,
          0
        ),
        totalRevenue: usages.reduce((sum, u) => sum + u.originalAmount, 0),
        averageDiscountPerUse:
          usages.length > 0
            ? usages.reduce((sum, u) => sum + u.discountApplied, 0) /
              usages.length
            : 0,
        usagePercentage: coupon.maxUsageLimit
          ? (coupon.usedCount / coupon.maxUsageLimit) * 100
          : null,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Error getting coupon stats:', error);
      return {
        success: false,
        message: 'Error retrieving stats',
      };
    }
  }

  /**
   * Get staff analytics
   */
  static async getStaffAnalytics(startDate, endDate, type = 'daily') {
    try {
      const couponsUsed = await CouponUsage.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: 'applied',
      });

      const discountedBookings = await CouponUsage.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: 'applied',
      }).populate('coupon', 'couponCode');

      const totalDiscountGiven = discountedBookings.reduce(
        (sum, u) => sum + u.discountApplied,
        0
      );
      const totalRevenue = discountedBookings.reduce(
        (sum, u) => sum + u.originalAmount,
        0
      );

      // Top used offers
      const topOffers = discountedBookings.reduce((acc, usage) => {
        const code = usage.couponCode;
        if (!acc[code]) {
          acc[code] = { code, count: 0, discount: 0 };
        }
        acc[code].count++;
        acc[code].discount += usage.discountApplied;
        return acc;
      }, {});

      return {
        couponsUsed,
        discountedBookings: discountedBookings.length,
        totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100,
        revenueAfterDiscount: Math.round((totalRevenue - totalDiscountGiven) * 100) / 100,
        topOffers: Object.values(topOffers)
          .sort((a, b) => b.discount - a.discount)
          .slice(0, 5),
      };
    } catch (error) {
      console.error('❌ Error getting staff analytics:', error);
      return {
        couponsUsed: 0,
        discountedBookings: 0,
        totalDiscountGiven: 0,
      };
    }
  }

  /**
   * Check suspicious usage patterns
   */
  static async checkSuspiciousPatterns(userId, timeWindowMinutes = 60) {
    try {
      const timeThreshold = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

      const suspiciousUsages = await CouponUsage.find({
        user: userId,
        createdAt: { $gte: timeThreshold },
      }).populate('coupon', 'couponCode');

      const patterns = {
        frequentAttempts: suspiciousUsages.length > 5,
        multipleFailures: await CouponUsage.countDocuments({
          user: userId,
          createdAt: { $gte: timeThreshold },
          status: 'reversed',
        }),
        differentCoupons: new Set(suspiciousUsages.map((u) => u.couponCode))
          .size,
      };

      const suspicious =
        patterns.frequentAttempts ||
        patterns.multipleFailures > 3 ||
        patterns.differentCoupons > 3;

      return {
        suspicious,
        patterns,
      };
    } catch (error) {
      console.error('❌ Error checking suspicious patterns:', error);
      return { suspicious: false };
    }
  }

  /**
   * Get referral analytics
   */
  static async getReferralAnalytics(startDate, endDate) {
    try {
      const referrals = await ReferralReward.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });

      const approved = referrals.filter((r) => r.status === 'approved');
      const pending = referrals.filter((r) => r.status === 'pending');

      // Calculate credits given
      const totalCreditsGiven = approved.reduce(
        (sum, r) => sum + r.referrerRewardAmount,
        0
      );

      return {
        totalReferrals: referrals.length,
        approvedReferrals: approved.length,
        pendingReferrals: pending.length,
        totalCreditsGiven,
        averageRewardPerReferral:
          approved.length > 0 ? totalCreditsGiven / approved.length : 0,
      };
    } catch (error) {
      console.error('❌ Error getting referral analytics:', error);
      return {
        totalReferrals: 0,
        approvedReferrals: 0,
        totalCreditsGiven: 0,
      };
    }
  }
}

module.exports = AnalyticsService;

const AnalyticsService = require('../services/analyticsService');
const CouponUsage = require('../models/CouponUsage');
const Coupon = require('../models/Coupon');

/**
 * Staff Coupon Controller
 * Staff can view discount analytics and usage patterns
 */

exports.getDiscountAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const type = req.query.type || 'daily'; // daily, weekly, monthly

    if (!startDate || !endDate) {
      const error = new Error('Start date and end date required');
      error.statusCode = 400;
      return next(error);
    }

    const analytics = await AnalyticsService.getStaffAnalytics(
      startDate,
      endDate,
      type
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDiscountedBookings = async (req, res, next) => {
  try {
    const { startDate, endDate, sortBy } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let query = { status: 'applied' };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default: last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: sevenDaysAgo };
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'discount') {
      sortOptions = { discountApplied: -1 };
    } else if (sortBy === 'amount') {
      sortOptions = { originalAmount: -1 };
    }

    const bookings = await CouponUsage.find(query)
      .populate('user', 'name email phone')
      .populate('coupon', 'couponCode discountType discountValue')
      .populate('booking', 'totalPrice finalAmount status')
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await CouponUsage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select(
        'couponCode discountType discountValue maxDiscount minBookingAmount usedCount maxUsageLimit description'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCouponStats = async (req, res, next) => {
  try {
    const { couponId } = req.params;

    if (!couponId) {
      const error = new Error('Coupon ID required');
      error.statusCode = 400;
      return next(error);
    }

    const stats = await AnalyticsService.getCouponStats(couponId);

    if (!stats.success) {
      const error = new Error(stats.message);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: stats.data,
    });
  } catch (error) {
    next(error);
  }
};

exports.checkSuspiciousActivity = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const timeWindow = parseInt(req.query.timeWindow) || 60; // minutes

    const patterns = await AnalyticsService.checkSuspiciousPatterns(
      userId,
      timeWindow
    );

    res.status(200).json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopOffers = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const limit = parseInt(req.query.limit) || 5;

    let query = { status: 'applied' };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const topOffers = await CouponUsage.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$couponCode',
          count: { $sum: 1 },
          totalDiscount: { $sum: '$discountApplied' },
          totalRevenue: { $sum: '$originalAmount' },
        },
      },
      { $sort: { totalDiscount: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json({
      success: true,
      data: topOffers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const { userId, bookingAmount } = req.query;

    if (!userId || !bookingAmount) {
      const error = new Error('User ID and booking amount required');
      error.statusCode = 400;
      return next(error);
    }

    // Get active coupons suitable for the amount
    const now = new Date();
    const recommendations = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      minBookingAmount: { $lte: parseFloat(bookingAmount) },
      excludedUsers: { $ne: userId },
    })
      .select(
        'couponCode discountType discountValue maxDiscount description couponType'
      )
      .limit(3)
      .sort({ discountValue: -1 });

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDailyMetrics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const metrics = await AnalyticsService.getStaffAnalytics(
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

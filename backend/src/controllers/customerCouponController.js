const DiscountService = require('../services/discountService');
const AnalyticsService = require('../services/analyticsService');
const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const WalletCredit = require('../models/WalletCredit');
const ReferralReward = require('../models/ReferralReward');

/**
 * Customer Coupon Controller
 */

exports.applyCoupon = async (req, res, next) => {
  try {
    const { couponCode, bookingId, bookingAmount } = req.body;
    const userId = req.user._id;

    if (!couponCode || !bookingId || !bookingAmount) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      return next(error);
    }

    const result = await DiscountService.applyCoupon(
      couponCode,
      userId,
      bookingId,
      bookingAmount,
      'customer',
      null,
      req.ip
    );

    if (!result.success) {
      const error = new Error(result.message);
      error.statusCode = 400;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: {
        discount: result.discount,
        finalAmount: result.finalAmount,
        couponUsageId: result.couponUsageId,
        message: result.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveCoupons = async (req, res, next) => {
  try {
    const { bookingAmount } = req.query;
    const userId = req.user._id;

    if (!bookingAmount) {
      const error = new Error('Booking amount required');
      error.statusCode = 400;
      return next(error);
    }

    const coupons = await DiscountService.getActiveCoupons(
      userId,
      parseFloat(bookingAmount)
    );

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { couponCode, bookingAmount } = req.body;
    const userId = req.user._id;

    if (!couponCode || !bookingAmount) {
      const error = new Error('Coupon code and booking amount required');
      error.statusCode = 400;
      return next(error);
    }

    const validation = await DiscountService.validateCoupon(
      couponCode,
      userId,
      bookingAmount
    );

    res.status(200).json({
      success: validation.valid,
      data: validation,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBestCoupon = async (req, res, next) => {
  try {
    const { bookingAmount } = req.query;
    const userId = req.user._id;

    if (!bookingAmount) {
      const error = new Error('Booking amount required');
      error.statusCode = 400;
      return next(error);
    }

    const bestCoupon = await DiscountService.getBestCoupon(
      userId,
      parseFloat(bookingAmount)
    );

    res.status(200).json({
      success: true,
      data: bestCoupon,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingOffers = async (req, res, next) => {
  try {
    const upcomingCoupons = await DiscountService.getUpcomingCoupons();

    res.status(200).json({
      success: true,
      data: upcomingCoupons,
    });
  } catch (error) {
    next(error);
  }
};

exports.getWalletBalance = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const wallet = await WalletCredit.findOne({ user: userId });

    if (!wallet) {
      return res.status(200).json({
        success: true,
        data: {
          balance: 0,
          transactions: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        transactions: wallet.transactions.slice(-10), // Last 10 transactions
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getReferralCode = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let referralReward = await ReferralReward.findOne({
      referrer: userId,
    });

    if (!referralReward) {
      // Generate referral code
      const code = `REF${userId.toString().slice(-6)}${Date.now()}`
        .toUpperCase()
        .slice(0, 10);

      referralReward = new ReferralReward({
        referrer: userId,
        referralCode: code,
        status: 'pending',
      });

      await referralReward.save();
    }

    res.status(200).json({
      success: true,
      data: {
        referralCode: referralReward.referralCode,
        reward: referralReward.referrerRewardAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCouponUsageHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const usages = await CouponUsage.find({ user: userId, status: 'applied' })
      .populate('coupon', 'couponCode discountValue couponType')
      .populate('booking', 'totalPrice finalAmount status')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await CouponUsage.countDocuments({
      user: userId,
      status: 'applied',
    });

    res.status(200).json({
      success: true,
      data: usages,
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

exports.checkLoyaltyStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const loyaltyStatus =
      await DiscountService.getLoyaltyStatus(userId);

    res.status(200).json({
      success: true,
      data: loyaltyStatus,
    });
  } catch (error) {
    next(error);
  }
};

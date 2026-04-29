const Coupon = require('../models/Coupon');
const FestivalOffer = require('../models/FestivalOffer');
const CouponUsage = require('../models/CouponUsage');
const ReferralReward = require('../models/ReferralReward');
const AnalyticsService = require('../services/analyticsService');
const DiscountService = require('../services/discountService');

/**
 * Admin Coupon Controller
 * Admin can create, edit, delete coupons and manage campaigns
 */

exports.createCoupon = async (req, res, next) => {
  try {
    const {
      couponCode,
      discountType,
      discountValue,
      maxDiscount,
      minBookingAmount,
      maxUsageLimit,
      usagePerUserLimit,
      startDate,
      endDate,
      couponType,
      description,
      applicableCities,
      applicableVehicles,
      applicableDurationTypes,
      staffManualApplyAllowed,
    } = req.body;

    // Validation
    if (!couponCode || !discountType || !discountValue || !startDate || !endDate) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      return next(error);
    }

    // Check if coupon already exists
    const existing = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
    if (existing) {
      const error = new Error('Coupon code already exists');
      error.statusCode = 409;
      return next(error);
    }

    // Create coupon
    const coupon = new Coupon({
      couponCode: couponCode.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minBookingAmount: minBookingAmount || 500,
      maxUsageLimit: maxUsageLimit || null,
      usagePerUserLimit: usagePerUserLimit || 1,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      couponType,
      description,
      applicableCities: applicableCities || [],
      applicableVehicles: applicableVehicles || [],
      applicableDurationTypes: applicableDurationTypes || [],
      staffManualApplyAllowed: staffManualApplyAllowed || false,
      createdBy: req.user._id,
      isActive: false, // Admin must explicitly activate
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow changing coupon code
    if (updateData.couponCode) {
      delete updateData.couponCode;
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    // Record last modified
    await Coupon.updateOne(
      { _id: id },
      { lastModifiedBy: req.user._id }
    );

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    // Delete all related coupon usages
    await CouponUsage.deleteMany({ coupon: id });

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive, lastModifiedBy: req.user._id },
      { new: true }
    );

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: `Coupon ${isActive ? 'activated' : 'deactivated'}`,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCoupons = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let query = {};

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (type) {
      query.couponType = type;
    }

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      data: coupons,
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

exports.getCouponStats = async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getCouponStats(req.params.id);

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

// Festival Offer Management

exports.createFestivalOffer = async (req, res, next) => {
  try {
    const {
      festivalName,
      couponCode,
      discountType,
      discountValue,
      maxDiscount,
      minBookingAmount,
      startDate,
      endDate,
      description,
      maxUsageLimit,
      usagePerUserLimit,
      applicableCities,
      applicableVehicleTypes,
    } = req.body;

    if (!festivalName || !couponCode || !discountType || !discountValue || !startDate || !endDate) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      return next(error);
    }

    // Check if festival offer already exists
    const existing = await FestivalOffer.findOne({ couponCode: couponCode.toUpperCase() });
    if (existing) {
      const error = new Error('Festival coupon code already exists');
      error.statusCode = 409;
      return next(error);
    }

    const festivalOffer = new FestivalOffer({
      festivalName,
      couponCode: couponCode.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount,
      minBookingAmount: minBookingAmount || 500,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      maxUsageLimit: maxUsageLimit || null,
      usagePerUserLimit: usagePerUserLimit || 1,
      applicableCities: applicableCities || [],
      applicableVehicleTypes: applicableVehicleTypes || [],
      createdBy: req.user._id,
      isActive: false,
    });

    await festivalOffer.save();

    res.status(201).json({
      success: true,
      message: 'Festival offer created successfully',
      data: festivalOffer,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFestivalOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.couponCode) {
      delete updateData.couponCode;
    }

    const festivalOffer = await FestivalOffer.findByIdAndUpdate(
      id,
      { ...updateData, lastModifiedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!festivalOffer) {
      const error = new Error('Festival offer not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Festival offer updated successfully',
      data: festivalOffer,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleFestivalOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const offer = await FestivalOffer.findByIdAndUpdate(
      id,
      { isActive, lastModifiedBy: req.user._id },
      { new: true }
    );

    if (!offer) {
      const error = new Error('Festival offer not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: `Festival offer ${isActive ? 'activated' : 'deactivated'}`,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllFestivalOffers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offers = await FestivalOffer.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await FestivalOffer.countDocuments();

    res.status(200).json({
      success: true,
      data: offers,
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

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const error = new Error('Start date and end date required');
      error.statusCode = 400;
      return next(error);
    }

    // Get metrics
    const metrics = await AnalyticsService.getDashboardMetrics(startDate, endDate);

    // Count active coupons
    const now = new Date();
    const activeCoupons = await Coupon.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Get referral metrics
    const referralMetrics = await AnalyticsService.getReferralAnalytics(
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: {
        ...metrics,
        activeCoupons,
        referralMetrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.approveCouponReferral = async (req, res, next) => {
  try {
    const { referralId } = req.params;

    const result = await DiscountService.approveReferral(
      referralId,
      req.user._id
    );

    if (!result.success) {
      const error = new Error(result.message);
      error.statusCode = 400;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

exports.exportDiscountReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format } = req.query;

    if (!startDate || !endDate) {
      const error = new Error('Start date and end date required');
      error.statusCode = 400;
      return next(error);
    }

    const usages = await CouponUsage.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: 'applied',
    })
      .populate('coupon', 'couponCode')
      .populate('user', 'name email')
      .populate('booking', 'totalPrice finalAmount')
      .select('couponCode originalAmount discountApplied finalAmount createdAt');

    const csvData = [
      ['Coupon Code', 'Customer Email', 'Original Amount', 'Discount Given', 'Final Amount', 'Date'],
      ...usages.map((usage) => [
        usage.coupon?.couponCode || 'N/A',
        usage.user?.email || 'N/A',
        usage.originalAmount,
        usage.discountApplied,
        usage.finalAmount,
        usage.createdAt.toISOString(),
      ]),
    ];

    // Generate CSV content
    const csvContent = csvData.map((row) => row.join(',')).join('\n');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="discount-report.csv"',
    });

    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

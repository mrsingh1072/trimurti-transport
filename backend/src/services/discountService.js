const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const ReferralReward = require('../models/ReferralReward');
const WalletCredit = require('../models/WalletCredit');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Core Discount Engine
 * Handles validation, application, and anti-abuse checks for coupons
 */

class DiscountService {
  /**
   * Validate if a coupon can be applied
   * Returns: { valid: boolean, discount: number, reason?: string }
   */
  static async validateCoupon(couponCode, userId, bookingAmount) {
    try {
      const validationResult = {
        valid: false,
        discount: 0,
        originalAmount: bookingAmount,
        finalAmount: bookingAmount,
        reason: null,
      };

      // Step 1: Check if coupon exists and is active
      const coupon = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
      });

      if (!coupon) {
        validationResult.reason = 'Coupon not found';
        return validationResult;
      }

      if (!coupon.isActive) {
        validationResult.reason = 'Coupon is inactive';
        return validationResult;
      }

      // Step 2: Check expiry
      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        validationResult.reason = 'Coupon has expired or not started';
        return validationResult;
      }

      // Step 3: Check minimum booking amount
      if (bookingAmount < coupon.minBookingAmount) {
        const needed = coupon.minBookingAmount - bookingAmount;
        validationResult.reason = `Minimum booking amount ₹${coupon.minBookingAmount} required. Add ₹${needed.toFixed(2)} more to unlock this offer`;
        return validationResult;
      }

      // Step 4: Check global usage limit
      if (coupon.maxUsageLimit && coupon.usedCount >= coupon.maxUsageLimit) {
        validationResult.reason = 'Coupon usage limit exceeded';
        return validationResult;
      }

      // Step 5: Check user-specific usage limit
      const userUsageCount = await CouponUsage.countDocuments({
        coupon: coupon._id,
        user: userId,
        status: 'applied',
      });

      if (userUsageCount >= coupon.usagePerUserLimit) {
        validationResult.reason = `You have already used this coupon ${coupon.usagePerUserLimit} time(s)`;
        return validationResult;
      }

      // Step 6: Check if user is excluded
      if (coupon.excludedUsers.includes(userId)) {
        validationResult.reason = 'This coupon is not applicable for your account';
        return validationResult;
      }

      // Step 7: Anti-abuse checks
      const abuseCheck = await this.checkAbusePatterns(userId, couponCode);
      if (!abuseCheck.allowed) {
        validationResult.reason = abuseCheck.reason;
        return validationResult;
      }

      // Step 8: Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (bookingAmount * coupon.discountValue) / 100;
        // Apply max discount cap if set
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        // Fixed discount
        discountAmount = coupon.discountValue;
        // Ensure discount doesn't exceed booking amount
        discountAmount = Math.min(discountAmount, bookingAmount);
      }

      // Step 9: Ensure minimum profit margin (safety check)
      const finalAmount = bookingAmount - discountAmount;
      if (finalAmount < 100) {
        // Safety minimum of ₹100 per booking
        validationResult.reason = 'Discount would make booking unprofitable';
        return validationResult;
      }

      // All validations passed
      validationResult.valid = true;
      validationResult.discount = Math.round(discountAmount * 100) / 100; // Round to 2 decimals
      validationResult.finalAmount =
        bookingAmount - validationResult.discount;
      return validationResult;
    } catch (error) {
      console.error('❌ Coupon validation error:', error);
      return {
        valid: false,
        discount: 0,
        reason: 'Error validating coupon',
      };
    }
  }

  /**
   * Check for abuse patterns
   * Rules:
   * - Same user applying multiple coupons in short time
   * - Same device applying different coupons
   * - Multiple users from same IP
   */
  static async checkAbusePatterns(userId, couponCode) {
    try {
      // Rule 1: Check if user tried >3 coupons in last 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentUsage = await CouponUsage.countDocuments({
        user: userId,
        createdAt: { $gte: oneHourAgo },
        status: 'applied',
      });

      if (recentUsage > 3) {
        return {
          allowed: false,
          reason:
            'Too many coupon attempts. Please try again later.',
        };
      }

      // Rule 2: Check for repeated failed attempts
      const failedAttempts = await CouponUsage.countDocuments({
        user: userId,
        createdAt: { $gte: oneHourAgo },
        status: 'reversed',
      });

      if (failedAttempts > 5) {
        return {
          allowed: false,
          reason:
            'Suspicious activity detected. Please contact support.',
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Abuse check error:', error);
      return { allowed: true }; // Allow on error (fail-open)
    }
  }

  /**
   * Apply coupon to booking
   */
  static async applyCoupon(
    couponCode,
    userId,
    bookingId,
    bookingAmount,
    appliedBy = 'customer',
    staffUserId = null,
    ipAddress = null
  ) {
    try {
      // Validate coupon first
      const validation = await this.validateCoupon(
        couponCode,
        userId,
        bookingAmount
      );

      if (!validation.valid) {
        return {
          success: false,
          message: validation.reason,
        };
      }

      // Get coupon details
      const coupon = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
      });

      // Create usage record
      const couponUsage = new CouponUsage({
        coupon: coupon._id,
        user: userId,
        booking: bookingId,
        couponCode: couponCode.toUpperCase(),
        originalAmount: bookingAmount,
        discountApplied: validation.discount,
        finalAmount: validation.finalAmount,
        status: 'applied',
        appliedBy: appliedBy,
        appliedByUser: staffUserId || null,
        ipAddress: ipAddress || null,
      });

      await couponUsage.save();

      // Increment coupon usage count
      await Coupon.updateOne(
        { _id: coupon._id },
        { $inc: { usedCount: 1 } }
      );

      return {
        success: true,
        message: 'Coupon applied successfully',
        discount: validation.discount,
        finalAmount: validation.finalAmount,
        couponUsageId: couponUsage._id,
      };
    } catch (error) {
      console.error('❌ Apply coupon error:', error);
      return {
        success: false,
        message: 'Error applying coupon',
      };
    }
  }

  /**
   * Get best applicable coupon for user
   */
  static async getBestCoupon(userId, bookingAmount) {
    try {
      const now = new Date();

      // Get all active coupons applicable to user
      const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        minBookingAmount: { $lte: bookingAmount },
        excludedUsers: { $ne: userId },
      })
        .sort({ discountValue: -1 })
        .limit(5);

      if (coupons.length === 0) {
        return null;
      }

      // Check each coupon's validity
      for (const coupon of coupons) {
        const validation = await this.validateCoupon(
          coupon.couponCode,
          userId,
          bookingAmount
        );

        if (validation.valid) {
          return {
            couponCode: coupon.couponCode,
            discount: validation.discount,
            finalAmount: validation.finalAmount,
            reason: `Save ₹${validation.discount.toFixed(2)} with ${coupon.couponCode}`,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting best coupon:', error);
      return null;
    }
  }

  /**
   * Get all active coupons for user
   */
  static async getActiveCoupons(userId, bookingAmount) {
    try {
      const now = new Date();

      const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        excludedUsers: { $ne: userId },
      })
        .select('couponCode discountType discountValue maxDiscount minBookingAmount description couponType')
        .sort({ createdAt: -1 });

      // Filter by minimum amount and validate each
      const validCoupons = [];

      for (const coupon of coupons) {
        if (bookingAmount >= coupon.minBookingAmount) {
          const validation = await this.validateCoupon(
            coupon.couponCode,
            userId,
            bookingAmount
          );

          if (validation.valid) {
            validCoupons.push({
              couponCode: coupon.couponCode,
              type: coupon.couponType,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              maxDiscount: coupon.maxDiscount,
              description: coupon.description,
              minBookingAmount: coupon.minBookingAmount,
              estimatedDiscount: validation.discount,
            });
          }
        }
      }

      return validCoupons;
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      return [];
    }
  }

  /**
   * Get upcoming coupons/festivals
   */
  static async getUpcomingCoupons() {
    try {
      const now = new Date();
      const upcomingCoupons = await Coupon.find({
        startDate: { $gt: now },
        isActive: true,
      })
        .select(
          'couponCode description startDate endDate discountValue discountType couponType'
        )
        .sort({ startDate: 1 })
        .limit(5);

      return upcomingCoupons;
    } catch (error) {
      console.error('Error fetching upcoming coupons:', error);
      return [];
    }
  }

  /**
   * Reverse coupon usage (for cancellations, refunds)
   */
  static async reverseCoupon(couponUsageId, reason = 'Booking cancelled') {
    try {
      const couponUsage = await CouponUsage.findById(couponUsageId);

      if (!couponUsage) {
        return { success: false, message: 'Coupon usage not found' };
      }

      if (couponUsage.status === 'reversed') {
        return { success: false, message: 'Coupon already reversed' };
      }

      // Update usage status
      couponUsage.status = 'reversed';
      couponUsage.reversalReason = reason;
      await couponUsage.save();

      // Decrement coupon usage count
      await Coupon.updateOne(
        { _id: couponUsage.coupon },
        { $inc: { usedCount: -1 } }
      );

      return {
        success: true,
        message: 'Coupon reversed',
        refundAmount: couponUsage.discountApplied,
      };
    } catch (error) {
      console.error('Error reversing coupon:', error);
      return { success: false, message: 'Error reversing coupon' };
    }
  }

  /**
   * Check if user is new (eligible for new user coupon)
   */
  static async isNewUser(userId) {
    try {
      const completedBooking = await Booking.findOne({
        user: userId,
        status: 'completed',
      });

      return !completedBooking;
    } catch (error) {
      console.error('Error checking new user status:', error);
      return false;
    }
  }

  /**
   * Check if user qualifies for loyalty discount
   * (Loyalty coupon for 3rd booking)
   */
  static async getLoyaltyStatus(userId) {
    try {
      const completedBookings = await Booking.countDocuments({
        user: userId,
        status: 'completed',
      });

      return {
        completedBookings,
        eligibleForLoyalty: completedBookings >= 2,
        nextMilestone: completedBookings + 1,
      };
    } catch (error) {
      console.error('Error checking loyalty status:', error);
      return {
        completedBookings: 0,
        eligibleForLoyalty: false,
      };
    }
  }

  /**
   * Process referral rewards
   */
  static async processReferral(
    referrerEmail,
    referredEmail,
    referredBookingId = null
  ) {
    try {
      const referrer = await User.findOne({ email: referrerEmail });
      const referredUser = await User.findOne({ email: referredEmail });

      if (!referrer || !referredUser) {
        return {
          success: false,
          message: 'Invalid referrer or referred user',
        };
      }

      if (referrer._id.toString() === referredUser._id.toString()) {
        return {
          success: false,
          message: 'Cannot refer yourself',
        };
      }

      // Check if referral already exists
      const existingReferral = await ReferralReward.findOne({
        referrer: referrer._id,
        referredUser: referredUser._id,
      });

      if (existingReferral) {
        return {
          success: false,
          message: 'Referral already exists for these users',
        };
      }

      // Create referral reward
      const referralCode = `REF${referrer._id
        .toString()
        .slice(-6)}${Date.now()}`.toUpperCase();

      const referralReward = new ReferralReward({
        referrer: referrer._id,
        referredUser: referredUser._id,
        referralCode,
        status: 'pending',
        firstBooking: referredBookingId || null,
      });

      await referralReward.save();

      return {
        success: true,
        message: 'Referral created successfully',
        referralCode,
        referralId: referralReward._id,
      };
    } catch (error) {
      console.error('Error processing referral:', error);
      return {
        success: false,
        message: 'Error processing referral',
      };
    }
  }

  /**
   * Approve referral and credit wallet
   */
  static async approveReferral(referralId, approvedBy) {
    try {
      const referral = await ReferralReward.findById(referralId);

      if (!referral) {
        return { success: false, message: 'Referral not found' };
      }

      if (referral.status !== 'pending') {
        return {
          success: false,
          message: 'Referral already processed',
        };
      }

      // Update referral status
      referral.status = 'approved';
      referral.approvedBy = approvedBy;
      referral.approvedAt = new Date();
      await referral.save();

      // Credit referrer's wallet
      const walletCredit = new WalletCredit({
        user: referral.referrer,
        balance: referral.referrerRewardAmount,
      });

      await walletCredit.save();

      // Add transaction
      await WalletCredit.updateOne(
        { user: referral.referrer },
        {
          $push: {
            transactions: {
              transactionId: `TXN${Date.now()}`,
              type: 'credit',
              amount: referral.referrerRewardAmount,
              reason: 'referral_reward',
              relatedReferral: referral._id,
              description: `Referral reward for ${referral.referredUser}`,
            },
          },
          $inc: { balance: referral.referrerRewardAmount },
          lastTransactionAt: new Date(),
        }
      );

      return {
        success: true,
        message: 'Referral approved and wallet credited',
      };
    } catch (error) {
      console.error('Error approving referral:', error);
      return {
        success: false,
        message: 'Error approving referral',
      };
    }
  }
}

module.exports = DiscountService;

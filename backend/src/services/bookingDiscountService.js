const Booking = require('../models/Booking');
const DiscountService = require('./discountService');
const AnalyticsService = require('./analyticsService');
const CouponUsage = require('../models/CouponUsage');

/**
 * Booking Discount Integration Service
 * Handles discount application during booking checkout and completion
 */

class BookingDiscountService {
  /**
   * Apply discount to a booking before payment
   * Called during checkout
   */
  static async applyDiscountToBooking(
    bookingId,
    couponCode,
    userId,
    ipAddress = null
  ) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
        };
      }

      if (booking.couponCode) {
        return {
          success: false,
          message: 'Booking already has a discount applied',
        };
      }

      const basePrice = booking.totalPrice;

      // Validate and apply coupon
      const validation = await DiscountService.validateCoupon(
        couponCode,
        userId,
        basePrice
      );

      if (!validation.valid) {
        return {
          success: false,
          message: validation.reason,
        };
      }

      // Apply the coupon
      const applyResult = await DiscountService.applyCoupon(
        couponCode,
        userId,
        bookingId,
        basePrice,
        'customer',
        null,
        ipAddress
      );

      if (!applyResult.success) {
        return {
          success: false,
          message: applyResult.message,
        };
      }

      // Update booking with discount details
      const couponUsageId = applyResult.couponUsageId;

      await Booking.updateOne(
        { _id: bookingId },
        {
          discountApplied: applyResult.discount,
          amountAfterDiscount: applyResult.finalAmount,
          couponUsageId: couponUsageId,
          couponCode: couponCode.toUpperCase(),
        }
      );

      return {
        success: true,
        message: 'Discount applied successfully',
        discount: applyResult.discount,
        finalAmount: applyResult.finalAmount,
        savings: `Save ₹${applyResult.discount.toFixed(2)}`,
      };
    } catch (error) {
      console.error('❌ Error applying discount to booking:', error);
      return {
        success: false,
        message: 'Error applying discount',
      };
    }
  }

  /**
   * Remove discount from booking
   */
  static async removeDiscountFromBooking(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
        };
      }

      if (!booking.couponUsageId) {
        return {
          success: false,
          message: 'No discount applied to this booking',
        };
      }

      // Reverse the coupon usage
      const reverseResult = await DiscountService.reverseCoupon(
        booking.couponUsageId,
        'Discount removed by customer'
      );

      if (!reverseResult.success) {
        return reverseResult;
      }

      // Clear discount from booking
      await Booking.updateOne(
        { _id: bookingId },
        {
          discountApplied: 0,
          amountAfterDiscount: booking.totalPrice,
          couponUsageId: null,
          couponCode: null,
          discountReason: null,
        }
      );

      return {
        success: true,
        message: 'Discount removed',
        refundAmount: reverseResult.refundAmount,
      };
    } catch (error) {
      console.error('❌ Error removing discount:', error);
      return {
        success: false,
        message: 'Error removing discount',
      };
    }
  }

  /**
   * Auto-apply best coupon if available
   */
  static async autoApplyBestCoupon(bookingId, userId, ipAddress = null) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return {
          success: false,
          applied: false,
        };
      }

      if (booking.couponCode) {
        return {
          success: true,
          applied: false,
          message: 'Booking already has a coupon',
        };
      }

      // Get best coupon for user
      const bestCoupon = await DiscountService.getBestCoupon(
        userId,
        booking.totalPrice
      );

      if (!bestCoupon) {
        return {
          success: true,
          applied: false,
          message: 'No applicable coupon found',
        };
      }

      // Apply the best coupon
      const applyResult = await this.applyDiscountToBooking(
        bookingId,
        bestCoupon.couponCode,
        userId,
        ipAddress
      );

      return {
        success: applyResult.success,
        applied: applyResult.success,
        ...applyResult,
      };
    } catch (error) {
      console.error('❌ Error auto-applying coupon:', error);
      return {
        success: false,
        applied: false,
      };
    }
  }

  /**
   * Record discount analytics when booking is completed
   */
  static async recordBookingDiscountAnalytics(bookingId) {
    try {
      const booking = await Booking.findById(bookingId).populate('user');

      if (!booking || booking.status !== 'completed') {
        return;
      }

      // Record daily analytics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await AnalyticsService.recordDailyAnalytics(today);

      console.log(`📊 Analytics recorded for booking ${bookingId}`);
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  }

  /**
   * Handle booking cancellation with discount reversal
   */
  static async handleBookingCancellation(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
        };
      }

      // If booking has a discount, reverse it
      if (booking.couponUsageId) {
        const reverseResult = await DiscountService.reverseCoupon(
          booking.couponUsageId,
          'Booking cancelled'
        );

        if (!reverseResult.success) {
          console.error('Failed to reverse coupon for cancelled booking');
        }
      }

      return {
        success: true,
        message: 'Booking cancellation processed',
      };
    } catch (error) {
      console.error('❌ Error handling booking cancellation:', error);
      return {
        success: false,
        message: 'Error processing cancellation',
      };
    }
  }

  /**
   * Get booking with discount details
   */
  static async getBookingWithDiscountDetails(bookingId) {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('vehicle')
        .populate('user', 'name email phone')
        .populate('couponUsageId');

      if (!booking) {
        return null;
      }

      return {
        ...booking.toObject(),
        discountDetails: booking.couponUsageId
          ? {
              couponCode: booking.couponCode,
              discountApplied: booking.discountApplied,
              originalAmount: booking.totalPrice,
              finalAmount: booking.amountAfterDiscount,
              discountPercentage: (
                (booking.discountApplied / booking.totalPrice) *
                100
              ).toFixed(2),
            }
          : null,
      };
    } catch (error) {
      console.error('Error fetching booking with discount details:', error);
      return null;
    }
  }

  /**
   * Calculate final booking amount with all fees and discounts
   */
  static async calculateFinalAmount(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return null;
      }

      // Start with total price
      let finalAmount = booking.totalPrice;

      // Subtract discount
      if (booking.discountApplied > 0) {
        finalAmount -= booking.discountApplied;
      }

      // Add late fees and damage fees
      finalAmount += (booking.lateFee || 0) + (booking.damageFee || 0);

      // Update booking
      await Booking.updateOne(
        { _id: bookingId },
        { finalAmount: Math.round(finalAmount * 100) / 100 }
      );

      return {
        originalPrice: booking.totalPrice,
        discount: booking.discountApplied,
        priceAfterDiscount: booking.amountAfterDiscount,
        lateFee: booking.lateFee,
        damageFee: booking.damageFee,
        finalAmount: Math.round(finalAmount * 100) / 100,
      };
    } catch (error) {
      console.error('Error calculating final amount:', error);
      return null;
    }
  }
}

module.exports = BookingDiscountService;

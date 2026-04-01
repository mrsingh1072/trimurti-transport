const paymentService = require('../services/paymentService');

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for a booking
 */
const createOrder = async (req, res, next) => {
  try {
    console.log('\n📦 [CREATE ORDER] Incoming request:');
    console.log('   - Body:', req.body);
    console.log('   - User ID:', req.user._id);

    const { bookingId, amount } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!bookingId) {
      console.log('❌ [CREATE ORDER] Missing bookingId');
      return res.status(400).json({
        success: false,
        message: 'bookingId is required',
      });
    }

    if (!amount) {
      console.log('❌ [CREATE ORDER] Missing amount');
      return res.status(400).json({
        success: false,
        message: 'amount is required',
      });
    }

    // Ensure amount is a number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('❌ [CREATE ORDER] Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'amount must be a valid positive number',
      });
    }

    console.log('✅ [CREATE ORDER] Validation passed');
    console.log('   - bookingId:', bookingId);
    console.log('   - amount:', numericAmount);

    const orderData = await paymentService.createOrderForBooking(
      userId,
      bookingId,
      numericAmount
    );

    console.log('✅ [CREATE ORDER] Order created successfully');
    console.log('   - orderId:', orderData.orderId);

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: orderData,
    });
  } catch (error) {
    console.error('❌ [CREATE ORDER] Error:', error.message);
    
    // Get detailed error message from Razorpay or other sources
    let errorMessage = error.message || 'Failed to create order';
    if (error.error?.description) {
      errorMessage = error.error.description;
    }
    if (error.error?.reason) {
      errorMessage = `${errorMessage} - ${error.error.reason}`;
    }
    
    console.error('❌ [CREATE ORDER] Error details:');
    console.error('   - Status code:', error.statusCode || 500);
    console.error('   - Message:', errorMessage);
    console.error('   - Error object:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.error : undefined,
    });
  }
};

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature and complete payment
 */
const verifyPayment = async (req, res, next) => {
  try {
    console.log('\n✔️ [VERIFY PAYMENT] Incoming request');
    console.log('   - Body:', JSON.stringify(req.body, null, 2));

    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;
    const userId = req.user._id;

    // Validate all required fields
    if (!bookingId) {
      console.log('❌ [VERIFY PAYMENT] Missing bookingId');
      return res.status(400).json({
        success: false,
        message: 'bookingId is required',
      });
    }

    if (!razorpayOrderId) {
      console.log('❌ [VERIFY PAYMENT] Missing razorpayOrderId');
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId is required',
      });
    }

    if (!razorpayPaymentId) {
      console.log('❌ [VERIFY PAYMENT] Missing razorpayPaymentId');
      return res.status(400).json({
        success: false,
        message: 'razorpayPaymentId is required',
      });
    }

    if (!razorpaySignature) {
      console.log('❌ [VERIFY PAYMENT] Missing razorpaySignature');
      return res.status(400).json({
        success: false,
        message: 'razorpaySignature is required',
      });
    }

    console.log('✅ [VERIFY PAYMENT] Validation passed');

    const result = await paymentService.completePayment(
      userId,
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    console.log('✅ [VERIFY PAYMENT] Payment verified successfully');

    res.status(200).json({
      success: true,
      message: 'Payment verified and completed successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ [VERIFY PAYMENT] Error:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
};

/**
 * GET /api/payments
 * Get payments list (staff/admin see all, customer sees own)
 */
const getPayments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const filters = {};

    // Optional filters
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.startDate && req.query.endDate) {
      filters.startDate = req.query.startDate;
      filters.endDate = req.query.endDate;
    }

    const payments = await paymentService.getPayments(userId, userRole, filters);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/:id
 * Get single payment details
 */
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const payment = await paymentService.getPaymentById(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/stats/overview
 * Get payment statistics and analytics (admin only)
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await paymentService.getPaymentStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPayments,
  getPaymentById,
  getStats,
};

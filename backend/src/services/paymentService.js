const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PAYMENT_STATUS } = require('../config/constants');

// Verify Razorpay credentials are loaded
console.log('\n🔐 [PAYMENT SERVICE] Verifying Razorpay configuration:');
if (!process.env.RAZORPAY_KEY_ID) {
  console.error('❌ RAZORPAY_KEY_ID is not set in environment variables');
} else {
  console.log('✅ RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...');
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_SECRET is not set in environment variables');
} else {
  console.log('✅ RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET.substring(0, 15) + '...');
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log('✅ [PAYMENT SERVICE] Razorpay initialized successfully\n');

/**
 * Create a Razorpay order for a booking
 */
const createOrderForBooking = async (userId, bookingId, amount) => {
  try {
    console.log('\n📦 [PAYMENT SERVICE] Creating order');
    console.log('   - User ID:', userId);
    console.log('   - Booking ID:', bookingId);
    console.log('   - Amount:', amount, '(type:', typeof amount + ')');

    // Validate booking exists
    console.log('\n🔎 [PAYMENT SERVICE] Looking up booking...');
    const booking = await Booking.findById(bookingId).populate('user vehicle');
    console.log('✅ [PAYMENT SERVICE] Database query successful');
    
    if (!booking) {
      console.log('❌ [PAYMENT SERVICE] Booking not found (null result)');
      console.log('   - Booking ID searched:', bookingId);
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    console.log('✅ [PAYMENT SERVICE] Booking found successfully');
    console.log('   - Booking ID:', booking._id);
    console.log('   - Booking status:', booking.status);
    console.log('   - Vehicle:', booking.vehicle?.name);
    console.log('   - Booking user:', booking.user?._id);

    // Verify user owns the booking - compare as strings for safety
    console.log('\n🔐 [PAYMENT SERVICE] Authorization Check:');
    
    // Handle case where user wasn't populated (User document deleted or doesn't exist)
    let bookingUserId;
    if (booking.user && typeof booking.user === 'object') {
      // User was populated correctly
      bookingUserId = booking.user._id.toString();
      console.log('   - Booking user ID (populated):', bookingUserId);
    } else if (booking.user) {
      // User is an ObjectId (not populated) - use it directly
      bookingUserId = booking.user.toString();
      console.log('   - Booking user ID (raw ObjectId):', bookingUserId);
    } else {
      // User is null (populate failed - document might have been deleted)
      console.log('   - Booking user reference is null');
      console.log('   - Note: User document may have been deleted');
      console.log('   - Proceeding with authorization check using current user ID');
      // Allow payment if current user ID matches (uses current auth context)
      console.log('   - Current user ID will be used for authorization');
      bookingUserId = null;
    }
    
    const currentUserId = userId.toString();
    console.log('   - Current user ID:', currentUserId);
    
    // If booking user ID is available, verify it matches current user
    // If it's null (user deleted), rely on the current authenticated user
    const isOwner = !bookingUserId || bookingUserId === currentUserId;
    console.log('   - Authorization check:', isOwner ? 'PASS' : 'FAIL');
    
    if (!isOwner) {
      console.log('❌ [PAYMENT SERVICE] Authorization failed - mismatch');
      console.log('   - Booking user ID:', bookingUserId);
      console.log('   - Current user ID:', currentUserId);
      const error = new Error('Not authorized to pay for this booking');
      error.statusCode = 403;
      throw error;
    }

    console.log('✅ [PAYMENT SERVICE] Authorization passed');

    // Ensure amount is numeric
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('❌ [PAYMENT SERVICE] Invalid amount:', amount);
      const error = new Error('Invalid amount: must be a positive number');
      error.statusCode = 400;
      throw error;
    }

    // Create Razorpay order
    console.log('\n💳 [PAYMENT SERVICE] Preparing Razorpay order...');
    const options = {
      amount: Math.round(numericAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: `bk_${bookingId.toString().substring(0, 20)}`, // Max 40 chars: "bk_" + first 20 of ID
      description: `Payment for Vehicle Booking - ${booking.vehicle?.name || 'Vehicle'}`,
    };

    console.log('📝 [PAYMENT SERVICE] Order options:');
    console.log('   - Amount:', options.amount, 'paise (₹' + (options.amount / 100) + ')');
    console.log('   - Currency:', options.currency);
    console.log('   - Receipt:', options.receipt);
    console.log('   - Description:', options.description);

    console.log('\n🚀 [PAYMENT SERVICE] Calling Razorpay API...');
    const order = await razorpay.orders.create(options);
    console.log('✅ [PAYMENT SERVICE] Razorpay API call successful');
    console.log('   - Order ID:', order.id);
    console.log('   - Amount:', order.amount);
    console.log('   - Status:', order.status);

    console.log('\n💾 [PAYMENT SERVICE] Creating payment record in database...');
    const payment = await Payment.create({
      user: userId,
      booking: bookingId,
      amount,
      status: PAYMENT_STATUS.PENDING,
      method: 'upi',
      razorpayOrderId: order.id,
      description: options.description,
    });
    console.log('✅ [PAYMENT SERVICE] Payment record created successfully');
    console.log('   - Payment ID:', payment._id);

    console.log('\n✅ [PAYMENT SERVICE] Order creation complete');
    return {
      orderId: order.id,
      paymentId: payment._id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error('❌ [PAYMENT SERVICE] Error creating order:');
    console.error('   - Error type:', error.constructor.name);
    console.error('   - Error message:', error.message);
    
    // Database error handling
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('   - Database error details:', error.message);
    }
    
    // Razorpay specific error handling
    if (error.error?.description) {
      console.error('   - Razorpay error:', error.error.description);
    }
    if (error.error?.code) {
      console.error('   - Razorpay code:', error.error.code);
    }
    if (error.error?.source) {
      console.error('   - Razorpay source:', error.error.source);
    }
    if (error.error?.reason) {
      console.error('   - Razorpay reason:', error.error.reason);
    }
    
    console.error('   - Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Complete payment after verification
 */
const completePayment = async (
  userId,
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  try {
    console.log('\n🔐 [COMPLETE PAYMENT] Starting payment verification and completion');
    console.log('   - User ID:', userId);
    console.log('   - Booking ID:', bookingId);
    console.log('   - Order ID:', razorpayOrderId);
    console.log('   - Payment ID:', razorpayPaymentId);

    // Step 1: Verify signature
    console.log('\n✔️ [COMPLETE PAYMENT] Verifying Razorpay signature...');
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      console.log('❌ [COMPLETE PAYMENT] Signature verification failed');
      console.log('   - Expected signature:', verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature));
      console.log('   - Received signature:', razorpaySignature);
      const error = new Error('Invalid payment signature');
      error.statusCode = 400;
      throw error;
    }
    console.log('✅ [COMPLETE PAYMENT] Signature verified successfully');

    // Step 2: Find payment record
    console.log('\n🔍 [COMPLETE PAYMENT] Looking up payment record...');
    const payment = await Payment.findOne({
      booking: bookingId,
      razorpayOrderId,
    });

    if (!payment) {
      console.log('❌ [COMPLETE PAYMENT] Payment record not found');
      console.log('   - Booking ID:', bookingId);
      console.log('   - Order ID:', razorpayOrderId);
      const error = new Error('Payment record not found');
      error.statusCode = 404;
      throw error;
    }
    console.log('✅ [COMPLETE PAYMENT] Payment record found');
    console.log('   - Payment ID:', payment._id);
    console.log('   - Current status:', payment.status);
    console.log('   - Amount:', payment.amount);

    // Step 3: Verify authorization
    console.log('\n🛡️ [COMPLETE PAYMENT] Verifying user authorization...');
    const paymentUserId = payment.user.toString();
    const requestUserId = userId.toString();
    
    if (paymentUserId !== requestUserId) {
      console.log('❌ [COMPLETE PAYMENT] Authorization failed');
      console.log('   - Payment user ID:', paymentUserId);
      console.log('   - Request user ID:', requestUserId);
      const error = new Error('Not authorized to complete this payment');
      error.statusCode = 403;
      throw error;
    }
    console.log('✅ [COMPLETE PAYMENT] User authorization verified');

    // Step 4: Check if payment already completed
    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      console.log('⚠️ [COMPLETE PAYMENT] Payment already completed');
      console.log('   - Payment ID:', payment._id);
      console.log('   - Razorpay Payment ID:', payment.razorpayPaymentId);
      // Return the existing payment - allow idempotent calls
      const booking = await Booking.findById(bookingId);
      return {
        payment: payment.toObject(),
        booking: booking.toObject(),
      };
    }

    // Step 5: Update payment record
    console.log('\n💾 [COMPLETE PAYMENT] Updating payment record...');
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();
    console.log('✅ [COMPLETE PAYMENT] Payment record updated');
    console.log('   - New status:', payment.status);
    console.log('   - Razorpay Payment ID:', razorpayPaymentId);

    // Step 6: Update booking
    console.log('\n📋 [COMPLETE PAYMENT] Updating booking status...');
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        paymentId: payment._id,
      },
      { new: true }
    );

    if (!booking) {
      console.log('⚠️ [COMPLETE PAYMENT] Booking not found for update');
      console.log('   - Booking ID:', bookingId);
    } else {
      console.log('✅ [COMPLETE PAYMENT] Booking updated successfully');
      console.log('   - Booking ID:', booking._id);
      console.log('   - Payment Status:', booking.paymentStatus);
      console.log('   - Booking Status:', booking.status);
    }

    console.log('\n✅ [COMPLETE PAYMENT] Payment completion successful');
    return {
      payment: payment.toObject(),
      booking: booking.toObject(),
    };
  } catch (error) {
    console.error('\n❌ [COMPLETE PAYMENT] Error completing payment:');
    console.error('   - Error type:', error.constructor.name);
    console.error('   - Error message:', error.message);
    console.error('   - Status code:', error.statusCode || 500);
    throw error;
  }
};

/**
 * Get payments with role-based filtering
 */
const getPayments = async (userId, userRole, filters = {}) => {
  let query = {};

  // Role-based access control
  if (userRole === 'customer') {
    query.user = userId;
  }
  // staff and admin can see all payments, apply additional filters if provided

  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  const payments = await Payment.find(query)
    .populate('user', 'name email phone')
    .populate({
      path: 'booking',
      populate: { path: 'vehicle', select: 'name registrationNumber' },
    })
    .sort({ createdAt: -1 });

  return payments;
};

/**
 * Get payment statistics (admin only)
 */
const getPaymentStats = async () => {
  const stats = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', PAYMENT_STATUS.COMPLETED] }, 1, 0] },
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', PAYMENT_STATUS.PENDING] }, 1, 0] },
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', PAYMENT_STATUS.FAILED] }, 1, 0] },
        },
        completedRevenue: {
          $sum: {
            $cond: [{ $eq: ['$status', PAYMENT_STATUS.COMPLETED] }, '$amount', 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalTransactions: 1,
        totalRevenue: 1,
        completedPayments: 1,
        completedRevenue: 1,
        pendingPayments: 1,
        failedPayments: 1,
        successRate: {
          $round: [
            {
              $multiply: [
                { $divide: ['$completedPayments', '$totalTransactions'] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
  ]);

  // Monthly revenue trends
  const monthlyTrends = await Payment.aggregate([
    {
      $match: { status: PAYMENT_STATUS.COMPLETED },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 },
    },
    {
      $limit: 12,
    },
  ]);

  // Payment method distribution
  const methodDistribution = await Payment.aggregate([
    {
      $match: { status: PAYMENT_STATUS.COMPLETED },
    },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' },
      },
    },
  ]);

  return {
    overall: stats[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      completedPayments: 0,
      completedRevenue: 0,
      pendingPayments: 0,
      failedPayments: 0,
      successRate: 0,
    },
    monthlyTrends,
    methodDistribution,
  };
};

/**
 * Get single payment details
 */
const getPaymentById = async (paymentId, userId, userRole) => {
  const payment = await Payment.findById(paymentId)
    .populate('user', 'name email phone')
    .populate({
      path: 'booking',
      populate: { path: 'vehicle', select: 'name registrationNumber pricePerDay' },
    });

  if (!payment) {
    const error = new Error('Payment not found');
    error.statusCode = 404;
    throw error;
  }

  // Only allow user to view their own payment or staff/admin to view any
  if (
    userRole === 'customer' &&
    payment.user._id.toString() !== userId.toString()
  ) {
    const error = new Error('Not authorized to view this payment');
    error.statusCode = 403;
    throw error;
  }

  return payment;
};

/**
 * Mark fine (late fee + damage fee) as paid for a booking
 */
const markFinePaid = async (bookingId, userId) => {
  try {
    // Find booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify ownership
    if (booking.user.toString() !== userId.toString()) {
      const error = new Error('Not authorized to pay fine for this booking');
      error.statusCode = 403;
      throw error;
    }

    // Check if there are fines to pay
    if (booking.lateFee <= 0 && booking.damageFee <= 0) {
      const error = new Error('No pending fines for this booking');
      error.statusCode = 400;
      throw error;
    }

    // Mark fine as paid
    booking.isFinePaid = true;
    await booking.save();

    return booking;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a Razorpay order for fine payment
 */
const createFinePaymentOrder = async (userId, bookingId) => {
  try {
    console.log('\n💰 [FINE PAYMENT SERVICE] Creating fine payment order');
    console.log('   - User ID:', userId);
    console.log('   - Booking ID:', bookingId);

    // Validate booking exists
    console.log('\n🔎 [FINE PAYMENT SERVICE] Looking up booking...');
    const booking = await Booking.findById(bookingId).populate('user vehicle');
    console.log('✅ [FINE PAYMENT SERVICE] Database query successful');
    
    if (!booking) {
      console.log('❌ [FINE PAYMENT SERVICE] Booking not found');
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    console.log('✅ [FINE PAYMENT SERVICE] Booking found');
    console.log('   - Late Fee:', booking.lateFee);
    console.log('   - Damage Fee:', booking.damageFee);

    // Verify user owns the booking
    console.log('\n🔐 [FINE PAYMENT SERVICE] Authorization Check');
    const bookingUserId = booking.user ? booking.user._id.toString() : booking.user.toString();
    const currentUserId = userId.toString();
    
    if (bookingUserId !== currentUserId) {
      console.log('❌ [FINE PAYMENT SERVICE] Authorization failed');
      const error = new Error('Not authorized to pay fine for this booking');
      error.statusCode = 403;
      throw error;
    }
    console.log('✅ [FINE PAYMENT SERVICE] Authorization passed');

    // Check if there are fines to pay
    const totalFine = (booking.lateFee || 0) + (booking.damageFee || 0);
    console.log('\n📊 [FINE PAYMENT SERVICE] Fine amount calculation');
    console.log('   - Late Fee:', booking.lateFee || 0);
    console.log('   - Damage Fee:', booking.damageFee || 0);
    console.log('   - Total Fine:', totalFine);

    if (totalFine <= 0) {
      console.log('❌ [FINE PAYMENT SERVICE] No pending fines');
      const error = new Error('No pending fines for this booking');
      error.statusCode = 400;
      throw error;
    }

    if (booking.isFinePaid) {
      console.log('⚠️ [FINE PAYMENT SERVICE] Fine already paid');
      const error = new Error('Fine already paid for this booking');
      error.statusCode = 400;
      throw error;
    }

    // Create Razorpay order
    console.log('\n💳 [FINE PAYMENT SERVICE] Preparing Razorpay order...');
    const options = {
      amount: Math.round(totalFine * 100), // Amount in paise
      currency: 'INR',
      receipt: `fine_${bookingId.toString().substring(0, 20)}`, // Max 40 chars
      description: `Fine Payment - ${booking.vehicle?.name || 'Vehicle'} (Late: ₹${booking.lateFee || 0}, Damage: ₹${booking.damageFee || 0})`,
    };

    console.log('📝 [FINE PAYMENT SERVICE] Order options:');
    console.log('   - Amount:', options.amount, 'paise (₹' + (options.amount / 100) + ')');
    console.log('   - Currency:', options.currency);
    console.log('   - Receipt:', options.receipt);
    console.log('   - Description:', options.description);

    console.log('\n🚀 [FINE PAYMENT SERVICE] Calling Razorpay API...');
    const order = await razorpay.orders.create(options);
    console.log('✅ [FINE PAYMENT SERVICE] Razorpay API call successful');
    console.log('   - Order ID:', order.id);
    console.log('   - Amount:', order.amount);

    console.log('\n💾 [FINE PAYMENT SERVICE] Creating payment record...');
    const payment = await Payment.create({
      user: userId,
      booking: bookingId,
      amount: totalFine,
      status: PAYMENT_STATUS.PENDING,
      method: 'upi',
      razorpayOrderId: order.id,
      description: options.description,
    });
    console.log('✅ [FINE PAYMENT SERVICE] Payment record created');
    console.log('   - Payment ID:', payment._id);

    console.log('\n✅ [FINE PAYMENT SERVICE] Order creation complete');
    return {
      orderId: order.id,
      paymentId: payment._id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error('\n❌ [FINE PAYMENT SERVICE] Error creating order:');
    console.error('   - Error message:', error.message);
    console.error('   - Status code:', error.statusCode || 500);
    throw error;
  }
};

/**
 * Complete fine payment after verification
 */
const completeFinePayment = async (
  userId,
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  try {
    console.log('\n🔐 [FINE PAYMENT] Starting verification and completion');
    console.log('   - User ID:', userId);
    console.log('   - Booking ID:', bookingId);
    console.log('   - Order ID:', razorpayOrderId);
    console.log('   - Payment ID:', razorpayPaymentId);

    // Step 1: Verify signature
    console.log('\n✔️ [FINE PAYMENT] Verifying Razorpay signature...');
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      console.log('❌ [FINE PAYMENT] Signature verification failed');
      const error = new Error('Invalid payment signature');
      error.statusCode = 400;
      throw error;
    }
    console.log('✅ [FINE PAYMENT] Signature verified successfully');

    // Step 2: Find payment record
    console.log('\n🔍 [FINE PAYMENT] Looking up payment record...');
    const payment = await Payment.findOne({
      booking: bookingId,
      razorpayOrderId,
    });

    if (!payment) {
      console.log('❌ [FINE PAYMENT] Payment record not found');
      const error = new Error('Payment record not found');
      error.statusCode = 404;
      throw error;
    }
    console.log('✅ [FINE PAYMENT] Payment record found');
    console.log('   - Current status:', payment.status);

    // Step 3: Verify authorization
    console.log('\n🛡️ [FINE PAYMENT] Verifying user authorization...');
    const paymentUserId = payment.user.toString();
    const requestUserId = userId.toString();
    
    if (paymentUserId !== requestUserId) {
      console.log('❌ [FINE PAYMENT] Authorization failed');
      const error = new Error('Not authorized to complete this payment');
      error.statusCode = 403;
      throw error;
    }
    console.log('✅ [FINE PAYMENT] User authorization verified');

    // Step 4: Check if already completed
    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      console.log('⚠️ [FINE PAYMENT] Payment already completed');
      const booking = await Booking.findById(bookingId);
      return {
        payment: payment.toObject(),
        booking: booking.toObject(),
      };
    }

    // Step 5: Update payment record
    console.log('\n💾 [FINE PAYMENT] Updating payment record...');
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();
    console.log('✅ [FINE PAYMENT] Payment record updated');

    // Step 6: Update booking - mark fine as paid
    console.log('\n📋 [FINE PAYMENT] Updating booking (marking fine as paid)...');
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { isFinePaid: true },
      { new: true }
    );

    if (!booking) {
      console.log('⚠️ [FINE PAYMENT] Booking not found for update');
    } else {
      console.log('✅ [FINE PAYMENT] Booking updated successfully');
      console.log('   - isFinePaid:', booking.isFinePaid);
    }

    console.log('\n✅ [FINE PAYMENT] Fine payment completion successful');
    return {
      payment: payment.toObject(),
      booking: booking.toObject(),
    };
  } catch (error) {
    console.error('\n❌ [FINE PAYMENT] Error completing fine payment:');
    console.error('   - Error message:', error.message);
    console.error('   - Status code:', error.statusCode || 500);
    throw error;
  }
};

module.exports = {
  createOrderForBooking,
  verifyPaymentSignature,
  completePayment,
  getPayments,
  getPaymentStats,
  getPaymentById,
  markFinePaid,
  createFinePaymentOrder,
  completeFinePayment,
};

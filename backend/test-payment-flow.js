#!/usr/bin/env node
/**
 * Backend Payment Flow Test
 * Tests the complete payment order creation flow
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Initialize models first
require('./src/models/User');
require('./src/models/Booking');
require('./src/models/Payment');
require('./src/models/Vehicle');

const Booking = mongoose.model('Booking');
const paymentService = require('./src/services/paymentService');

console.log('\n🧪 [BACKEND TEST] Starting payment flow test...\n');

const testPaymentFlow = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('1️⃣  Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 2. Get a test booking
    console.log('2️⃣  Fetching test booking...');
    const booking = await Booking.findOne();
    
    if (!booking) {
      console.error('❌ No bookings found in database');
      console.log('\n💡 Create a booking first via the frontend, then run this script\n');
      process.exit(1);
    }

    console.log('✅ Found booking:', booking._id);
    console.log('   - User ID:', booking.user);
    console.log('   - Vehicle ID:', booking.vehicle);
    console.log('   - Amount:', booking.totalPrice, 'INR\n');

    // 3. Test payment service
    console.log('3️⃣  Testing payment service...');
    
    if (!booking.user || !booking.totalPrice) {
      console.error('❌ Cannot test: Missing user or amount');
      console.error('   - booking.user:', booking.user);
      console.error('   - booking.totalPrice:', booking.totalPrice);
      console.error('\n');
      process.exit(1);
    }
    
    try {
      const orderData = await paymentService.createOrderForBooking(
        booking.user,
        booking._id,
        booking.totalPrice
      );
      console.log('✅ Payment order created successfully');
      console.log('   - Order ID:', orderData.orderId);
      console.log('   - Payment ID:', orderData.paymentId);
      console.log('   - Amount:', orderData.amount / 100, 'INR\n');
    } catch (serviceError) {
      console.error('❌ Payment service error:', serviceError.message);
      if (serviceError.error?.description) {
        console.error('   - Razorpay:', serviceError.error.description);
      }
      console.error('\n');
      process.exit(1);
    }

    console.log('✅ [SUCCESS] All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ [ERROR] Test failed:');
    console.error('   -', error.message, '\n');
    process.exit(1);
  }
};

testPaymentFlow();

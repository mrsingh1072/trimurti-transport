const mongoose = require('mongoose')
const crypto = require('crypto')

// Load environment variables FIRST
require('dotenv').config()

// Initialize models
require('./src/models/User')
require('./src/models/Booking')
require('./src/models/Payment')
require('./src/models/Vehicle')

// Get models from mongoose
const Payment = mongoose.model('Payment')
const Booking = mongoose.model('Booking')
const paymentService = require('./src/services/paymentService')

async function testVerifyPayment() {
  try {
    console.log('\n🔐 [VERIFY TEST] Starting payment verification test...\n')

    // Connect to MongoDB
    console.log('1️⃣  Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB\n')

    // Find the last created payment (from previous test)
    console.log('2️⃣  Fetching last payment record...')
    const payment = await Payment.findOne().sort({ createdAt: -1 })
    
    if (!payment) {
      console.log('❌ No payment records found')
      process.exit(1)
    }

    console.log('✅ Found payment record')
    console.log('   - Payment ID:', payment._id)
    console.log('   - Order ID:', payment.razorpayOrderId)
    console.log('   - User ID:', payment.user)
    console.log('   - Status:', payment.status)

    // Simulate Razorpay response (for testing purposes)
    console.log('\n3️⃣  Simulating Razorpay payment verification...\n')
    
    // Generate test payment ID and signature
    const testPaymentId = 'pay_' + Math.random().toString(36).substring(7)
    const orderId = payment.razorpayOrderId
    
    // Generate valid HMAC signature
    const body = orderId + '|' + testPaymentId
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    console.log('📝 [TEST] Generated verification payload:')
    console.log('   - Order ID:', orderId)
    console.log('   - Payment ID:', testPaymentId)
    console.log('   - Signature:', signature.substring(0, 20) + '...')

    // Call the payment service with test user
    console.log('\n4️⃣  Calling completePayment service...\n')
    const userId = payment.user

    try {
      const result = await paymentService.completePayment(
        userId,
        payment.booking,
        orderId,
        testPaymentId,
        signature
      )

      console.log('✅ [VERIFY TEST] Payment verification successful!')
      console.log('   - Payment status:', result.payment.status)
      console.log('   - Booking payment status:', result.booking.paymentStatus)
      console.log('   - Razorpay Payment ID:', testPaymentId)

      console.log('\n✅ [SUCCESS] Verification test passed!')
    } catch (error) {
      console.error('❌ [VERIFY TEST] Verification failed:')
      console.error('   - Error:', error.message)
      console.error('   - Status code:', error.statusCode)
    }

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ [TEST] Fatal error:')
    console.error('   -', error.message)
    process.exit(1)
  }
}

testVerifyPayment()

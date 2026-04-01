// Razorpay Configuration Debug Script
// Run this to verify Razorpay is properly configured

require('dotenv').config();
const Razorpay = require('razorpay');

console.log('\n🔍 [RAZORPAY DEBUG] Starting configuration check...\n');

// Check 1: Verify environment variables
console.log('1️⃣  Environment Variables:');
console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ [ERROR] Razorpay credentials missing in .env file!');
  process.exit(1);
}

// Check 2: Initialize Razorpay
console.log('\n2️⃣  Razorpay Initialization:');
try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('   ✅ Razorpay instance created successfully');
  console.log('   - Key ID:', process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...');
  console.log('   - Key Secret:', process.env.RAZORPAY_KEY_SECRET.substring(0, 10) + '...');
} catch (error) {
  console.error('   ❌ Failed to create Razorpay instance:', error.message);
  process.exit(1);
}

// Check 3: Try creating a test order
console.log('\n3️⃣  Test Order Creation:');
const testOrder = async () => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 50000, // ₹500
      currency: 'INR',
      receipt: 'test_' + Date.now(),
    };

    console.log('   Attempting to create order with options:');
    console.log('   - Amount:', options.amount, 'paise (₹' + (options.amount / 100) + ')');
    console.log('   - Currency:', options.currency);

    const order = await razorpay.orders.create(options);
    
    console.log('   ✅ Test order created successfully!');
    console.log('   - Order ID:', order.id);
    console.log('   - Amount:', order.amount);
    console.log('   - Currency:', order.currency);
    console.log('   - Status:', order.status);

    console.log('\n✅ [SUCCESS] Razorpay is properly configured and working!\n');
  } catch (error) {
    console.error('   ❌ Failed to create test order:');
    console.error('   - Error:', error.message);
    if (error.error) {
      console.error('   - Details:', error.error);
    }
    console.error('\n❌ [ERROR] Razorpay configuration has issues!\n');
    process.exit(1);
  }
};

testOrder();

require('dotenv').config();
const Razorpay = require('razorpay');

console.log('\n🔍 [RAZORPAY TEST] Starting Razorpay configuration test...\n');

// Check environment variables
console.log('1️⃣  Environment Variables:');
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('   RAZORPAY_KEY_ID:', keyId ? '✅ Set' : '❌ Missing');
console.log('   RAZORPAY_KEY_SECRET:', keySecret ? '✅ Set' : '❌ Missing');

if (!keyId || !keySecret) {
  console.error('\n❌ [ERROR] Razorpay credentials missing in .env file!');
  process.exit(1);
}

console.log('   - Key ID:', keyId.substring(0, 15) + '...');
console.log('   - Key Secret:', keySecret.substring(0, 10) + '...');

// Initialize Razorpay
console.log('\n2️⃣  Razorpay Initialization:');
try {
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  console.log('   ✅ Razorpay instance created successfully');
} catch (error) {
  console.error('   ❌ Failed to create Razorpay instance:');
  console.error('   - Error:', error.message);
  process.exit(1);
}

// Test order creation
console.log('\n3️⃣  Testing Order Creation:');
const testOrder = async () => {
  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: 50000, // ₹500 in paise
      currency: 'INR',
      receipt: 'test_' + Date.now(),
      description: 'Test Order',
    };

    console.log('   Creating test order with:');
    console.log('   - Amount:', options.amount / 100, 'INR');
    console.log('   - Currency:', options.currency);
    console.log('   - Receipt:', options.receipt);

    const order = await razorpay.orders.create(options);

    console.log('\n   ✅ [SUCCESS] Test order created!');
    console.log('   - Order ID:', order.id);
    console.log('   - Amount:', order.amount / 100, 'INR');
    console.log('   - Currency:', order.currency);
    console.log('   - Status:', order.status);
    console.log('\n✅ [VERIFIED] Razorpay is working correctly!\n');
    process.exit(0);
  } catch (error) {
    console.log('\n   ❌ [ERROR] Failed to create test order\n');
    console.error('   Error Type:', error.constructor.name);
    console.error('   Error Message:', error.message);
    
    if (error.error) {
      console.error('\n   Razorpay Error Details:');
      console.error('   - Code:', error.error.code);
      console.error('   - Description:', error.error.description);
      console.error('   - Source:', error.error.source);
      console.error('   - Reason:', error.error.reason);
    }
    
    console.error('\n   Full Error:', error);
    process.exit(1);
  }
};

testOrder();

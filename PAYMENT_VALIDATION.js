#!/usr/bin/env node
/**
 * Payment System Validation Script
 * Comprehensive check of all payment components
 * 
 * Usage: node PAYMENT_VALIDATION.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║      PAYMENT SYSTEM VALIDATION SCRIPT                      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Track validation results
const results = [];

function checkItem(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  results.push({ name, passed, details });
  console.log(`${status} ${name}${details ? ` - ${details}` : ''}`);
}

// 1. Check .env file exists
console.log('📋 Checking Environment Variables...\n');

const envPath = path.join(__dirname, 'backend', '.env');
const envExists = fs.existsSync(envPath);
checkItem('.env file exists', envExists, envExists ? 'Found' : 'Not found in backend/.env');

// 2. Check .env contents
if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasKeyId = envContent.includes('RAZORPAY_KEY_ID');
  const hasKeySecret = envContent.includes('RAZORPAY_KEY_SECRET');
  
  checkItem('RAZORPAY_KEY_ID in .env', hasKeyId);
  checkItem('RAZORPAY_KEY_SECRET in .env', hasKeySecret);
  
  if (hasKeyId && hasKeySecret) {
    const keyIdMatch = envContent.match(/RAZORPAY_KEY_ID=(.+)/);
    const keyId = keyIdMatch ? keyIdMatch[1].trim() : '';
    const keySecretMatch = envContent.match(/RAZORPAY_KEY_SECRET=(.+)/);
    const keySecret = keySecretMatch ? keySecretMatch[1].trim() : '';
    
    checkItem('RAZORPAY_KEY_ID is not empty', keyId.length > 0, `${keyId.substring(0, 15)}...`);
    checkItem('RAZORPAY_KEY_SECRET is not empty', keySecret.length > 0, `${keySecret.substring(0, 10)}...`);
    
    checkItem('Key ID format correct', keyId.startsWith('rzp_test_'), keyId.startsWith('rzp_test_') ? 'Test key ✓' : 'Should be test key');
  }
}

// 3. Check Node modules
console.log('\n📦 Checking Dependencies...\n');

const modules = ['razorpay', 'express', 'mongoose', 'dotenv'];
modules.forEach(module => {
  const modulePath = path.join(__dirname, 'backend', 'node_modules', module);
  const exists = fs.existsSync(modulePath);
  checkItem(`${module} installed`, exists);
});

// 4. Check backend file structure
console.log('\n📁 Checking Backend Structure...\n');

const files = [
  { path: 'backend/src/server.js', name: 'server.js' },
  { path: 'backend/src/controllers/paymentController.js', name: 'paymentController.js' },
  { path: 'backend/src/services/paymentService.js', name: 'paymentService.js' },
  { path: 'backend/src/routes/paymentRoutes.js', name: 'paymentRoutes.js' },
  { path: 'backend/src/models/Payment.js', name: 'Payment model' },
  { path: 'backend/src/models/Booking.js', name: 'Booking model' },
];

files.forEach(({ path: filePath, name }) => {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  checkItem(`${name} exists`, exists);
});

// 5. Check frontend file structure
console.log('\n🎨 Checking Frontend Structure...\n');

const frontendFiles = [
  { path: 'frontend/src/components/PaymentCheckoutModal.jsx', name: 'PaymentCheckoutModal.jsx' },
  { path: 'frontend/src/services/api.js', name: 'API service' },
];

frontendFiles.forEach(({ path: filePath, name }) => {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  checkItem(`${name} exists`, exists);
});

// 6. Validate code contains key functions
console.log('\n🔍 Checking Payment Code...\n');

const paymentServicePath = path.join(__dirname, 'backend', 'src', 'services', 'paymentService.js');
if (fs.existsSync(paymentServicePath)) {
  const content = fs.readFileSync(paymentServicePath, 'utf8');
  
  checkItem('paymentService has Razorpay require', content.includes("require('razorpay')"));
  checkItem('paymentService initializes Razorpay', content.includes('new Razorpay'));
  checkItem('paymentService has createOrderForBooking', content.includes('const createOrderForBooking'));
  checkItem('paymentService has error handling', content.includes('catch (error)'));
  checkItem('paymentService has verification', content.includes('verifyPaymentSignature'));
}

const paymentControllerPath = path.join(__dirname, 'backend', 'src', 'controllers', 'paymentController.js');
if (fs.existsSync(paymentControllerPath)) {
  const content = fs.readFileSync(paymentControllerPath, 'utf8');
  
  checkItem('paymentController validates amount', content.includes('isNaN(numericAmount)'));
  checkItem('paymentController converts to number', content.includes('Number(amount)'));
  checkItem('paymentController has logging', content.includes('console.log'));
  checkItem('paymentController handles errors', content.includes('[CREATE ORDER] Error'));
}

// 7. Summary
console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                     VALIDATION SUMMARY                     ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const passed = results.filter(r => r.passed).length;
const total = results.length;
const percentage = Math.round((passed / total) * 100);

console.log(`✅ Passed: ${passed}/${total} (${percentage}%)\n`);

if (passed === total) {
  console.log('🎉 [SUCCESS] All validation checks passed!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Restart backend: npm run dev');
  console.log('   2. Check logs for Razorpay initialization');
  console.log('   3. Test payment flow from frontend');
  console.log('   4. Check browser console for logs\n');
} else {
  console.log('⚠️  [WARNING] Some checks failed:\n');
  results
    .filter(r => !r.passed)
    .forEach(r => {
      console.log(`   ❌ ${r.name}${r.details ? ` - ${r.details}` : ''}`);
    });
  console.log('');
  console.log('💡 To fix:');
  console.log('   1. Check .env file in backend/ folder');
  console.log('   2. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set');
  console.log('   3. Run: cd backend && npm install');
  console.log('   4. Restart server: npm run dev\n');
}

// 8. Connected check (if possible)
console.log('🔧 Environment Check:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   Node.js: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   CWD: ${process.cwd()}\n`);

process.exit(passed === total ? 0 : 1);

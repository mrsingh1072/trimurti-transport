/**
 * DIAGNOSTIC TEST SCRIPT FOR 401 UNAUTHORIZED ERROR
 * 
 * Copy and paste this into your browser console after logging in as staff
 * It will test the entire auth flow and show you what's working and what's not
 */

console.log('🚀 Starting 401 Diagnostic Test...\n');

// COLOR CODES FOR CONSOLE
const colors = {
  info: 'color: #3b82f6; font-weight: bold;',
  success: 'color: #10b981; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
  warning: 'color: #f59e0b; font-weight: bold;'
};

// TEST 1: Check localStorage
console.log('%c▶ TEST 1: Check localStorage', colors.info);
const token = localStorage.getItem('authToken');
const user = localStorage.getItem('user');

if (!token) {
  console.log('%c❌ FAIL: No authToken in localStorage', colors.error);
  console.log('   Action: Login again and ensure login succeeded');
} else {
  console.log('%c✅ PASS: authToken found', colors.success);
  console.log(`   Token length: ${token.length}`);
  console.log(`   Token preview: ${token.substring(0, 50)}...`);
}

if (!user) {
  console.log('%c❌ FAIL: No user in localStorage', colors.error);
} else {
  const parsedUser = JSON.parse(user);
  console.log('%c✅ PASS: user found', colors.success);
  console.log('   Stored user:', parsedUser);
}

console.log('');

// TEST 2: Decode JWT manually
console.log('%c▶ TEST 2: Decode JWT Token', colors.info);
if (token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('%c❌ FAIL: Invalid JWT format', colors.error);
    } else {
      const decoded = JSON.parse(atob(parts[1]));
      console.log('%c✅ PASS: Token decoded successfully', colors.success);
      console.log('   Payload:', decoded);
      console.log('   User ID in token:', decoded.id);
      console.log('   Role in token:', decoded.role);
      console.log('   Status in token:', decoded.status);
      
      // Check expiry
      const expiryTime = new Date(decoded.exp * 1000);
      const now = new Date();
      if (expiryTime > now) {
        console.log('%c✅ Token is still valid (expires ' + expiryTime.toLocaleString() + ')', colors.success);
      } else {
        console.log('%c❌ Token has expired!', colors.error);
      }
    }
  } catch (err) {
    console.log('%c❌ FAIL: Could not decode token:', colors.error, err.message);
  }
} else {
  console.log('%c⚠️  SKIP: No token to decode', colors.warning);
}

console.log('');

// TEST 3: Test verify-token endpoint
console.log('%c▶ TEST 3: Test /auth/verify-token Endpoint', colors.info);
fetch('http://localhost:5000/api/auth/verify-token', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => {
    console.log(`   HTTP Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    if (data.success) {
      console.log('%c✅ PASS: Token is valid on backend', colors.success);
      console.log('   Backend verified user:', data.user);
    } else {
      console.log('%c❌ FAIL: Backend rejected token', colors.error);
      console.log('   Response:', data);
    }
  })
  .catch(err => {
    console.log('%c❌ FAIL: Could not reach backend', colors.error);
    console.log('   Error:', err.message);
    console.log('   Make sure backend is running on http://localhost:5000');
  })
  .finally(() => {
    console.log('');
    
    // TEST 4: Test vehicle creation
    console.log('%c▶ TEST 4: Dry-run Vehicle Creation Request', colors.info);
    console.log('   This will send a test POST to /api/vehicles');
    
    const testVehicle = {
      name: 'Test Vehicle',
      category: 'Car',
      pricePerDay: 1000,
      location: 'Test Location',
      condition: 'Good',
      availability: true
    };
    
    fetch('http://localhost:5000/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testVehicle)
    })
      .then(res => {
        console.log(`   HTTP Status: ${res.status}`);
        if (res.status === 201) {
          console.log('%c✅ PASS: Vehicle creation request accepted', colors.success);
        } else {
          console.log(`%c⚠️  Status ${res.status}: Check backend logs`, colors.warning);
        }
        return res.json();
      })
      .then(data => {
        if (data._id || data.id) {
          console.log('%c✅ Vehicle created:', colors.success, data);
        } else if (data.message) {
          console.log('%c❌ Error:', colors.error, data.message);
        }
      })
      .catch(err => {
        console.log('%c❌ FAIL: Could not create vehicle', colors.error);
        console.log('   Error:', err.message);
      })
      .finally(() => {
        console.log('\n%c═══════════════════════════════════', colors.info);
        console.log('%c📊 DIAGNOSTIC SUMMARY', colors.info);
        console.log('%c═══════════════════════════════════', colors.info);
        console.log(`Token in localStorage: ${token ? '✅' : '❌'}`);
        console.log(`User in localStorage: ${user ? '✅' : '❌'}`);
        console.log(`Backend responding: Check TEST 3 result`);
        console.log(`Vehicle creation working: Check TEST 4 result`);
        console.log('%c═══════════════════════════════════\n', colors.info);
      });
  });

// HELPER: Get all diagnostic info
window.getDiagnosticInfo = function() {
  console.log('📋 Current Diagnostic Info:');
  console.table({
    'Token stored': !!token,
    'Token length': token ? token.length : 'N/A',
    'User stored': !!user,
    'User email': user ? JSON.parse(user).email : 'N/A',
    'User role': user ? JSON.parse(user).role : 'N/A',
    'Backend URL': 'http://localhost:5000/api',
  });
};

// HELPER: Clear auth and logout
window.clearAuthAndLogout = function() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('✅ Auth cleared. Please refresh and login again.');
};

console.log('%c💡 Tips:', colors.info);
console.log('  - Type getDiagnosticInfo() to see summary');
console.log('  - Type clearAuthAndLogout() to clear and logout');
console.log('  - Watch backend console logs during tests');
console.log('  - Check TEST 3 and TEST 4 results below...\n');

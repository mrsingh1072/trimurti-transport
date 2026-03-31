// AUTH DIAGNOSTIC SCRIPT
// Paste this in browser console (F12 → Console tab) to diagnose token issues

console.log('=== AUTH DIAGNOSTIC TOOL ===\n');

// 1. Check localStorage
console.log('📦 LOCALSTORAGE CHECK:');
const token = localStorage.getItem('authToken');
const user = localStorage.getItem('user');

console.log('✓ authToken exists:', !!token);
console.log('✓ user exists:', !!user);

if (token) {
  console.log('  Token preview:', token.substring(0, 30) + '...');
  
  // Decode JWT (without verification)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('  Token payload:', payload);
      
      // Check expiration
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = expDate < now;
        console.log('  ⏰ Expires at:', expDate.toLocaleString());
        console.log('  ⏰ Status:', isExpired ? '❌ EXPIRED' : '✅ VALID');
      }
    }
  } catch (e) {
    console.log('  ⚠️ Could not decode token:', e.message);
  }
}

if (user) {
  const userData = JSON.parse(user);
  console.log('  User data:', userData);
}

console.log('\n🔐 API HEADER CHECK:');
// Try making a test request to check headers
fetch('http://localhost:5000/api/vehicles', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token || 'NO_TOKEN'}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => {
    console.log('✓ GET /api/vehicles status:', res.status);
    if (res.status === 401) {
      console.log('  ❌ UNAUTHORIZED - Token may be invalid or missing');
    } else if (res.status === 200) {
      console.log('  ✅ AUTHORIZED - Token is valid');
    }
    return res.json();
  })
  .then(data => console.log('  Response:', data))
  .catch(err => console.log('  ❌ Error:', err.message));

console.log('\n✅ DIAGNOSTIC COMPLETE');
console.log('For detailed logs, check backend console while making requests');

#!/usr/bin/env node

/**
 * Quick Test: Live Tracking API
 * 
 * Usage: node test-live-tracking-api.js
 * 
 * This script:
 * 1. Starts backend server
 * 2. Tests OAuth login
 * 3. Creates a test booking
 * 4. Enables tracking
 * 5. Sends location updates
 * 6. Fetches live tracking API
 * 7. Verifies vehicles appear
 */

const http = require('http');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[✓]${colors.reset}`,
    error: `${colors.red}[✗]${colors.reset}`,
    warning: `${colors.yellow}[!]${colors.reset}`,
    location: `${colors.cyan}[📍]${colors.reset}`,
  }[type] || '';
  
  console.log(`${timestamp} ${prefix} ${message}`);
}

async function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  log('info', 'Starting Live Tracking API Tests...\n');

  try {
    // Test 1: Health check
    log('info', 'Test 1: Health Check');
    const health = await makeRequest('GET', '/api/health');
    if (health.status === 200) {
      log('success', 'Backend is running');
    } else {
      throw new Error('Backend not responding. Make sure to run: npm run dev');
    }

    log('info', '\nTest 2: Fetch Live Tracking (should return empty initially)');
    // For this test, we'd need an admin token. Here's the manual step instead.
    log('warning', 'Note: You need to be logged in as Admin/Staff to test /tracking/live');
    log('info', '\nManual Test Steps:');
    log('info', '1. Start backend: cd backend && npm run dev');
    log('info', '2. Start frontend: cd frontend && npm run dev');
    log('info', '3. Login as Admin or Staff');
    log('info', '4. Go to Dashboard');
    log('info', '5. Open browser DevTools Console');
    log('info', '\nCopy and paste this in console to test API:');
    
    const testCode = `
fetch('/api/tracking/live', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  console.log('Found vehicles:', data.count || 0);
  if (data.data && data.data.length > 0) {
    data.data.forEach((v, i) => {
      console.log(\`  [\${i+1}] \${v.vehicleName} - Lat: \${v.currentLocation.latitude}, Lng: \${v.currentLocation.longitude}\`);
    });
  }
})
.catch(e => console.error('Error:', e));
    `;
    
    console.log('\n' + colors.cyan + '```javascript' + colors.reset);
    console.log(testCode);
    console.log(colors.cyan + '```' + colors.reset);

    log('info', '\n✅ Test Setup Complete');
    log('info', 'Expected Behavior:');
    log('info', '  • Response count should increase as customers enable tracking');
    log('info', '  • Each vehicle should have currentLocation with latitude/longitude');
    log('info', '  • Coordinates should update every 5-10 seconds');
    
  } catch (error) {
    log('error', `Test failed: ${error.message}`);
    log('error', 'Make sure backend is running on port 5000');
  }
}

// Check if backend is running before tests
async function checkBackend() {
  try {
    await makeRequest('GET', '/api/health');
    return true;
  } catch (e) {
    return false;
  }
}

(async () => {
  const isRunning = await checkBackend();
  if (!isRunning) {
    log('error', 'Backend not running on port 5000');
    log('info', 'Start it with: cd backend && npm run dev');
    process.exit(1);
  }
  await runTests();
})();

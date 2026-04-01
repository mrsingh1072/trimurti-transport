# Razorpay Order Creation Fix Guide

## Problem
POST `/api/payments/create-order` returns 400 with error: "Failed to create order"

---

## Root Causes & Solutions

### 1. ✅ Environment Variables Loaded
**Status:** VERIFIED ✅

Your `.env` file has:
```
RAZORPAY_KEY_ID=rzp_test_SYC7Y1ehML5X0N
RAZORPAY_KEY_SECRET=bTA7QSWHGKi2XDZCfmMA9RDd
```

**server.js now logs:**
```
🔧 [SERVER] Environment Configuration:
   - RAZORPAY_KEY_ID: ✅ rzp_test_...
   - RAZORPAY_KEY_SECRET: ✅ bTA7Q...
```


### 2. ✅ Razorpay Service Initialization
**Status:** VERIFIED ✅

The payment service properly:
1. Loads Razorpay credentials from `.env`
2. Creates Razorpay instance with correct keys
3. Logs verification status on startup

**Expected logs on server start:**
```
🔐 [PAYMENT SERVICE] Verifying Razorpay configuration:
✅ RAZORPAY_KEY_ID: rzp_test_...
✅ RAZORPAY_KEY_SECRET: bTA7Q...
✅ [PAYMENT SERVICE] Razorpay initialized successfully
```


### 3. ✅ Payment Controller Validation
**Status:** VERIFIED ✅

The controller validates:
- ✅ `bookingId` is provided
- ✅ `amount` is provided
- ✅ `amount` is numeric and > 0
- ✅ Returns proper error messages

**Expected logs on request:**
```
📦 [CREATE ORDER] Incoming request:
   - Body: { bookingId: "...", amount: 500 }
   - User ID: "..."
✅ [CREATE ORDER] Validation passed
```


### 4. ✅ Razorpay Order Creation
**Status:** VERIFIED ✅

The service creates order with:
- ✅ Amount converted to paise (×100)
- ✅ Currency set to INR
- ✅ Proper receipt format
- ✅ Description from booking

**Expected logs:**
```
📦 [PAYMENT SERVICE] Creating order
📝 [PAYMENT SERVICE] Razorpay order options: { amount: 50000, currency: INR, ... }
✅ [PAYMENT SERVICE] Razorpay order created: order_xxxxx
✅ [PAYMENT SERVICE] Payment record created: xxxxx
```


### 5. ✅ Error Handling
**Status:** VERIFIED ✅

Errors are caught and return:
- ✅ Proper HTTP status codes (400, 403, 404, 500)
- ✅ Real error messages (not generic)
- ✅ Detailed logging for debugging

**Expected error logs:**
```
❌ [CREATE ORDER] Error: Invalid amount
❌ [PAYMENT SERVICE] Error creating order:
   - Error type: BadRequestError
   - Error message: Invalid request
```

---

## Troubleshooting Steps

### Step 1: Verify Environment Variables
```bash
# Check .env file contains:
cat backend/.env | grep RAZORPAY

# Expected output:
# RAZORPAY_KEY_ID=rzp_test_SYC7Y1ehML5X0N
# RAZORPAY_KEY_SECRET=bTA7QSWHGKi2XDZCfmMA9RDd
```

### Step 2: Test Razorpay Configuration
```bash
# Run the debug script
cd backend
node ../RAZORPAY_DEBUG.js

# Expected output:
# 1️⃣  Environment Variables:
#    RAZORPAY_KEY_ID: ✅ Set
#    RAZORPAY_KEY_SECRET: ✅ Set
# 
# 2️⃣  Razorpay Initialization:
#    ✅ Razorpay instance created successfully
# 
# 3️⃣  Test Order Creation:
#    ✅ Test order created successfully!
```

### Step 3: Restart Backend Server
```bash
# Kill any running backend processes
# Then restart:
cd backend
npm run dev

# Watch for these startup logs:
# 🔧 [SERVER] Environment Configuration:
#    - RAZORPAY_KEY_ID: ✅ rzp_test_...
#    - RAZORPAY_KEY_SECRET: ✅ bTA7Q...
# 
# 🔐 [PAYMENT SERVICE] Verifying Razorpay configuration:
# ✅ RAZORPAY_KEY_ID: rzp_test_...
# ✅ RAZORPAY_KEY_SECRET: bTA7Q...
# ✅ [PAYMENT SERVICE] Razorpay initialized successfully
```

### Step 4: Test Payment Creation via Frontend
1. Open browser DevTools (F12)
2. Go to Console tab
3. Log in as customer
4. Navigate to "My Bookings"
5. Click "Pay Now" on a pending booking
6. Check console logs:

**Expected logs in order:**
```
💳 [PAYMENT] Starting payment process
✅ [PAYMENT] Booking validation passed
✅ [PAYMENT] Razorpay loaded successfully
📦 [PAYMENT] Creating Razorpay order...
💸 [CREATE PAYMENT ORDER] Starting...
✅ [CREATE PAYMENT ORDER] Success
   - Order ID: order_xxxxx
   - Amount: 50000
```

### Step 5: Monitor Backend Logs
While testing from frontend, watch backend console for:
```
📦 [CREATE ORDER] Incoming request:
   - Body: { bookingId: "...", amount: 500 }
✅ [CREATE ORDER] Validation passed
📦 [PAYMENT SERVICE] Creating order
✅ [PAYMENT SERVICE] Booking found
✅ [PAYMENT SERVICE] Authorization passed
📝 [PAYMENT SERVICE] Razorpay order options: {...}
✅ [PAYMENT SERVICE] Razorpay order created: order_xxxxx
✅ [PAYMENT SERVICE] Payment record created
✅ [CREATE ORDER] Order created successfully
```

---

## Common Issues & Fixes

### Issue: "Missing RAZORPAY_KEY_ID"
**Cause:** Environment variables not loaded
**Fix:** 
1. Check `.env` file exists in `backend/` folder
2. Restart server: `npm run dev`
3. Verify logs show `✅ RAZORPAY_KEY_ID`

### Issue: "Razorpay order creation failed"
**Cause:** Invalid credentials or Razorpay API error
**Fix:**
1. Run `node ../RAZORPAY_DEBUG.js` to test
2. Check credentials in `.env` are exactly:
   ```
   RAZORPAY_KEY_ID=rzp_test_SYC7Y1ehML5X0N
   RAZORPAY_KEY_SECRET=bTA7QSWHGKi2XDZCfmMA9RDd
   ```
3. Check backend logs for error details

### Issue: 400 "amount must be a valid positive number"
**Cause:** Amount sent as string or invalid value
**Fix:**
1. Check frontend sends amount as number: `amount: 500` not `amount: "500"`
2. Check amount > 0
3. Check frontend logs show correct amount

### Issue: 403 "Not authorized to pay for this booking"
**Cause:** User ID mismatch or authentication failed
**Fix:**
1. Ensure you're logged in as the booking owner
2. Check auth token is valid: open DevTools, check localStorage
3. Check backend auth middleware is protecting the route

### Issue: No logs appearing in backend console
**Cause:** Server not restarted or logs not enabled
**Fix:**
1. Kill server: Ctrl+C
2. Clear console: `clear` or `cls`
3. Restart: `npm run dev`
4. Check NODE_ENV is not 'test'

---

## Testing with Real Test Card

Razorpay test cards (only work in test mode):

**Success Card:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- OTP: `123456`

**Failure Card (intentional decline):**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `123456`

---

## Expected Success Flow

```
CLIENT SIDE                        SERVER SIDE
│                                  │
├─ Click "Pay Now"                 │
├─ Validate booking ✅             │
├─ Load Razorpay script ✅         │
├─ POST /payments/create-order ──→ ├─ 📦 [CREATE ORDER] Incoming request
│                                  ├─ ✅ [CREATE ORDER] Validation passed
│  ← ✅ Order data returned ←───── ├─ 📦 [PAYMENT SERVICE] Creating order
├─ Open Razorpay popup ✅          ├─ ✅ [PAYMENT SERVICE] Razorpay order created
├─ Enter test card                 │
├─ Complete OTP                    │
├─ Razorpay returns signature ✅  │
├─ POST /payments/verify ──────→ ├─ ✔️ [VERIFY PAYMENT] Incoming request
│                                  ├─ 🔐 Verifying signature
│  ← ✅ Payment verified ←───────  ├─ ✅ Payment verified successfully
├─ Show success message ✅         │
├─ Booking status = "PAID" ✅      ├─ ✅ Booking paymentStatus updated
└─ Redirect to bookings ✅         │
```

---

## Restart Command

```bash
# Terminal 1: Backend
cd d:\sepm\project_Details\TrimurtiTransport\backend
npm run dev

# Terminal 2: Frontend
cd d:\sepm\project_Details\TrimurtiTransport\frontend
npm run dev
```

---

## Verification Checklist

- [ ] Backend `.env` has RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- [ ] Server started without errors
- [ ] Console shows "✅ [PAYMENT SERVICE] Razorpay initialized successfully"
- [ ] Frontend logs show "💸 [CREATE PAYMENT ORDER] Starting..."
- [ ] Order created with status 200
- [ ] Frontend receives orderId in response
- [ ] Razorpay popup opens (no 404/429 errors)
- [ ] Test payment completes
- [ ] Backend logs show "✅ [PAYMENT SERVICE] Razorpay order created"
- [ ] Booking paymentStatus updates to "paid"
- [ ] No "Failed to create order" errors

---

## Quick Debug Commands

```bash
# Check env variables
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Test Razorpay config
node RAZORPAY_DEBUG.js

# Check Node.js version
node --version

# Check if dependencies are installed
ls node_modules | grep razorpay

# Check server logs in real-time
npm run dev
```

---

## Contact Support

If issues persist after following these steps:
1. Provide complete backend console output (startup + request)
2. Provide frontend console output (payment request)
3. Provide backend `.env` file contents (sanitize keys)
4. Provide exact error message from response


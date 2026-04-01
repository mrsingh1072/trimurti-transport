# Razorpay 400 "Failed to create order" - Debugging Guide

## Status
❌ **Issue Identified:** POST `/api/payments/create-order` returns 400

✅ **Razorpay Verified:** Credentials are valid and Razorpay API is working

✅ **Code Enhanced:** Detailed logging added to identify exact failure point

---

## What We Know

### Frontend (Working ✅)
- Request payload is correct: `{"bookingId":"69ccf0d1088226a68e77e188","amount":500}`
- Auth token is being sent correctly (length: 219)
- Network request reaches backend

### Backend (Needs Investigation 🔍)
- Request reaches controller
- BUT: Something fails and returns 400
- Error message: "Failed to create order"

### Razorpay (Working ✅)
- Test confirmed: Can create orders successfully
- Credentials valid
- API responsive

---

## How to Diagnose

### Step 1: Restart Backend with New Logging

```bash
cd backend
npm run dev
```

**Watch for these startup logs:**
```
🔐 [PAYMENT SERVICE] Verifying Razorpay configuration:
✅ RAZORPAY_KEY_ID: rzp_test_...
✅ RAZORPAY_KEY_SECRET: bTA7...
✅ [PAYMENT SERVICE] Razorpay initialized successfully
```

### Step 2: Trigger Payment Request

1. Open browser DevTools (F12 → Console)
2. Log in as customer
3. Go to "My Bookings"
4. Click "Pay Now"

### Step 3: Read Backend Logs

**You should see one of these sequences:**

#### ✅ Success Path
```
📦 [CREATE ORDER] Incoming request:
   - Body: { bookingId: "...", amount: 500 }
   - User ID: "..."
✅ [CREATE ORDER] Validation passed
   - bookingId: ...
   - amount: 500

📦 [PAYMENT SERVICE] Creating order
🔎 [PAYMENT SERVICE] Looking up booking...
✅ [PAYMENT SERVICE] Database query successful
✅ [PAYMENT SERVICE] Booking found successfully
🔐 [PAYMENT SERVICE] Authorization Check
   - Booking user ID: "..."
   - Current user ID: "..."
   - IDs match: true
✅ [PAYMENT SERVICE] Authorization passed

💳 [PAYMENT SERVICE] Preparing Razorpay order...
📝 [PAYMENT SERVICE] Order options...
🚀 [PAYMENT SERVICE] Calling Razorpay API...
✅ [PAYMENT SERVICE] Razorpay API call successful

💾 [PAYMENT SERVICE] Creating payment record in database...
✅ [PAYMENT SERVICE] Payment record created successfully

✅ [CREATE ORDER] Order created successfully
```

---

#### ❌ Failure Path 1: Booking Not Found
```
🔎 [PAYMENT SERVICE] Looking up booking...
✅ [PAYMENT SERVICE] Database query successful
❌ [PAYMENT SERVICE] Booking not found (null result)
   - Booking ID searched: "69ccf0d1088226a68e77e188"

❌ [PAYMENT SERVICE] Error creating order:
   - Error message: Booking not found
   - Status code: 404
```

**Fix:** The booking ID in the request doesn't exist in MongoDB

---

#### ❌ Failure Path 2: Authorization Failed
```
✅ [PAYMENT SERVICE] Booking found successfully
🔐 [PAYMENT SERVICE] Authorization Check
   - Booking user ID: "507f1f77bcf86cd799439010"
   - Current user ID: "507f1f77bcf86cd799439011"
   - IDs match: false

❌ [PAYMENT SERVICE] Authorization failed - user does not own this booking

❌ [PAYMENT SERVICE] Error creating order:
   - Error message: Not authorized to pay for this booking
   - Status code: 403
```

**Fix:** You're logged in as a different user than the one who made the booking

---

#### ❌ Failure Path 3: Invalid Amount
```
...
❌ [PAYMENT SERVICE] Invalid amount: -5

❌ [PAYMENT SERVICE] Error creating order:
   - Error message: Invalid amount: must be a positive number
   - Status code: 400
```

**Fix:** Frontend is sending invalid amount (negative, zero, or NaN)

---

#### ❌ Failure Path 4: Razorpay API Error
```
🚀 [PAYMENT SERVICE] Calling Razorpay API...
❌ [PAYMENT SERVICE] Razorpay API error:
   - Error message: ...
   - Razorpay code: ...
   - Razorpay description: ...

❌ [PAYMENT SERVICE] Error creating order:
   - Error type: ...
   - Full error: { ... }
```

**Fix:** Razorpay API returned an error (check error code)

---

#### ❌ Failure Path 5: Database Error
```
💾 [PAYMENT SERVICE] Creating payment record in database...
❌ [PAYMENT SERVICE] Database error creating payment record:
   - Error: ...

❌ [PAYMENT SERVICE] Error creating order:
   - Error message: ...
```

**Fix:** MongoDB error (connection issue, validation error, etc.)

---

## Common Issues & Fixes

| Error | Logs Will Show | Fix |
|-------|---|---|
| Booking not found | "Booking not found (null result)" | Create a booking, get correct ID |
| Wrong user | "IDs match: false" | Log in as the booking owner |
| Invalid amount | "Invalid amount" | Check frontend is sending number > 0 |
| Authorization bug | "User ID: undefined" | Check authentication middleware |
| Database down | "Database query unsuccessful" | Verify MongoDB connection |
| Razorpay down | "Razorpay API error" | Check Razorpay status page |

---

## Testing with Backend Test Script

Run this to test without frontend:

```bash
cd backend
node test-payment-flow.js
```

This will:
1. ✅ Connect to MongoDB
2. ✅ Find a real booking
3. ✅ Test Razorpay order creation
4. ✅ Test payment service

Expected output:
```
✅ Found booking: ...
✅ Razorpay order created: order_...
✅ Payment order created successfully
✅ [SUCCESS] All tests passed!
```

---

## Logs to Monitor

###  Browser Console (Frontend)
```
💸 [CREATE PAYMENT ORDER] Starting...
❌ [CREATE PAYMENT ORDER] Error: { status: 400, message: "..." }
```

### Terminal Console (Backend)
```
📦 [CREATE ORDER] Incoming request
✅/❌ [PAYMENT SERVICE] Creating order
```

---

## Next Actions

1. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Trigger Payment Request** from frontend

3. **Look for these specific patterns in logs:**
   - Where does the ✅ stop and ❌ start?
   - What is the actual error message?
   - What status code is returned?

4. **Report back with:**
   - Full backend error logs (from 📦 to ❌)
   - Frontend console error message
   - Which path it took (booking not found? auth failed? etc.)

---

## Quick Debug Commands

```bash
# Run backend test
cd backend
node test-payment-flow.js

# Test Razorpay directly
node test-razorpay.js

# Check environment variables
grep RAZORPAY .env

# Watch backend logs real-time
npm run dev
```

---

## Expected 200 Success Response

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_SYCiByjVXcKySd",
    "paymentId": "69ccf0d1088226a68e77e189",
    "amount": 50000,
    "currency": "INR",
    "key": "rzp_test_SYC7Y1ehML5X0N"
  }
}
```

---

## What to Provide When Reporting

If it still fails, provide:

1. **Full backend logs** from console (copy all from 📦 to End)
2. **Frontend error message** from browser console
3. **Screenshot of browser Network tab** showing response
4. **Booking details** (is it your booking? does it have a vehicle?)
5. **Account type** (are you logged in as customer?)


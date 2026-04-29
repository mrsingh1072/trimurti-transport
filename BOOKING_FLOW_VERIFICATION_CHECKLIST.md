# 🧪 BOOKING FLOW VERIFICATION CHECKLIST

**Test Date:** April 22, 2026  
**Tester:** [Your Name]  
**Environment:** Development/Staging  

---

## ✅ PRE-TEST SETUP

### Browser & Environment
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Close all browser tabs
- [ ] Open DevTools (F12) → Console tab
- [ ] Set DevTools to "Error" and "Warning" filters
- [ ] Fresh browser session with no auth state
- [ ] Backend server running and healthy
- [ ] Frontend running with `npm run dev`

### Account Setup
- [ ] Logged in as test user (with money in test Razorpay account)
- [ ] At least one vehicle available in system
- [ ] At least one active coupon available
- [ ] Test coupon amount is valid for booking amount

---

## 🧑‍🚀 TEST SCENARIO 1: Basic Booking Flow (NO COUPON)

### Step 1: Navigate to Vehicle Listing
- [ ] Open Customer Vehicles page
- [ ] Verify vehicles are loaded
- [ ] **Console:** No errors should appear

### Step 2: Click "Book Now"
- [ ] BookingModal opens
- [ ] Vehicle details are displayed
- [ ] **Expected:** `vehicleName` displays correctly
- [ ] **Console Check:** No `Cannot read properties of undefined` errors
- [ ] **Expected:** Current step shows "booking"

### Step 3: Select Dates and Duration
- [ ] Pick a future date (today + 5 days)
- [ ] Select time (e.g., 10:00 AM)
- [ ] Select duration (e.g., 2 days or 48 hours)
- [ ] **Expected:** Price calculation updates
- [ ] **Expected:** "Original Amount" shows calculated price

### Step 4: Validate Booking Details
- [ ] Verify displayed price is correct
- [ ] Verify dates are in future
- [ ] **Console:** No calculation errors

### Step 5: Click "Next: Discounts"
- [ ] **CRITICAL CHECK:** Look at Network tab (F12 → Network)
  - [ ] ❌ Should NOT see POST /api/bookings call
  - [ ] ❌ Should NOT see POST /api/bookings/{id}/apply-discount call
- [ ] **Console Messages:**
  ```
  📍 Current step: booking
  ✅ Validation passed. Moving to discount step...
  ```
- [ ] Modal moves to discount step
- [ ] Current step shows "discount"

### Step 6: View Available Coupons
- [ ] **Expected:** "Available Offers" button or section visible
- [ ] Click on coupon list (if button exists)
- [ ] **Expected:** List of available coupons displays
- [ ] **Each coupon should show:**
  - [ ] Coupon code
  - [ ] Discount amount or percentage
  - [ ] "Save ₹X" text

### Step 7: Skip Coupon (Don't Apply)
- [ ] Click "Proceed to Pay" without selecting coupon
- [ ] **Console Messages:**
  ```
  🔄 Proceeding to payment...
  ⚠️  NOTE: Booking will be created AFTER payment verification
  📋 Booking Details (NOT YET CREATED):
     - Vehicle: [Vehicle Name]
     - Pickup: [Date/Time]
     - Base Price: ₹[Amount]
  ✅ Ready for payment. Opening payment modal...
  ```
- [ ] **Network Tab Check:** No POST /api/bookings call yet
- [ ] PaymentCheckoutModal opens
- [ ] Shows booking details with no discount applied

### Step 8: Verify Payment Modal Content
- [ ] **Display Check:**
  - [ ] Vehicle name shown
  - [ ] Pickup date/time shown
  - [ ] Dropoff date/time shown
  - [ ] Base price shown (without discount)
  - [ ] "Pay Now" button visible
- [ ] **Amount Check:**
  - [ ] Amount shown matches booking details
  - [ ] No negative or strange amounts

### Step 9: Click "Pay Now"
- [ ] **Console Messages (CRITICAL):**
  ```
  📝 [PAYMENT] Creating booking first (new booking flow)...
  ✅ [PAYMENT] Booking created: {BookingID}
  📦 [PAYMENT] Creating Razorpay order...
  ✅ [PAYMENT] Order created successfully
     - Order ID: [ID]
     - Amount: [Amount]
     - Currency: INR
     - Key: [Partial Key]
  ⚙️  [PAYMENT] Preparing Razorpay checkout options...
  ```
- [ ] **Network Tab:** 
  - [ ] ✅ Should see POST /api/bookings (creating booking)
  - [ ] ✅ Should see POST /api/payments/create-order (creating Razorpay order)
- [ ] **CRITICAL:** Verify booking._id exists before Razorpay opens
  - [ ] Copy bookingId from console
  - [ ] Will use to verify in MongoDB later

### Step 10: Open Razorpay Modal
- [ ] Razorpay payment modal opens (white modal)
- [ ] Shows correct amount
- [ ] No console errors about Razorpay script

### Step 11: Verify Test Card Works
- [ ] Use test card: `4111111111111111`
- [ ] Expiry: Any future date (e.g., `12/25`)
- [ ] CVV: Any 3 digits (e.g., `100`)
- [ ] Name: Any text
- [ ] Email: Any email

### Step 12: Complete Payment
- [ ] Click "Pay" button
- [ ] Modal closes
- [ ] **Console Messages:**
  ```
  ✔️ [PAYMENT] Razorpay payment completed
     - Payment ID: [ID]
     - Signature: [Partial]
  🔐 [PAYMENT] Verifying payment signature...
  ✅ [PAYMENT] Signature verified successfully
  ✅ Discount applied successfully (if coupon used)
  ```
- [ ] Success modal opens showing:
  - [ ] ✅ "Payment Successful" or similar
  - [ ] Transaction ID displayed
  - [ ] "Back to Vehicles" button

### Step 13: Verify Booking Created
- [ ] Click "Back to Vehicles"
- [ ] Navigate to "My Bookings" page
- [ ] **Expected:** New booking should appear in list
- [ ] **Booking Details Check:**
  - [ ] Vehicle name matches
  - [ ] Dates match
  - [ ] Amount matches (without discount)
  - [ ] Status shows "Confirmed" or "Active"

### Step 14: Database Verification
- [ ] MongoDB → TrimurtiTransport → bookings collection
- [ ] Find the booking by ID (from console earlier)
- [ ] **Verify fields:**
  - [ ] `_id`: ObjectId (exists)
  - [ ] `vehicle`: Should have `_id`, `name`, `model`
  - [ ] `startDate`: Future date
  - [ ] `endDate`: After startDate
  - [ ] `basePrice`: Number > 0
  - [ ] `status`: "confirmed"
  - [ ] `discountCode`: null or "AUTO_APPLIED"
  - [ ] `discountAmount`: 0

---

## 🎟️ TEST SCENARIO 2: With Coupon Application

### Prerequisite
- [ ] At least one active coupon in system
- [ ] Coupon is valid for amount range we'll use

### Steps 1-5 (Same as Scenario 1)
- [ ] Complete steps 1-5 from above

### Step 6: Apply Coupon
- [ ] See "Available Offers" button/section
- [ ] Click to expand offers
- [ ] Click on a coupon code
- [ ] **Expected Console Messages:**
  ```
  🎟️  Coupon applied: [CODE]
  💰 Discount: ₹[Amount]
  💸 Savings: ₹[Amount]
  ✅ New Total: ₹[Amount]
  ```
- [ ] Modal updates to show:
  - [ ] Original Amount: ₹X
  - [ ] Discount (-₹Y)
  - [ ] Final Amount: ₹Z (where Z = X - Y)
- [ ] "Remove Coupon" or similar option appears

### Step 7: Proceed to Payment
- [ ] Click "Proceed to Pay"
- [ ] **Critical:** Look at Network tab
  - [ ] ❌ Should NOT see POST /api/bookings/{id}/apply-discount yet
  - [ ] (Discount applied after payment verification!)
- [ ] PaymentCheckoutModal opens
- [ ] **Display Check:**
  - [ ] Original Amount: ₹X shown
  - [ ] Discount: ₹Y shown
  - [ ] Final Amount: ₹Z shown
  - [ ] Coupon code displayed

### Step 8: Click "Pay Now" and Complete Payment
- [ ] Follow same steps as Scenario 1, Step 9-12
- [ ] **CRITICAL Console Check:**
  ```
  📍 Applying discount to booking...
  ✅ Discount applied successfully
  ```
- [ ] This appears AFTER payment verification

### Step 9: Verify in "My Bookings"
- [ ] New booking should appear
- [ ] **Display Check:**
  - [ ] Shows coupon code applied
  - [ ] Shows final amount (with discount)
  - [ ] "Savings: ₹Y" or similar

### Step 10: Database Verification
- [ ] MongoDB → booking document
- [ ] **Verify fields:**
  - [ ] `discountCode`: "COUPON_CODE" (matches applied)
  - [ ] `discountAmount`: ₹[Amount]
  - [ ] `finalPrice`: ₹[Amount] (basePrice - discount)

---

## ⚠️ TEST SCENARIO 3: Error Handling

### Test 3A: Invalid Coupon Code
- [ ] Open BookingModal
- [ ] Complete steps 1-5
- [ ] Try to manually enter invalid coupon code: `INVALID123`
- [ ] Click apply/proceed
- [ ] **Expected:**
  - [ ] Error message displays
  - [ ] Console shows error (no crash)
  - [ ] Can retry with valid coupon

### Test 3B: Payment Cancellation
- [ ] Complete steps 1-8 from Scenario 2
- [ ] Razorpay modal opens
- [ ] Click close (X) or cancel button
- [ ] **Expected:**
  - [ ] Back to PaymentCheckoutModal
  - [ ] Can try payment again
  - [ ] Booking exists but unpaid

### Test 3C: Invalid Dates
- [ ] Open BookingModal
- [ ] Try to pick a past date
- [ ] **Expected:** 
  - [ ] Date picker prevents selection
  - [ ] Error message shows
  - [ ] Can't proceed

### Test 3D: Overlapping Dates
- [ ] Book a vehicle for dates: Jan 1-5
- [ ] Complete payment
- [ ] Try to book same vehicle for dates: Jan 3-8
- [ ] **Expected:**
  - [ ] Error: "Vehicle not available for selected dates"
  - [ ] Can't proceed
  - [ ] No accidental double-booking

### Test 3E: Zero Amount Booking
- [ ] Try to book for 0 hours
- [ ] **Expected:**
  - [ ] Validation error
  - [ ] Can't proceed
  - [ ] "Please select valid duration" message

---

## 🔒 TEST SCENARIO 4: Security & Edge Cases

### Test 4A: Multiple Simultaneous Payments
- [ ] Open BookingModal for Vehicle A
- [ ] Proceed to PaymentCheckoutModal
- [ ] **While payment is processing:**
  - [ ] DON'T click "Pay Now" yet
  - [ ] Open another BookingModal for Vehicle B
  - [ ] Proceed to its payment modal
  - [ ] **Expected:** Both modals work independently
  - [ ] Complete payment on first one
  - [ ] **Expected:** Only Vehicle A booked

### Test 4B: Payment Without Authorization
- [ ] Logout
- [ ] Try to access past payment modal URL (if bookmarkable)
- [ ] **Expected:** Redirect to login

### Test 4C: Very Large Booking Amount
- [ ] Try to book expensive vehicle for long period
- [ ] Proceed to payment
- [ ] Amount should be correct (no integer overflow)
- [ ] Payment should work normally

### Test 4D: Coupon Applied, Then Changed
- [ ] Select coupon (get 50% discount)
- [ ] Click "Proceed to Pay"
- [ ] See 50% discount in final total
- [ ] Go back to modify dates
- [ ] Booking amount changes
- [ ] **Expected:**
  - [ ] Coupon still applies (or shows invalid)
  - [ ] New calculation is correct

---

## 📊 CONSOLE ERROR CHECKLIST

### Errors That Should NOT Appear:
- [ ] ❌ "Cannot read properties of undefined"
- [ ] ❌ "Cannot read property '_id' of undefined"
- [ ] ❌ "Cannot read property 'vehicle' of null"
- [ ] ❌ "Uncaught TypeError" (any)
- [ ] ❌ "HTTP 400" on /api/bookings
- [ ] ❌ "HTTP 500" errors
- [ ] ❌ Razorpay script loading errors
- [ ] ❌ "CORS" errors

### Warnings That Are OK:
- [ ] ✅ "React does not recognize ... prop" (for custom props)
- [ ] ✅ "Missing dependency in useEffect" (if intentional)
- [ ] ✅ "Inline event listener" warnings

### Network Errors to Catch:
- [ ] ❌ Failed requests to API endpoints
- [ ] ❌ 401 Unauthorized (token not sent)
- [ ] ❌ 403 Forbidden (permission issues)
- [ ] ❌ 500 Server errors

---

## 📝 TESTING LOG TEMPLATE

```
Date: _______________
Tester: _______________
Environment: Dev / Staging / Production

Scenario 1 (Basic Flow):
Status: ☐ PASS ☐ FAIL
Issues: _______________

Scenario 2 (With Coupon):
Status: ☐ PASS ☐ FAIL
Issues: _______________

Scenario 3 (Error Handling):
Status: ☐ PASS ☐ FAIL
Issues: _______________

Scenario 4 (Security):
Status: ☐ PASS ☐ FAIL
Issues: _______________

Console Errors Found:
☐ None ☐ Minor ☐ Critical
List: _______________

Overall Status: ☐ READY FOR PRODUCTION ☐ NEEDS FIXES

Sign-off: _______________
```

---

## 🚀 QUICK REFERENCE

### Key Network Calls (Should See in Network Tab)

**❌ Should NOT See:**
- `POST /api/bookings` until "Pay Now" is clicked

**✅ Should See (in order):**
1. `GET /api/coupons/active` - Loading available offers
2. `GET /api/coupons/best` - Best coupon for amount
3. `POST /api/bookings` - After clicking "Pay Now"
4. `POST /api/payments/create-order` - Creating Razorpay order
5. `POST /api/payments/verify` - After Razorpay payment
6. `POST /api/bookings/{id}/apply-discount` - Applying discount
7. `GET /api/bookings?status=confirmed` - Loading My Bookings

### Key Console Messages (In Order)

```
1. "Loading available offers..." (Optional)
2. "📍 Current step: booking"
3. "✅ Validation passed. Moving to discount step..."
4. "🔄 Proceeding to payment..."
5. "⚠️  NOTE: Booking will be created AFTER payment verification"
6. "✅ Ready for payment. Opening payment modal..."
7. "📝 [PAYMENT] Creating booking first..."
8. "✅ [PAYMENT] Booking created: {ID}"
9. "📦 [PAYMENT] Creating Razorpay order..."
10. "✅ [PAYMENT] Order created successfully"
11. "⚙️  [PAYMENT] Preparing Razorpay checkout options..."
12. [User completes payment]
13. "✔️ [PAYMENT] Razorpay payment completed"
14. "🔐 [PAYMENT] Verifying payment signature..."
15. "✅ [PAYMENT] Signature verified successfully"
16. "📍 Applying discount to booking..." (If coupon used)
17. "✅ Discount applied successfully" (If coupon used)
```

---

**Version:** 1.0  
**Last Updated:** April 22, 2026  
**Status:** Ready for Testing

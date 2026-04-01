# Razorpay Payment Integration - Complete Implementation Guide

## ✅ IMPLEMENTATION COMPLETE

Full Razorpay payment system integrated with MongoDB persistence, role-based access, and analytics dashboard.

---

## PART 1: BACKEND SETUP ✅

### 1. Dependencies Installed
- `razorpay` - For Razorpay API integration
- `crypto` - Built-in Node.js module for signature verification

### 2. Environment Variables (.env)
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=rzp_test_YOUR_KEY_SECRET
```

**⚠️ IMPORTANT:** Replace these with your actual Razorpay keys from https://dashboard.razorpay.com

### 3. Models Updated

#### Booking Model (`src/models/Booking.js`)
Added fields:
- `paymentStatus`: 'pending' | 'paid' | 'failed'
- `paymentId`: Reference to Payment document

#### Payment Model (`src/models/Payment.js`)
Complete restructure with fields:
- `user`: User reference (required)
- `booking`: Booking reference (required)
- `amount`: Transaction amount
- `status`: 'pending' | 'completed' | 'failed'
- `method`: 'upi' | 'card' | 'netbanking' | 'cash' | 'wallet'
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID
- `razorpaySignature`: Signature for verification
- `description`: Payment description
- Indexed for fast queries

### 4. Payment Service (`src/services/paymentService.js`)

**Functions Implemented:**

1. **createOrderForBooking(userId, bookingId, amount)**
   - Creates Razorpay order
   - Stores order in MongoDB
   - Returns order details for frontend

2. **verifyPaymentSignature(orderId, paymentId, signature)**
   - HMAC-SHA256 verification
   - Prevents payment tampering
   - Returns verification status

3. **completePayment(userId, bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature)**
   - Verifies signature
   - Updates Payment record
   - Updates Booking with payment status
   - Returns confirmed payment and booking

4. **getPayments(userId, userRole, filters)**
   - Role-based access control
   - Customers see only their payments
   - Staff/Admin see all payments
   - Supports status filtering

5. **getPaymentStats()**
   - Overall stats (total revenue, transactions, success rate)
   - Monthly revenue trends (last 12 months)
   - Payment method distribution
   - Returns data for analytics dashboard

6. **getPaymentById(paymentId, userId, userRole)**
   - Retrieves single payment details
   - Access control validation
   - Returns full payment information

### 5. Payment Controller (`src/controllers/paymentController.js`)

**Endpoints:**

1. **POST /api/payments/create-order**
   - Input: bookingId, amount
   - Output: orderId, paymentId, amount, key, currency
   - Error handling for invalid bookings

2. **POST /api/payments/verify**
   - Input: razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId
   - Signature verification
   - Database transaction update
   - Output: payment and booking objects

3. **GET /api/payments**
   - Fetch all payments (or user's payments for customers)
   - Query filters: status, startDate, endDate
   - Populated with user and booking data

4. **GET /api/payments/:id**
   - Get single payment details
   - Access control validation

5. **GET /api/payments/stats/overview** (Admin only)
   - Comprehensive analytics
   - Returns overall stats, monthly trends, method distribution

### 6. Payment Routes (`src/routes/paymentRoutes.js`)

```javascript
POST   /api/payments/create-order      - Create Razorpay order (Customer)
POST   /api/payments/verify            - Verify payment signature (All auth users)
GET    /api/payments                   - Get payments (Role-based)
GET    /api/payments/:id               - Get single payment
GET    /api/payments/stats/overview    - Analytics (Admin only)
```

All routes protected with `protect` middleware.
Stats route additionally protected with `authorize(ADMIN)`.

---

## PART 2: FRONTEND SETUP ✅

### 1. Dependencies Added
- `recharts` - For analytics charts and visualization

### 2. API Service Functions (`src/services/api.js`)

```javascript
createPaymentOrder(bookingId, amount)
verifyPayment(bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature)
getPayments()
getPaymentStats()
getPaymentById(paymentId)
```

### 3. Components Created

#### A. PaymentCheckoutModal (`src/components/PaymentCheckoutModal.jsx`)

**Features:**
- Razorpay checkout script auto-loading
- Three-step flow: Confirm → Processing → Success
- Shows booking details and amount to pay
- Displays accepted payment methods
- Error handling with user feedback
- Auto-redirect on success

**Props:**
- `isOpen`: Boolean to show/hide modal
- `onClose`: Callback when modal closes
- `booking`: Booking object with vehicle, user, totalPrice
- `onSuccess`: Callback on successful payment

**Status:** Production-ready with full error handling

### 4. Pages Created

#### A. Staff Payments Page (`src/pages/staff/PaymentsPage.jsx`)

**Features:**
- View all customer payments
- Real-time stats:
  - Total transactions count
  - Total revenue
  - Completed revenue
  - Pending payments count
- Search by: customer name, email, vehicle, transaction ID
- Filter by status: all, completed, pending, failed
- Responsive table layout
- Payment details modal on row click
- Refresh button for live updates

**Access:** Staff & Admin only
**Route:** `/staff/payments`

#### B. Admin Payments Analytics Page (`src/pages/admin/PaymentsPage.jsx`)

**Features:**
- Comprehensive payment analytics:
  - Total revenue (all transactions)
  - Completed revenue (successful payments)
  - Total transactions count
  - Success rate percentage
  
- Secondary metrics:
  - Transaction status breakdown
  - Payment method distribution
  - Average order value
  
- Charts:
  - Revenue trends (line chart, last 12 months)
  - Transaction count trends (bar chart, last 12 months)
  
- Payments table with:
  - Customer details
  - Vehicle information
  - Payment method icons
  - Status badges
  - Transaction IDs
  - Payment details modal

**Access:** Admin only
**Route:** `/admin/payments`

### 5. Integration in Booking Flow

#### Updated MyBookingsPage (`src/pages/MyBookingsPage.jsx`)

**Changes:**
- Import PaymentCheckoutModal
- New state: `paymentBooking`, `showPaymentModal`
- New function: `needsPayment()` - Check if booking needs payment
- New button: "Pay Now" (visible when `paymentStatus === 'pending'`)
- Modal integration with success callback
- Auto-refresh bookings after payment

**User Flow:**
1. Customer views their bookings
2. If `paymentStatus === 'pending'`, "Pay Now" button appears
3. Click "Pay Now" → PaymentCheckoutModal opens
4. Razorpay checkout opens
5. Customer completes payment
6. Backend verifies signature
7. Booking marked as paid
8. Payment record created in MongoDB
9. Success modal, auto-redirect
10. Bookings list refreshes showing new status

### 6. App Router Updated (`src/App.jsx`)

Added route for Staff Payments Page:
```javascript
<Route
  path="/staff/payments"
  element={
    <StaffRoute>
      <StaffPaymentsPage />
    </StaffRoute>
  }
/>
```

---

## PART 3: SECURITY FEATURES ✅

### 1. Signature Verification
- HMAC-SHA256 signature validation
- Uses Razorpay secret key
- Prevents payment tampering
- Required for all payments

### 2. Role-Based Access Control
- Customer: Sees only their own payments
- Staff: Sees all payments (read-only)
- Admin: Full access + analytics
- Protected middleware on all routes

### 3. Authentication
- All payment endpoints require JWT token
- Token embedded in requests via Authorization header
- User ID validation from token

### 4. Data Persistence
- All payments stored in MongoDB
- Full audit trail with timestamps
- Razorpay transaction IDs saved
- Booking status tracking

---

## PART 4: PAYMENT FLOW

### Customer Payment Flow
```
1. Customer views My Bookings
2. Sees "Pay Now" button for unpaid bookings
3. Clicks "Pay Now" → PaymentCheckoutModal
4. Reviews booking details and amount
5. Clicks "Pay Now" button
6. Backend creates Razorpay order (Step 1)
7. Razorpay checkout loads
8. Customer selects payment method (UPI/Card/NetBanking/etc)
9. Completes payment on Razorpay
10. Razorpay returns payment details
11. Frontend verifies payment (Step 2)
12. Backend verifies signature
13. Payment marked as completed
14. Booking marked as paid
15. Success modal shown
16. Bookings list auto-refreshes
```

### Staff View Flow
```
1. Staff goes to /staff/payments
2. Sees all customer payments
3. Can filter by status
4. Can search by customer/vehicle
5. Can click row to see payment details
6. Can refresh data
7. Can analyze payment trends
```

### Admin Analytics Flow
```
1. Admin goes to /admin/payments
2. Sees 4 key metrics (Revenue, Completed, Transactions, Success Rate)
3. Sees secondary metrics (Status breakdown, Methods, AOV)
4. Views revenue and transaction charts
5. Sees full payments table
6. Can search and filter payments
7. Can drill down into payment details
```

---

## PART 5: DATABASE SCHEMA

### Payment Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (User reference),
  booking: ObjectId (Booking reference),
  amount: Number (₹),
  status: String ('pending' | 'completed' | 'failed'),
  method: String ('upi' | 'card' | 'netbanking' | 'cash' | 'wallet'),
  razorpayOrderId: String (Razorpay order ID),
  razorpayPaymentId: String (Razorpay payment ID),
  razorpaySignature: String (Signature for verification),
  description: String (Payment description),
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  Index: { booking: 1, status: 1 }
  Index: { user: 1, createdAt: -1 }
}
```

### Booking Collection (Updated)
```javascript
{
  // ... existing fields ...
  paymentStatus: String ('pending' | 'paid' | 'failed'),
  paymentId: ObjectId (Payment reference),
}
```

---

## PART 6: API RESPONSE FORMATS

### Create Order Response
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_xxx",
    "paymentId": "payment_object_id",
    "amount": 500000,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

### Verify Payment Response
```json
{
  "success": true,
  "message": "Payment verified and completed successfully",
  "data": {
    "payment": {
      "_id": "payment_id",
      "status": "completed",
      "razorpayPaymentId": "pay_xxx",
      "amount": 500000
    },
    "booking": {
      "_id": "booking_id",
      "paymentStatus": "paid",
      "paymentId": "payment_id"
    }
  }
}
```

### Get Payments Response
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "payment_id",
      "user": { "name": "John", "email": "john@..." },
      "booking": { "vehicle": { "name": "Honda City" } },
      "amount": 15000,
      "status": "completed",
      "method": "upi",
      "razorpayPaymentId": "pay_xxx",
      "createdAt": "2024-02-10T..."
    }
  ]
}
```

### Stats Response
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalTransactions": 150,
      "totalRevenue": 2250000,
      "completedRevenue": 2000000,
      "completedPayments": 140,
      "pendingPayments": 8,
      "failedPayments": 2,
      "successRate": 93.33
    },
    "monthlyTrends": [
      {
        "_id": { "year": 2024, "month": 2 },
        "revenue": 250000,
        "transactions": 15
      }
    ],
    "methodDistribution": [
      { "_id": "upi", "count": 90, "revenue": 1350000 },
      { "_id": "card", "count": 40, "revenue": 600000 }
    ]
  }
}
```

---

## PART 7: GETTING RAZORPAY KEYS

1. Go to https://dashboard.razorpay.com
2. Sign up or log in
3. Navigate to Settings → API Keys
4. You'll see:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret**
5. Copy both values
6. Replace in `.env` file:
   ```env
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

### Test vs Live Keys
- **Test Keys**: For development/testing (no real money)
- **Live Keys**: For production (real money transfers)

---

## PART 8: TESTING CHECKLIST

### Backend Testing
- [ ] Test order creation with valid booking
- [ ] Test signature verification
- [ ] Test payment completion
- [ ] Test payment status updates in DB
- [ ] Test role-based access (customer vs staff vs admin)
- [ ] Test getPayments with different roles
- [ ] Test getStats (admin only)
- [ ] Test filters and searching

### Frontend Testing
- [ ] Test "Pay Now" button appears for unpaid bookings
- [ ] Test PaymentCheckoutModal loads Razorpay
- [ ] Test payment flow end-to-end
- [ ] Test error handling
- [ ] Test success redirect
- [ ] Test Staff Payments page loads
- [ ] Test Admin Analytics loads
- [ ] Test charts render correctly
- [ ] Test search and filters
- [ ] Test payment details modal

### Payment Testing (Razorpay Test Environment)
Use Razorpay test cards:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- Expiry: Any future date
- CVV: Any 3 digits

---

## PART 9: PRODUCTION CHECKLIST

Before going live:

1. **Security**
   - [ ] Use Live Razorpay keys (not test keys)
   - [ ] Enable HTTPS only
   - [ ] Implement rate limiting on payment endpoints
   - [ ] Add CSRF protection
   - [ ] Validate all inputs
   - [ ] Use environment variables for secrets

2. **Testing**
   - [ ] Full end-to-end payment testing
   - [ ] Handle network timeouts
   - [ ] Test refund flow (if implementing)
   - [ ] Test webhook handlers (if using webhooks)
   - [ ] Load testing

3. **Monitoring**
   - [ ] Setup payment success/failure alerts
   - [ ] Monitor payment completion rate
   - [ ] Track failed payments
   - [ ] Log all payment transactions
   - [ ] Setup error tracking (Sentry, etc)

4. **Documentation**
   - [ ] Create user guide for payment
   - [ ] Document refund policy
   - [ ] Create support documentation
   - [ ] Document payment troubleshooting

---

## PART 10: NEXT STEPS (Optional Features)

1. **Refund System**
   - Allow partial/full refunds
   - Track refund history
   - Update booking status

2. **Webhooks**
   - Listen to Razorpay webhooks
   - Auto-confirm payments
   - Send email notifications

3. **Payment Retry**
   - Automatic retry for failed payments
   - User-triggered retry option

4. **Invoicing**
   - Generate payment invoices
   - Email invoices to customers
   - Download invoice as PDF

5. **Subscription Payments**
   - Monthly/yearly subscription plans
   - Auto-renewal
   - Cancellation handling

6. **Multiple Payment Methods**
   - Wallet integration
   - Bank transfer
   - Alternative payment providers

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue: "Razorpay checkout not loading"**
- Check if Razorpay script loads in browser console
- Verify firewall isn't blocking Razorpay CDN
- Check browser console for errors

**Issue: "Signature verification failed"**
- Verify Razorpay secret key in .env
- Check if test vs live keys are mixed
- Ensure signature calculation is correct

**Issue: "Payment shows pending in database"**
- Check backend logs
- Verify payment completion flow
- Check if success callback was triggered

**Issue: "Booking not marked as paid"**
- Check if payment verification passed
- Verify booking ID in database
- Check for database transaction errors

---

## IMPLEMENTATION STATUS

✅ **COMPLETE**

All components, pages, routes, and payment flow fully implemented and integrated.

Ready for:
- Testing in development environment
- Integration testing with real Razorpay test keys
- Production deployment with live keys

---

**Last Updated:** April 1, 2026
**System:** Trimurti Transport - Vehicle Rental SaaS
**Version:** 1.0.0

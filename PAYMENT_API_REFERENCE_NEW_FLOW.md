# Payment API Reference - New Booking Flow
**Quick Reference for Frontend Integration**

---

## 📌 Endpoints Overview

| Endpoint | Method | Flow | Purpose |
|----------|--------|------|---------|
| `/api/payments/create-order` | POST | Both | Create Razorpay order |
| `/api/payments/verify` | POST | Both | Verify payment & create booking |

---

## 🆕 New Booking Flow

### Step 1: Create Order (Without Booking)

**Endpoint**: `POST /api/payments/create-order`

**Request Body**:
```javascript
{
  // NEW BOOKING PARAMETERS
  vehicleId: "123456789abc",
  startDate: "2024-12-20",
  endDate: "2024-12-25",
  durationType: "days",        // "days" or "hours"
  durationValue: 5,            // number of days/hours
  amount: 5000,                // Final amount to pay (in rupees)
  baseAmount: 5500,            // Original price (optional)
  discountAmount: 500,         // Discount applied (optional)
  couponCode: "SUMMER50",      // Coupon code (optional)
  vehicleName: "Fortuner",     // Vehicle name (optional)
  vehicleType: "SUV"           // Vehicle type (optional)
}
```

**Response (Success - 200)**:
```javascript
{
  success: true,
  message: "Order created successfully",
  data: {
    orderId: "order_JxT8Z3DaZ0f5Cc",
    key: "rzp_live_XXXXX",
    amount: 500000,              // in paise
    amountInRupees: 5000,
    currency: "INR",
    receipt: "booking_user_1234567890",
    bookingDetails: {
      vehicleId: "123456789abc",
      startDate: "2024-12-20",
      endDate: "2024-12-25",
      durationType: "days",
      durationValue: 5,
      amount: 5000,
      baseAmount: 5500,
      discountAmount: 500,
      couponCode: "SUMMER50",
      vehicleName: "Fortuner",
      vehicleType: "SUV"
    }
  }
}
```

**Error Responses**:
- ❌ Missing amount: `{ success: false, message: "amount is required" }` (400)
- ❌ Invalid amount: `{ success: false, message: "amount must be a valid positive number" }` (400)
- ❌ Missing fields: `{ success: false, message: "For new bookings, vehicleId, startDate, endDate, durationType, and durationValue are required" }` (400)

---

### Step 2: Open Razorpay Modal

**Frontend Code**:
```javascript
const handlePayment = async () => {
  try {
    // Call backend to create order
    const response = await axios.post('/api/payments/create-order', {
      vehicleId,
      startDate,
      endDate,
      durationType,
      durationValue,
      amount: finalAmount,
      baseAmount: originalAmount,
      discountAmount,
      couponCode
    });

    const { data } = response.data;
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      handler: (razorpayResponse) => {
        handlePaymentSuccess(razorpayResponse, data);
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

---

### Step 3: Verify Payment & Create Booking

**Endpoint**: `POST /api/payments/verify`

**Request Body**:
```javascript
{
  // RAZORPAY VERIFICATION
  razorpayOrderId: "order_JxT8Z3DaZ0f5Cc",
  razorpayPaymentId: "pay_JxT8Z3DaZ0f5Cc",
  razorpaySignature: "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  
  // BOOKING DETAILS (from order response)
  bookingDetails: {
    vehicleId: "123456789abc",
    startDate: "2024-12-20",
    endDate: "2024-12-25",
    durationType: "days",
    durationValue: 5,
    amount: 5000,
    baseAmount: 5500,
    discountAmount: 500,
    couponCode: "SUMMER50",
    vehicleName: "Fortuner",
    vehicleType: "SUV"
  }
}
```

**Response (Success - 200)**:
```javascript
{
  success: true,
  message: "Payment verified and completed successfully",
  data: {
    success: true,
    bookingId: "booking_xyz123",      // ← NEW BOOKING CREATED!
    paymentId: "payment_abc456",
    paymentStatus: "paid",             // ← STATUS = PAID
    booking: {
      _id: "booking_xyz123",
      user: "user_id",
      vehicle: "vehicle_id",
      startDate: "2024-12-20",
      endDate: "2024-12-25",
      status: "CONFIRMED",
      paymentStatus: "paid",           // ← PAYMENT STATUS CONFIRMED
      pricing: {
        baseAmount: 5500,
        discountAmount: 500,
        finalAmount: 5000,
        couponCode: "SUMMER50"
      },
      createdAt: "2024-11-15T10:30:00Z"
    },
    payment: {
      _id: "payment_abc456",
      amount: 5000,
      status: "COMPLETED",
      razorpayPaymentId: "pay_JxT8Z3DaZ0f5Cc",
      razorpayOrderId: "order_JxT8Z3DaZ0f5Cc"
    }
  }
}
```

**Error Responses**:
- ❌ Invalid signature: `{ success: false, message: "Invalid payment signature" }` (400)
- ❌ Vehicle not found: `{ success: false, message: "Vehicle not found" }` (404)
- ❌ Vehicle unavailable: `{ success: false, message: "Vehicle is not available for the selected dates" }` (409)
- ❌ Missing razorpay params: `{ success: false, message: "razorpayOrderId is required" }` (400)
- ❌ Missing booking details: `{ success: false, message: "bookingDetails with vehicleId, startDate, and endDate are required for new bookings" }` (400)

---

### Step 4: Handle Success

**Frontend Code**:
```javascript
const handlePaymentSuccess = async (razorpayResponse, orderData) => {
  try {
    // Verify payment with backend
    const verifyResponse = await axios.post('/api/payments/verify', {
      razorpayOrderId: orderData.orderId,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature,
      bookingDetails: orderData.bookingDetails
    });

    const bookingData = verifyResponse.data.data;
    
    // Update UI with booking details
    setBookingStatus('success');
    setBookingId(bookingData.booking._id);
    
    // Notify parent component
    onPaymentSuccess({
      bookingId: bookingData.bookingId,
      paymentStatus: bookingData.paymentStatus,
      booking: bookingData.booking
    });
    
    // Show success message with booking details
    showSuccessNotification(`Booking confirmed! ID: ${bookingData.bookingId}`);
    
  } catch (error) {
    console.error('Payment verification failed:', error);
    showErrorNotification(error.response?.data?.message || 'Payment verification failed');
  }
};
```

---

## 🔄 Old Booking Flow (Still Supported)

### Step 1: Create Order (With Existing Booking)

**Request Body**:
```javascript
{
  bookingId: "existing_booking_id",
  amount: 5000
}
```

### Step 2: Verify Payment

**Request Body**:
```javascript
{
  bookingId: "existing_booking_id",
  razorpayOrderId: "order_JxT8Z3DaZ0f5Cc",
  razorpayPaymentId: "pay_JxT8Z3DaZ0f5Cc",
  razorpaySignature: "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

---

## 🔐 Authentication

All endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

The user ID is extracted from the JWT token, so no need to send it separately.

---

## 💾 Database Changes

### Booking Created With:
```javascript
{
  user: userId,
  vehicle: vehicleId,
  startDate: "2024-12-20",
  endDate: "2024-12-25",
  durationType: "days",
  durationValue: 5,
  status: "CONFIRMED",
  paymentStatus: "paid",        // ← KEY: Set to 'paid' immediately
  paymentId: paymentId,
  pricing: {
    baseAmount: 5500,
    discountAmount: 500,
    finalAmount: 5000,
    couponCode: "SUMMER50"
  }
}
```

### Vehicle Updated With:
```javascript
{
  availability: false   // ← Set ONLY after payment verified
}
```

### Payment Created With:
```javascript
{
  user: userId,
  booking: bookingId,   // ← Linked after booking creation
  razorpayOrderId: "order_xxx",
  razorpayPaymentId: "pay_xxx",
  razorpaySignature: "sig_xxx",
  amount: 5000,
  currency: "INR",
  status: "COMPLETED",  // ← Set to COMPLETED after verification
  paymentMethod: "razorpay"
}
```

---

## ⚠️ Important Notes

1. **No Booking Until Payment**:
   - Order is created WITHOUT booking
   - Booking created ONLY when payment verified
   - Prevents payment bypass vulnerability

2. **Vehicle Availability**:
   - Checked during payment verification
   - Set to false ONLY after payment confirmed
   - Prevents race conditions

3. **Error Handling**:
   - If verification fails → No booking created
   - If vehicle unavailable → Error at verification step
   - Clear error messages for each scenario

4. **Idempotency**:
   - Multiple verification attempts with same signature are safe
   - First success creates booking
   - Subsequent calls check payment status

5. **Backward Compatibility**:
   - Old flow with bookingId still works
   - Can coexist with new flow
   - No migration needed

---

## 🧪 Test Payloads

### Successful New Booking
```bash
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "507f1f77bcf86cd799439011",
    "startDate": "2024-12-20",
    "endDate": "2024-12-25",
    "durationType": "days",
    "durationValue": 5,
    "amount": 5000,
    "baseAmount": 5500,
    "discountAmount": 500,
    "couponCode": "SUMMER50"
  }'
```

### Successful Payment Verification
```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_JxT8Z3DaZ0f5Cc",
    "razorpayPaymentId": "pay_JxT8Z3DaZ0f5Cc",
    "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
    "bookingDetails": {
      "vehicleId": "507f1f77bcf86cd799439011",
      "startDate": "2024-12-20",
      "endDate": "2024-12-25",
      "durationType": "days",
      "durationValue": 5,
      "amount": 5000
    }
  }'
```

---

**Last Updated**: 2024  
**Status**: Ready for Frontend Integration

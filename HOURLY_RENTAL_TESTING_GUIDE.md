# 🚀 Quick Reference & Testing Guide
## Hourly & Daily Rental System

---

## ⚡ Quick Reference

### Frontend - BookingModal Component Changes
```jsx
// Toggle between Hours and Days
Button "Hours" — Click to select hourly rental
Button "Days" — Click to select daily rental

// Dynamic Fields
Pickup Date: Date selector (always visible)
Pickup Time: Time selector (always visible) 
Duration: Input changes label based on toggle
  - If Hours: "Duration (hours)" with min 0.5
  - If Days: "Duration (days)" with min 1

// Live Preview
Shows: Duration, Price/unit, Total Price, Dropoff Date/Time
Auto-updates as user types values
```

### Backend - Pricing Logic
```
Hourly Pricing:
  pricePerHour = pricePerDay / 24
  
If hours >= 24: (AUTO-CONVERT)
  wholeDays = floor(hours / 24)
  remainingHours = hours % 24
  total = (wholeDays × pricePerDay) + (remainingHours × pricePerHour)
  
If hours < 24:
  total = hours × pricePerHour

Daily Pricing:
  total = days × pricePerDay
```

### Database Fields
```javascript
durationType: 'hours' | 'days'        // Rental type
durationValue: number                 // Amount (hours or days)
pickupDateTime: Date                  // Pickup date/time
dropoffDateTime: Date                 // Calculated dropoff
```

---

## 🧪 Test Scenarios

### ✅ Test 1: Create 5-Hour Rental
**Setup:** Vehicle with pricePerDay = ₹2,000
```
Scenario: Book 5 hours
Expected Price: 5 × (₹2,000/24) = ₹416.65

Steps:
1. Click Book
2. Select "Hours"
3. Pick any future date
4. Enter "5" as duration
5. Verify price shows ₹416.65
6. Confirm booking

Verification:
✓ Booking created with durationType='hours'
✓ durationValue=5
✓ totalPrice=416.65
✓ MyBookingsPage shows "5 hours"
```

### ✅ Test 2: Create 24-Hour Rental (Boundary)
**Setup:** Vehicle with pricePerDay = ₹2,000
```
Scenario: Book exactly 24 hours
Expected: Should be converted to 1 day pricing = ₹2,000

Steps:
1. Click Book
2. Select "Hours"
3. Pick date
4. Enter "24" as duration
5. Verify price shows ₹2,000
6. Confirm booking

Verification:
✓ Auto-converted to day pricing
✓ totalPrice=2,000 (not 1,999.92)
✓ durationType stored as 'days'
✓ durationValue=1
```

### ✅ Test 3: Create 32-Hour Rental (Mixed Conversion)
**Setup:** Vehicle with pricePerDay = ₹2,000
```
Scenario: Book 32 hours (1 day + 8 hours)
Expected: (1 × ₹2,000) + (8 × ₹83.33) = ₹2,666.64

Steps:
1. Click Book
2. Select "Hours"
3. Pick date
4. Enter "32" as duration
5. Verify UI shows conversion note
6. Verify price shows ₹2,666.64
7. Confirm booking

Verification:
✓ totalPrice calculated correctly
✓ Conversion note displayed to user
✓ dropoffDateTime is 32 hours from pickup
✓ MyBookingsPage shows duration correctly
```

### ✅ Test 4: Create 3-Day Rental (Traditional)
**Setup:** Vehicle with pricePerDay = ₹2,000
```
Scenario: Book 3 days
Expected: 3 × ₹2,000 = ₹6,000

Steps:
1. Click Book
2. Select "Days"
3. Pick date
4. Enter "3" as duration
5. Verify price shows ₹6,000
6. Confirm booking

Verification:
✓ durationType='days'
✓ durationValue=3
✓ totalPrice=6,000
✓ MyBookingsPage shows "3 days"
```

### ✅ Test 5: Hourly-to-Days Toggle
**Setup:** Vehicle
```
Scenario: Toggle between rental types and verify UI updates

Steps:
1. Click Book
2. Select "Hours"
3. Verify duration label = "Duration (hours)"
4. Click "Days"
5. Verify duration label = "Duration (days)"
6. Click "Hours"
7. Verify label changed back

Verification:
✓ UI updates immediately
✓ Labels reflect current selection
✓ Price calculations update
```

### ✅ Test 6: Validation - Max Hours (720)
**Setup:** Vehicle
```
Scenario: Attempt to book 721 hours
Expected: Error message

Steps:
1. Click Book
2. Select "Hours"
3. Enter "721" as duration
4. Verify error shows: "cannot exceed 720 hours"

Verification:
✓ Error displayed
✓ Submit button disabled
✓ Booking not created
```

### ✅ Test 7: Validation - Max Days (30)
**Setup:** Vehicle
```
Scenario: Attempt to book 31 days
Expected: Error message

Steps:
1. Click Book
2. Select "Days"
3. Enter "31" as duration
4. Verify error shows: "cannot exceed 30 days"

Verification:
✓ Error displayed
✓ Submit button disabled
✓ Booking not created
```

### ✅ Test 8: Validation - Zero Duration
**Setup:** Vehicle
```
Scenario: Attempt to book 0 hours/days
Expected: Error message

Steps:
1. Click Book
2. Select any type
3. Enter "0" as duration
4. Verify error shows

Verification:
✓ Error displayed
✓ Submit button disabled
```

### ✅ Test 9: Backward Compatibility
**Setup:** Existing daily booking in database (without new fields)
```
Scenario: Load old booking in MyBookingsPage

Steps:
1. Navigate to MyBookingsPage
2. Find booking without durationType/durationValue
3. Verify it displays correctly
4. Check price and duration show

Verification:
✓ Old booking displays without errors
✓ Duration calculated from startDate/endDate
✓ Price shows correctly
✓ No console errors
```

### ✅ Test 10: Overlap Detection with Hourly Bookings
**Setup:** Vehicle with existing 9:00-14:00 hourly booking
```
Scenario: Try to book 13:00-18:00 (overlaps)
Expected: Error "already booked"

Steps:
1. Create first booking: Hours, 5 hours (9:00-14:00)
2. Try to create second: Hours, 5 hours (13:00-18:00)
3. Verify error message

Verification:
✓ Overlap detected correctly
✓ Error message displayed
✓ Booking rejected
```

### ✅ Test 11: Pricing Accuracy - 12 Hours
**Setup:** Vehicle with pricePerDay = ₹2,400
```
Scenario: Book 12 hours
Expected: 12 × (₹2,400/24) = 12 × ₹100 = ₹1,200

Steps:
1. Click Book
2. Select "Hours"
3. Enter "12"
4. Verify price preview = ₹1,200
5. Confirm booking

Verification:
✓ Price = ₹1,200 (not ₹1,199 or ₹1,201)
✓ Booking saved correctly
✓ No rounding errors
```

### ✅ Test 12: Display - MyBookingsPage
**Setup:** Multiple bookings (hourly, daily, old)
```
Scenario: Verify correct display in MyBookingsPage

Hourly booking (5 hours):
✓ Duration column shows: "5 hours"
✓ Subtitle shows: "hours"

Daily booking (3 days):
✓ Duration column shows: "3 days"
✓ Subtitle shows: "days"

Old booking (no durationType):
✓ Duration calculated and displayed
✓ Shows as "X days"
```

### ✅ Test 13: Dropoff DateTime Calculation
**Setup:** Pickup 2024-04-15 14:00, 5 hours
```
Scenario: Verify dropoff calculated correctly
Expected: 2024-04-15 19:00

Verification:
✓ Form shows dropoff: "Apr 15, 2024, 19:00"
✓ Booking saved with correct dropoffDateTime
✓ Matches pickup + duration
```

### ✅ Test 14: Partial Hours (0.5)
**Setup:** Vehicle
```
Scenario: Book 0.5 hours (30 minutes)
Expected: 0.5 × (₹2,000/24) = ₹41.67

Steps:
1. Click Book
2. Select "Hours"
3. Enter "0.5"
4. Verify price = ₹41.67

Verification:
✓ Accepts decimal values
✓ Price calculated correctly
✓ Booking created successfully
```

### ✅ Test 15: API Payload Verification
**Setup:** Network inspector
```
Scenario: Inspect POST /bookings payload

Expected payload:
{
  "vehicleId": "507f...",
  "startDate": "2024-04-15T14:00:00Z",
  "endDate": "2024-04-15T19:00:00Z",
  "durationType": "hours",
  "durationValue": 5
}

Verification:
✓ All fields present
✓ Values correct
✓ Date format ISO 8601
```

---

## 🔍 Debugging Checklist

### If Bookings Don't Show Correctly in MyBookingsPage:
- [ ] Check `durationType` field in database
- [ ] Check `durationValue` field exists
- [ ] Verify fallback calculation works for old bookings
- [ ] Check console for JavaScript errors
- [ ] Inspect booking object in browser DevTools

### If Pricing Is Incorrect:
- [ ] Verify `pricePerDay` field on vehicle
- [ ] Check hourly rate = pricePerDay / 24
- [ ] Verify auto-conversion logic (24+ hours)
- [ ] Check for rounding errors
- [ ] Validate backend calculates correctly

### If Overlap Detection Fails:
- [ ] Check booking status filter in hasOverlap()
- [ ] Verify date comparison logic
- [ ] Check timezone issues
- [ ] Validate query in MongoDB

### If Dropoff Date Is Wrong:
- [ ] Check timezone handling
- [ ] Verify date addition logic
- [ ] Inspect dropoffDateTime in database
- [ ] Check time picker value

---

## 📊 Pricing Reference Table

**Vehicle: ₹2,000 per day**
**Hourly Rate: ₹83.33 per hour**

| Duration | Type | Calculation | Price |
|----------|------|-------------|-------|
| 1 | hour | 1 × ₹83.33 | ₹83.33 |
| 2 | hours | 2 × ₹83.33 | ₹166.66 |
| 5 | hours | 5 × ₹83.33 | ₹416.65 |
| 12 | hours | 12 × ₹83.33 | ₹1,000 |
| 24 | hours | 1 × ₹2,000 | ₹2,000 |
| 25 | hours | (1 × ₹2,000) + (1 × ₹83.33) | ₹2,083.33 |
| 30 | hours | (1 × ₹2,000) + (6 × ₹83.33) | ₹2,500 |
| 32 | hours | (1 × ₹2,000) + (8 × ₹83.33) | ₹2,666.64 |
| 1 | day | 1 × ₹2,000 | ₹2,000 |
| 2 | days | 2 × ₹2,000 | ₹4,000 |
| 3 | days | 3 × ₹2,000 | ₹6,000 |
| 7 | days | 7 × ₹2,000 | ₹14,000 |
| 30 | days | 30 × ₹2,000 | ₹60,000 |

---

## 🛠️ Developer Commands

### Test Backend Directly
```bash
# Create hourly booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "507f1f77bcf86cd799439011",
    "startDate": "2024-04-15T14:00:00Z",
    "endDate": "2024-04-15T19:00:00Z",
    "durationType": "hours",
    "durationValue": 5
  }'

# Get bookings
curl -X GET http://localhost:5000/api/bookings/my-bookings \
  -H "Authorization: Bearer TOKEN"
```

### Check Database
```javascript
// MongoDB Query
db.bookings.find({
  durationType: 'hours'
}).pretty()

// Count hourly vs daily
db.bookings.aggregate([
  { $group: { 
    _id: "$durationType", 
    count: { $sum: 1 } 
  }}
])
```

---

## 📋 Sign-Off Checklist

- [ ] All 15 test scenarios passed
- [ ] No console errors
- [ ] Old bookings display correctly
- [ ] Pricing calculations accurate
- [ ] UI toggle works smoothly
- [ ] Form validation working
- [ ] API payloads correct
- [ ] Database fields populated
- [ ] Overlap detection working
- [ ] Dropoff dates calculated correctly
- [ ] MyBookingsPage displays duration correctly
- [ ] Error messages user-friendly
- [ ] No breaking changes to existing code
- [ ] Backward compatibility verified
- [ ] Ready for production deployment

---

## ✨ Ready for Testing!

All implementation complete. Follow the test scenarios above to verify functionality.

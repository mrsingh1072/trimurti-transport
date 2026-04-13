# Testing Guide: Dashboard & Live Tracking Synchronization

## Overview
This guide provides step-by-step instructions to verify that the Dashboard and Live Tracking pages display the same vehicles with consistent status indicators.

## Pre-Test Setup

### 1. Ensure Backend is Running
```bash
cd backend
npm start  # or nodemon src/server.js
```

### 2. Ensure Frontend is Running
```bash
cd frontend
npm run dev
```

### 3. Database Preparation
- Ensure there are bookings with `isTracking: true` in the database
- Test with both bookings that have coordinates and those without

## Test Cases

### Test 1: Staff/Admin Dashboard - Live Tracking View
**Objective:** Verify staff/admin users see live tracking data on dashboard

**Steps:**
1. Log in as a staff or admin user
2. Navigate to Dashboard (`/dashboard`)
3. Verify you see "Live Tracking" tab
4. Verify stats cards display:
   - Tracking Active (vehicles with coordinates)
   - Waiting for Location (vehicles without coordinates)
   - Total Tracked Vehicles (all with tracking enabled)

**Expected Results:**
- All three stats show correct counts
- Counts match actual database records
- Vehicle list displays all tracked vehicles

**Pass:** ✓ All stats are accurate and match vehicle list

---

### Test 2: Live Tracking Page - Vehicle List
**Objective:** Verify Live Tracking page displays same vehicles as Dashboard

**Steps:**
1. From Dashboard, click "View Detailed Map" button
2. Or navigate directly to `/tracking`
3. Compare sidebar vehicle list with Dashboard vehicle list
4. Count should match exactly

**Expected Results:**
- Sidebar vehicle count matches Dashboard count
- Same vehicles appear in both places
- Vehicle information (name, registration, customer) matches

**Pass:** ✓ Vehicle list is identical between Dashboard and Live Tracking

---

### Test 3: Status Indicators - Waiting Vehicles
**Objective:** Verify vehicles without coordinates show "waiting" status

**Steps:**
1. Create/find a booking with `isTracking: true` but no `currentLocation`
2. View on Dashboard and Live Tracking page
3. Check status indicator

**Expected Results:**
- Status shows: `🟡 Waiting for location`
- Sidebar shows pulsing yellow dot
- Live Tracking map shows "Waiting for First Location Update" overlay

**Pass:** ✓ Correct status indicator and messaging

---

### Test 4: Status Indicators - Active Vehicles
**Objective:** Verify vehicles with coordinates show "active" status

**Steps:**
1. Create/find a booking with `isTracking: true` and valid `currentLocation`
2. View on Dashboard and Live Tracking page
3. Check status indicator

**Expected Results:**
- Status shows: `🟢 Tracking Active`
- Sidebar shows pulsing green dot
- Live Tracking map shows marker and all details

**Pass:** ✓ Correct status indicator and map display

---

### Test 5: Map Centering
**Objective:** Verify map centers correctly on active vehicles

**Steps:**
1. Navigate to Live Tracking page
2. If vehicles with coordinates exist:
   - Map should center on first vehicle with coordinates
3. If no vehicles have coordinates:
   - Map should show Delhi city center (28.6139, 77.2090)

**Expected Results:**
- Map centers appropriately based on vehicle data
- Smooth animation when centering
- Zoom level: 14 for vehicles, 12 for fallback center

**Pass:** ✓ Map centers correctly with appropriate zoom

---

### Test 6: Polling & Real-Time Updates
**Objective:** Verify data refreshes every 5 seconds

**Steps:**
1. Navigate to Dashboard (Live Tracking tab)
2. Check browser Network tab
3. Observe API calls to `/api/tracking/live`
4. Should see requests every 5 seconds

**Expected Results:**
- API calls occur at regular 5-second intervals
- Data updates without page refresh
- No errors in Network tab

**Pass:** ✓ Polling works correctly

---

### Test 7: Customer Role - Own Bookings Only
**Objective:** Verify customers see only their own tracked bookings

**Steps:**
1. Log in as a customer user (not staff/admin)
2. Navigate to Dashboard
3. Navigate to `/tracking`
4. Check vehicle count

**Expected Results:**
- Only customer's own tracked bookings appear
- Count is less than or equal to staff/admin count
- Cannot see other customers' vehicles

**Pass:** ✓ Role-based filtering works correctly

---

### Test 8: Error Handling
**Objective:** Verify graceful error handling

**Steps:**
1. Stop backend server
2. Try to load Dashboard (Live Tracking tab)
3. Restart backend and refresh
4. Verify recovery

**Expected Results:**
- Shows appropriate error message
- No page crashes
- Recovery works after backend restarts

**Pass:** ✓ Error handling is graceful

---

### Test 9: Empty State
**Objective:** Verify display when no vehicles are tracked

**Steps:**
1. Ensure no bookings have `isTracking: true`
2. Navigate to Dashboard (staff/admin)
3. Navigate to Live Tracking page

**Expected Results:**
- Dashboard shows "No Active Tracking" message
- Live Tracking shows "No Active Tracking" message
- No errors in console

**Pass:** ✓ Empty states display correctly

---

### Test 10: Data Consistency
**Objective:** Verify Dashboard and Live Tracking show identical data

**Steps:**
1. Navigate to both Dashboard and Live Tracking
2. Check each vehicle:
   - Vehicle Name
   - Customer Name
   - Registration Number
   - Status
   - Coordinates (if available)

**Expected Results:**
- All fields match between pages
- No discrepancies in data
- Status badges consistent

**Pass:** ✓ Complete data consistency

---

## Browser Console Checks

### Look for these console logs (should exist):
```
✅ DashboardPage is rendering for user: [name] Role: [role]
📊 Live vehicles fetched: [count]
🔴 Fetch live tracking data: {userId, userRole}
📍 [GET LIVE TRACKING] Fetching active vehicles with locations...
✅ [GET LIVE TRACKING] Retrieved [count] active vehicles
```

### Should NOT see:
```
❌ Failed to fetch tracking data
❌ Error
Uncaught TypeError
```

---

## API Response Validation

### Verify `/api/tracking/live` Response Structure

```json
{
  "success": true,
  "count": 3,
  "summary": {
    "active": 2,
    "waiting": 1,
    "completed": 0
  },
  "data": [
    {
      "_id": "booking_id",
      "bookingId": "booking_id",
      "vehicleName": "Toyota Fortuner",
      "customerName": "John Doe",
      "status": "active",
      "locationSharingEnabled": true,
      "latitude": 17.3850,
      "longitude": 78.4867,
      "lastUpdated": "2026-04-13T10:30:45.123Z",
      "customerPhone": "+919876543210",
      "registrationNumber": "TL-01-AB-0001",
      "vehicleType": "SUV",
      "bookingStatus": "ongoing"
    }
  ]
}
```

**Validation Checklist:**
- [ ] `success` is boolean
- [ ] `count` matches array length
- [ ] `summary` totals are correct
- [ ] All required fields present
- [ ] `status` is one of: "waiting", "active", "completed"
- [ ] `latitude` and `longitude` are null for "waiting" vehicles
- [ ] `lastUpdated` is valid timestamp or null

---

## Performance Checks

### Dashboard Load Time
- Should load within 2 seconds
- Live Tracking tab should be interactive immediately

### Live Tracking Map Load Time
- Should display within 3 seconds
- Map should be interactive immediately
- Sidebar should show vehicles while map loads

### API Response Time
- `GET /api/tracking/live` should respond within 500ms
- Polling should not cause stutter or lag

---

## Regression Testing

### Verify Unaffected Functionality

- [ ] Customer booking workflow still works
- [ ] Payment system not affected
- [ ] Authentication not affected
- [ ] Razorpay integration still works
- [ ] Feedback system still works
- [ ] Other dashboard stats (for customers) still work
- [ ] Database schema unchanged

---

## Troubleshooting

### Issue: Dashboard not showing Live Tracking tab
**Solution:** 
- Verify user has role "staff" or "admin"
- Check browser console for errors
- Verify `getLiveTracking` API is accessible

### Issue: Empty vehicle list
**Solution:**
- Check database for bookings with `isTracking: true`
- Verify user has permission to view vehicles
- Check backend logs for query errors

### Issue: Map not centering
**Solution:**
- Check vehicle coordinates in database
- Verify mapRef is properly initialized
- Check browser console for Leaflet errors

### Issue: Polling not working
**Solution:**
- Check Network tab for API calls
- Verify interval is set (should be 5 seconds)
- Check for JavaScript errors in console

---

## Sign-Off

Once all tests pass, document:
- [ ] Test Date: ___________
- [ ] Tested By: ___________
- [ ] Environment: Dev/Staging/Production
- [ ] All Tests Passed: Yes / No
- [ ] Issues Found: ___________
- [ ] Ready for Production: Yes / No


# Complete Step-by-Step Walkthrough with Expected Output

## Scenario: Staff User Creates a Vehicle

This document shows EXACTLY what you should see at each step.

---

## STEP 1: Seed Database

### Execute:
```bash
cd backend
npm run seed
```

### Expected Terminal Output:
```
Seed completed: {
  admin: 'prajwalrajput2004@gmail.com',
  staff: 'staff@trimurti.com',
  customer: 'customer@trimurti.com',
  vehicles: 7
}
```

✅ If you see this, database is seeded with active users.

---

## STEP 2: Start Backend Server

### Execute:
```bash
npm start
```

### Expected Terminal Output:
```
Server running on http://localhost:5000
Database connected successfully
🚀 Backend ready to accept requests
```

Keep this terminal open and **watch logs** - you'll see colored emoji logs here!

---

## STEP 3: Start Frontend

### In New Terminal:
```bash
cd frontend
npm run dev
```

### Expected Terminal Output:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

---

## STEP 4: Login as Staff

### In Browser:
1. Go to http://localhost:5173
2. Click "Sign In"
3. Enter:
   - Email: `staff@trimurti.com`
   - Password: `Staff@123`
4. Click "LOGIN"

### Backend Console Output:

```
🔑 [LOGIN] ATTEMPT - Email: staff@trimurti.com

✅ [LOGIN] USER FOUND:
   - ID: 65a9f8c2e1234567890abcd1
   - Email: staff@trimurti.com
   - Role: staff
   - Status: active

✅ [LOGIN] PASSWORD VERIFIED

✅ [LOGIN] ACCOUNT ACTIVE - Generating token

🔐 [GENERATE TOKEN] Creating JWT for user: staff@trimurti.com
   - Token payload: {
       id: '65a9f8c2e1234567890abcd1',
       role: 'staff',
       status: 'active'
     }
   - Token generated, length: 187

✅ [LOGIN] SUCCESS - Token generated
   - Returning user: {
       id: '65a9f8c2e1234567890abcd1',
       email: 'staff@trimurti.com',
       role: 'staff',
       status: 'active',
       name: 'Staff User'
     }
```

### Browser Console Output (F12):

```
🔑 [LOGIN] Sending credentials for: staff@trimurti.com

✅ [LOGIN] Success - Token received
   - Token length: 187
   - User: {
       id: "65a9f8c2e1234567890abcd1",
       email: "staff@trimurti.com",
       role: "staff",
       status: "active"
     }
   ✅ Token and user stored in localStorage
```

### Browser Behavior:
- ✅ Redirects to `/staff`
- ✅ Loads Staff Dashboard
- ✅ No errors in console

---

## STEP 5: Navigate to Management Area

### Action:
In Staff Dashboard, click "Manage Vehicles"

### Backend Console:
```
📤 [API REQUEST]: GET /api/vehicles
   ✅ Token found in localStorage, attaching to request
   - Token length: 187

🔍 [AUTH MIDDLEWARE] TOKEN FOUND: eyJhbGciOiJIUzI1NiIsInR5cCI6I...

✅ [AUTH MIDDLEWARE] TOKEN DECODED: {
     id: '65a9f8c2e1234567890abcd1',
     role: 'staff',
     status: 'active',
     iat: 2025-03-31T10:30:45.000Z,
     exp: 2025-04-07T10:30:45.000Z
   }

🔎 [AUTH MIDDLEWARE] SEARCHING USER - ID: 65a9f8c2e1234567890abcd1

✅ [AUTH MIDDLEWARE] USER FOUND:
   - ID: 65a9f8c2e1234567890abcd1
   - Email: staff@trimurti.com
   - Role: staff
   - Status: active
```

### Browser Console (F12):
```
📤 [API REQUEST]: GET /api/vehicles
   ✅ Token found in localStorage
   - Token length: 187
```

### Browser Behavior:
- ✅ Vehicle list loads
- ✅ Shows existing vehicles
- ✅ "+ Add Vehicle" button visible

---

## STEP 6: Click "+ Add Vehicle" Button

### Action:
In vehicle list, click "+ Add Vehicle"

### Browser:
- Modal pops up
- Form shows fields:
  - Vehicle Name
  - Category (dropdown)
  - Price Per Day
  - Location
  - Condition (Good/Average/Poor)
  - Availability (toggle)

### Backend Console:
(No activity yet - just API will be called on submit)

---

## STEP 7: Fill Vehicle Form

### Action:
Fill with sample data:
```
Vehicle Name: Mahindra XUV700
Category: Car
Price Per Day: 2000
Location: Pune
Condition: Good
Availability: ON (toggle enabled)
```

---

## STEP 8: Submit Form (THE CRITICAL TEST)

### Action:
Click "Create Vehicle" button

### Backend Console Output:

```
📤 [API REQUEST]: POST /api/vehicles
   ✅ Token found in localStorage, attaching to request
   - Token length: 187

🔍 [AUTH MIDDLEWARE] TOKEN FOUND: eyJhbGciOiJIUzI1NiIsInR5c...

✅ [AUTH MIDDLEWARE] TOKEN DECODED: {
     id: '65a9f8c2e1234567890abcd1',
     role: 'staff',
     status: 'active',
     iat: 2025-03-31T10:30:45.000Z,
     exp: 2025-04-07T10:30:45.000Z
   }

🔎 [AUTH MIDDLEWARE] SEARCHING USER - ID: 65a9f8c2e1234567890abcd1

✅ [AUTH MIDDLEWARE] USER FOUND:
   - ID: 65a9f8c2e1234567890abcd1
   - Email: staff@trimurti.com
   - Role: staff
   - Status: active

🔐 [AUTHORIZATION] CHECK - Required roles: [ 'staff', 'admin' ]
   - User: staff@trimurti.com
   - User role: staff

✅ [AUTHORIZATION] ACCESS GRANTED for: staff@trimurti.com

✅ Vehicle created successfully: {
     _id: ObjectId('65aaf7c8e9876543210bcde5'),
     name: 'Mahindra XUV700',
     category: 'Car',
     pricePerDay: 2000,
     location: 'Pune',
     condition: 'Good',
     availability: true,
     createdAt: 2025-03-31T10:35:20.123Z,
     updatedAt: 2025-03-31T10:35:20.123Z,
     __v: 0
   }
```

### Browser Console Output (F12):

```
📤 [API REQUEST]: POST /api/vehicles
   ✅ Token found in localStorage, attaching to request
   - Token length: 187
```

### Browser Behavior:

**✅ SUCCESS:**
- Modal closes
- Green toast appears: "Vehicle Added Successfully!"
- Vehicle immediately appears in list
- No errors in console

**❌ If you see 401 error:**
```
❌ [API ERROR]: {
  status: 401,
  message: 'User not found for this token',
  url: 'http://localhost:5000/api/vehicles',
  method: 'post'
}
```

---

## STEP 9: Verify Vehicle in Database

### MongoDB Check:

**Using MongoDB Compass:**
1. Connect to your MongoDB
2. Database: `transport`
3. Collection: `vehicles`
4. Find your newly created vehicle - it should be there!

**Using mongo shell:**
```bash
mongosh
use transport
db.vehicles.findOne({ name: "Mahindra XUV700" })
```

**Expected output:**
```
{
  _id: ObjectId("65aaf7c8e9876543210bcde5"),
  name: 'Mahindra XUV700',
  category: 'Car',
  pricePerDay: 2000,
  location: 'Pune',
  condition: 'Good',
  availability: true,
  createdAt: ISODate("2025-03-31T10:35:20.123Z"),
  updatedAt: ISODate("2025-03-31T10:35:20.123Z")
}
```

✅ Vehicle is saved!

---

## STEP 10: Verify Customer Can See Vehicle

### Action:
1. Logout from staff account
2. Login as customer:
   - Email: `customer@trimurti.com`
   - Password: `Customer@123`
3. Go to "Browse Vehicles"

### Expected:
- ✅ The vehicle you just created is visible
- ✅ All details match what staff entered

---

## 📊 Summary of Expected Flows

### Perfect Scenario Timeline:

```
[BACKEND] 🔑 [LOGIN] ATTEMPT
    ↓
[BACKEND] ✅ [LOGIN] USER FOUND
    ↓
[BACKEND] ✅ [LOGIN] PASSWORD VERIFIED
    ↓
[BACKEND] ✅ [LOGIN] ACCOUNT ACTIVE
    ↓
[BACKEND] 🔐 [GENERATE TOKEN] JWT Created
    ↓
[FRONTEND] Token stored in localStorage
    ↓
[USER] Clicks "+ Add Vehicle"
    ↓
[FRONTEND] Opens modal form
    ↓
[USER] Fills and submits form
    ↓
[FRONTEND] 📤 POST /api/vehicles with Bearer token
    ↓
[BACKEND] 🔍 TOKEN VERIFIED ✅
    ↓
[BACKEND] ✅ USER FOUND IN DATABASE
    ↓
[BACKEND] 🔐 AUTHORIZATION CHECK PASSED
    ↓
[BACKEND] 💾 Vehicle SAVED to MongoDB
    ↓
[BACKEND] 200 Response with vehicle data
    ↓
[FRONTEND] Shows success toast
    ↓
[FRONTEND] Vehicle list updated
    ↓
✅ MISSION ACCOMPLISHED!
```

---

## ⚠️ Problem Scenarios

### Scenario 1: 401 on Login

**Backend shows:**
```
❌ [LOGIN] USER NOT FOUND - Email: staff@trimurti.com
```

**Fix:**
```bash
npm run seed
```

---

### Scenario 2: 401 on Vehicle Create (The Main Issue)

**Backend shows:**
```
✅ [LOGIN] SUCCESS  ← Login worked fine

[User navigates to staff dashboard...]

❌ [AUTH MIDDLEWARE] USER NOT FOUND IN DB - userId: 65a9f8c2e1234567890abcd1
```

**Root Cause:** User was deleted or token references wrong ID

**Fix:**
```
Option 1: npm run seed (recreates all users)
Option 2: Clear localStorage and login again
Option 3: In MongoDB, re-activate staff user status
```

---

### Scenario 3: Token in localStorage but Not Sent to Backend

**Frontend shows:**
```
📤 [API REQUEST]: POST /api/vehicles
   ⚠️ No token in localStorage
```

**Root Cause:** Token not stored after login

**Fix:**
```
1. Check if login page redirects to /staff
2. Check localStorage after login:
   localStorage.getItem('authToken')
3. If null, login failed
```

---

## ✅ Verification Checklist

Go through each step and verify:

- [ ] Step 1: `npm run seed` shows 3 users created
- [ ] Step 2: Backend shows "Server running on http://localhost:5000"
- [ ] Step 3: Frontend shows "http://localhost:5173/" ready
- [ ] Step 4: Backend shows ✅ [LOGIN] SUCCESS
- [ ] Step 4: Browser redirects to `/staff`
- [ ] Step 5: Backend shows ✅ [AUTH MIDDLEWARE] USER FOUND
- [ ] Step 5: Vehicle list loads in browser
- [ ] Step 6: Modal appears when clicking "+ Add Vehicle"
- [ ] Step 7: Form accepts input
- [ ] **Step 8: Backend shows ✅ [AUTHORIZATION] ACCESS GRANTED** ← CRITICAL
- [ ] **Step 8: Browser shows success toast** ← CRITICAL
- [ ] Step 8: Vehicle appears in list without page refresh
- [ ] Step 9: Vehicle exists in MongoDB
- [ ] Step 10: Customer can see the vehicle

---

## 🎯 Key Success Indicators

1. **Backend shows colored emoji logs** ✅🔍🔐
2. **No 401 errors at vehicle creation** ✅
3. **Backend shows USER FOUND** ✅
4. **Authorization shows ACCESS GRANTED** ✅
5. **Vehicle appears in database and list** ✅

If all 5 are true, **the 401 fix is complete!**

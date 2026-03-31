# 401 Unauthorized - Complete Debugging Guide

## Issue: "User not found for this token" when Staff tries to create vehicle

---

## 📋 STEP-BY-STEP DEBUGGING CHECKLIST

### **STEP 1: Verify Database Has Active Staff User**

```bash
# Run this in MongoDB Compass or mongo shell
db.users.findOne({ email: "staff@trimurti.com" })

# Expected output:
{
  _id: ObjectId("..."),  # IMPORTANT: Check this ID
  name: "Staff User",
  email: "staff@trimurti.com",
  role: "staff",
  status: "active"        # CRITICAL: Must be "active"
}
```

**If staff is not active:**
```bash
# Activate the staff user
db.users.updateOne(
  { email: "staff@trimurti.com" },
  { $set: { status: "active" } }
)
```

**If staff doesn't exist:**
```bash
# Re-seed the database
npm run seed
```

---

### **STEP 2: Monitor Backend Logs During Login**

**What to expect when staff logs in as `staff@trimurti.com` / `Staff@123`:**

```
✅ [GENERATE TOKEN] Creating JWT for user: staff@trimurti.com
   - Token payload: { 
       id: '507f1f77bcf86cd799439011',  # User's ObjectId as string
       role: 'staff', 
       status: 'active' 
     }
   - Token generated, length: 187

✅ [LOGIN] SUCCESS - Token generated
   - Returning user: {
       id: '507f1f77bcf86cd799439011',
       email: 'staff@trimutti.com',
       role: 'staff',
       status: 'active'
     }
```

**If you see this, login is working!**

---

### **STEP 3: Check Frontend localStorage After Login**

**In Browser Console after login:**

```javascript
// Check if token is stored
console.log('Token:', localStorage.getItem('authToken'))
console.log('User:', JSON.parse(localStorage.getItem('user')))

// Should output:
// Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// User: {id: "507f1f77bcf86cd799439011", email: "staff@trimurti.com", role: "staff", ...}
```

---

### **STEP 4: Test Token Validity**

**Run this in browser console:**

```javascript
// Method 1: Call the verify endpoint
const response = await fetch('http://localhost:5000/api/auth/verify-token', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
const data = await response.json()
console.log('Token Valid:', data)

// If token is valid, you'll get:
// {
//   success: true,
//   message: 'Token is valid',
//   user: { id: '...', email: 'staff@trimurti.com', role: 'staff', ... }
// }
```

**Or use the API function:**

```javascript
// In React component
import { verifyToken } from './src/services/api'
const result = await verifyToken()
console.log('Token status:', result)
```

---

### **STEP 5: Monitor Backend During Vehicle Creation**

**Go to Staff Dashboard → Add Vehicle and watch backend logs**

**Expected sequence of logs:**

```
📤 [API REQUEST]: POST /api/vehicles
   ✅ Token found in localStorage, attaching to request
   - Token length: 187

🔍 [AUTH MIDDLEWARE] TOKEN FOUND: eyJhbGciOiJIUzI1NiIsIn...
✅ [AUTH MIDDLEWARE] TOKEN DECODED: {
     id: '507f1f77bcf86cd799439011',
     role: 'staff',
     status: 'active'
   }
🔎 [AUTH MIDDLEWARE] SEARCHING USER - ID: 507f1f77bcf86cd799439011
✅ [AUTH MIDDLEWARE] USER FOUND:
   - ID: 507f1f77bcf86cd799439011
   - Email: staff@trimurti.com
   - Role: staff
   - Status: active

🔐 [AUTHORIZATION] CHECK - Required roles: [ 'staff', 'admin' ]
   - User: staff@trimutti.com
   - User role: staff
✅ [AUTHORIZATION] ACCESS GRANTED for: staff@trimutti.com

✅ Vehicle created successfully
```

**If you see this, everything is working! Vehicle will be saved.**

---

## 🔴 COMMON ISSUES & FIXES

### **Issue 1: "User not found for this token"**

**Root Cause:** Staff user exists but their database `_id` doesn't match the ID in the token.

**How this happens:**
1. Staff user created with `_id: ObjectId("111")`
2. User deleted from DB
3. New staff user created with `_id: ObjectId("222")`
4. Old token still references `ObjectId("111")`

**Fix:**
```bash
# 1. Re-seed to create fresh users
npm run seed

# 2. Or manually check staff _id
db.users.findOne({ email: "staff@trimurti.com" })
# Note the _id value

# 3. Login again with new users
# New token will reference new _id
```

---

### **Issue 2: "User not authorized" (403 error)**

**Root Cause:** Staff user status is not "active"

**Check:**
```bash
db.users.findOne({ email: "staff@trimurti.com" })
# status: should be "active", not "pending", "rejected", etc.
```

**Fix:**
```bash
db.users.updateOne(
  { email: "staff@trimurti.com" },
  { $set: { status: "active" } }
)
```

---

### **Issue 3: No token in API request**

**Root Cause:** Token not stored in localStorage

**Check in browser console:**
```javascript
localStorage.getItem('authToken')  // Should NOT be null
```

**If null:**
1. Check if login actually succeeded (should redirect to /staff)
2. Login response should have `token` field

**Frontend fix in LoginPage:**
```javascript
// Verify login response has token
console.log('Login response:', response)
if (!response.token) {
  console.error('ERROR: No token in login response!')
}
```

---

### **Issue 4: Invalid ObjectId format in token**

**Backend will log:**
```
❌ [AUTH MIDDLEWARE] INVALID MONGODB ID FORMAT: undefined
```

**Root Cause:** Token was generated with `id: user._id` instead of `id: user._id.toString()`

**This should already be fixed - check authService.js**

---

## 🧪 COMPLETE DEBUG FLOW

### **1. Terminal 1 - Start Backend with Logs**
```bash
cd backend
npm run seed          # Ensure fresh data
npm start             # Watch console logs
```

### **2. Terminal 2 - Start Frontend**
```bash
cd frontend
npm run dev
```

### **3. Browser Tab - Debug Console**
```
Open: http://localhost:5173
Open DevTools Console (F12)
```

### **4. Manual Test - Follow Sequence**

**A. Test Login:**
- Go to login page
- Email: `staff@trimutti.com`
- Password: `Staff@123`
- **Check backend logs** - Should see ✅ [LOGIN] SUCCESS
- **Check localStorage** - Token should be stored

**B. Test Token Validity:**
```javascript
// In browser console
await fetch('http://localhost:5000/api/auth/verify-token', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(console.log)
```

**C. Test Vehicle Creation:**
- Navigate to Staff Dashboard
- Click "Add Vehicle"
- Fill form and submit
- **Check backend logs** - Should see ✅ [AUTHORIZATION] ACCESS GRANTED

---

## 📊 Expected Log Output

### **Successful Login:**
```
🔑 [LOGIN] ATTEMPT - Email: staff@trimurti.com
✅ [LOGIN] USER FOUND:
   - ID: 507f1f77bcf86cd799439011
   - Email: staff@trimurti.com
   - Role: staff
   - Status: active
✅ [LOGIN] PASSWORD VERIFIED
✅ [LOGIN] ACCOUNT ACTIVE - Generating token
🔐 [GENERATE TOKEN] Creating JWT for user: staff@trimurti.com
✅ [LOGIN] SUCCESS - Token generated
```

### **Successful Vehicle Creation:**
```
📤 [API REQUEST]: POST /api/vehicles
   ✅ Token found in localStorage
🔐 [AUTHORIZATION] CHECK - Required roles: [ 'staff', 'admin' ]
✅ [AUTHORIZATION] ACCESS GRANTED for: staff@trimurti.com
✅ Vehicle created successfully
```

---

## 🚀 QUICK REFERENCE

| Issue | Log to Look For | Solution |
|-------|-----------------|----------|
| Login fails | ❌ PASSWORD MISMATCH | Check email/password |
| Account pending | ❌ ACCOUNT NOT ACTIVE | Admin must approve staff |
| Token invalid | ❌ TOKEN VERIFICATION FAILED | Re-login |
| User not in DB | ❌ USER NOT FOUND IN DB | Run `npm run seed` |
| Role denied | ❌ ROLE NOT ALLOWED | Ensure user role is "staff" or "admin" |
| 401 on vehicle create | ❌ USER NOT FOUND for this token | Follow STEP 1-5 above |

---

## 📞 Need Help?

**Check logs in this order:**
1. Backend console - Look for colored logs with emoji
2. Browser console (F12) - Look for API REQUEST/ERROR logs
3. MongoDB - Verify user exists and status is "active"
4. localStorage - Verify authToken is stored

**If 401 persists after all steps:**
1. Clear browser data (`Ctrl+Shift+Delete`)
2. Re-seed database (`npm run seed`)
3. Login again fresh
4. Watch backend logs during login

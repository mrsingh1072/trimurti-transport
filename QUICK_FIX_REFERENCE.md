# Quick Reference: 401 Unauthorized Fix

## 🚀 Start Here (Copy-Paste)

### **Step 1: Re-seed Database**
```bash
cd backend
npm run seed
```

### **Step 2: Start Backend (Watch Logs!)**
```bash
npm start
# Should show colored emoji logs with ✅ and ❌
```

### **Step 3: Start Frontend**
```bash
cd frontend
npm run dev
```

### **Step 4: Test Login**
- Go to http://localhost:5173
- Email: `staff@trimurti.com`
- Password: `Staff@123`
- ✅ Should redirect to `/staff` dashboard

### **Step 5: Create Vehicle**
- Click "+ Add Vehicle"
- Fill form and submit
- ✅ Should show "Vehicle Added Successfully!" toast

---

## 🔍 What to Look for in Logs

### **Backend Console (Perfect Scenario)**

```
🔑 [LOGIN] ATTEMPT - Email: staff@trimurti.com
✅ [LOGIN] USER FOUND:
   - ID: 507f1f77bcf86cd799439011
   - Role: staff
   - Status: active
✅ [LOGIN] PASSWORD VERIFIED
✅ [LOGIN] ACCOUNT ACTIVE
🔐 [GENERATE TOKEN] Creating JWT...
✅ [LOGIN] SUCCESS

[User navigates to staff dashboard]

📤 [API REQUEST]: POST /api/vehicles
   ✅ Token found in localStorage

🔍 [AUTH MIDDLEWARE] TOKEN FOUND
✅ [AUTH MIDDLEWARE] TOKEN DECODED
✅ [AUTH MIDDLEWARE] USER FOUND

🔐 [AUTHORIZATION] CHECK
✅ [AUTHORIZATION] ACCESS GRANTED

✅ Vehicle created successfully
```

### **Browser Console (Perfect Scenario)**

```
🔑 [LOGIN] Sending credentials for: staff@trimurti.com
✅ [LOGIN] Success - Token received
   ✅ Token and user stored in localStorage

📤 [API REQUEST]: POST /api/vehicles
   ✅ Token found in localStorage, attaching to request
```

---

## ❌ Problem? Check This

### **"User not found for this token" 401 Error**

```
❌ [LOGIN] USER NOT FOUND
→ SOLUTION: Run npm run seed

❌ [LOGIN] ACCOUNT NOT ACTIVE - Status: pending
→ SOLUTION: Run npm run seed again

❌ [LOGIN] PASSWORD MISMATCH
→ SOLUTION: Check email/password spelling
  Email: staff@trimurti.com
  Password: Staff@123

❌ [AUTH MIDDLEWARE] USER NOT FOUND IN DB
→ SOLUTION: 
  1. Check backend logs during login (is it successful?)
  2. If login logs show ✅, but vehicle creation shows ❌
  3. Clear browser localStorage: Ctrl+Shift+Delete
  4. Login again fresh
```

---

## 🧪 Quick Tests

### **Test 1: Is Token Valid?** (Browser Console)
```javascript
const token = localStorage.getItem('authToken')
console.log('Token exists:', !!token)
console.log('Token length:', token?.length)
```

### **Test 2: Does Backend Accept Token?** (Browser Console)
```javascript
fetch('http://localhost:5000/api/auth/verify-token', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(console.log)
```
**Expected response:**
```
{
  success: true,
  message: 'Token is valid',
  user: { id: '...', email: 'staff@trimurti.com', ... }
}
```

### **Test 3: Is Staff User in Database?** (Backend Console - During Login Logs)
```
👤 [LOGIN] USER FOUND:
   - ID: 507f1f77bcf86cd799439011
   - Email: staff@trimurti.com
   - Role: staff
   - Status: active ← MUST BE "active"
```

---

## 📋 Checklist for 401 Fix

- [ ] Run `npm run seed` in backend
- [ ] Start backend with `npm start`
- [ ] Start frontend with `npm run dev`
- [ ] Login as staff: `staff@trimurti.com` / `Staff@123`
- [ ] Check backend logs show ✅ [LOGIN] SUCCESS
- [ ] Check browser devtools → Application → localStorage → `authToken` exists
- [ ] Go to Staff Dashboard
- [ ] Click "+ Add Vehicle"
- [ ] Fill form and submit
- [ ] Check backend logs show ✅ [AUTHORIZATION] ACCESS GRANTED
- [ ] See success toast "Vehicle Added Successfully!"
- [ ] Vehicle appears in list

---

## 🚨 Emergency Reset

**If everything is broken - nuclear option:**

```bash
# Backend
cd backend
npm run seed            # Delete all users/vehicles, create fresh
npm start              # Restart server

# Frontend
# Browser: Ctrl+Shift+Delete (clear all data)
# Or use this in console:
localStorage.clear()

# Now login fresh with new seeded credentials
```

---

## 🔐 Default Test Credentials

After seeding, these users are ACTIVE and can login:

```
ADMIN USER:
  Email: prajwalrajput2004@gmail.com
  Password: Prajwal@1100
  Role: admin
  Status: ACTIVE ✅

STAFF USER:
  Email: staff@trimurti.com
  Password: Staff@123
  Role: staff
  Status: ACTIVE ✅ (This is the one for 401 fix)

CUSTOMER USER:
  Email: customer@trimurti.com
  Password: Customer@123
  Role: customer
  Status: ACTIVE ✅
```

---

## 💡 Key Fixes Summary

| What | Where | Fix |
|------|-------|-----|
| Token generation | `authService.js` | Include user ID as string: `{ id: user._id.toString() }` |
| User lookup | `authMiddleware.js` | Validate ObjectId before searching: `ObjectId.isValid(decoded.id)` |
| Seeded users | `seed.js` | Set staff status to 'active' explicitly |
| Frontend logging | `api.js` | Log ALL requests and responses for debugging |
| Verify endpoint | `authRoutes.js` | Added `/auth/verify-token` for testing |

---

## 📖 Read These if Still Stuck

1. **IMPLEMENTATION_REPORT_401_FIX.md** - Complete technical details
2. **DEBUG_401_ERROR.md** - Step-by-step debugging walkthrough
3. **DIAGNOSTIC_TEST.js** - Copy into browser console to auto-test everything

---

## ✅ How You'll Know It's Fixed

```
✅ Login works without errors
✅ Token appears in localStorage
✅ Backend logs show ✅ marks, not ❌
✅ Vehicle creation returns 201 (created)
✅ Vehicle appears in database
✅ Zero 401 errors in console
```

---

## 📞 Still Having Issues?

Check in this order:
1. **Backend logs** - Look for colored 🔍🔐✅ emoji logs
2. **Browser console** - Look for 📤 API REQUEST logs
3. **MongoDB** - Verify `staff@trimurti.com` status = "active"
4. **localStorage** - Verify token exists (F12 → Application → Storage)

If all checks pass but still fails:
1. Clear browser data (`Ctrl+Shift+Delete`)
2. Close and reopen browser
3. Logout and login fresh
4. Try creating vehicle again

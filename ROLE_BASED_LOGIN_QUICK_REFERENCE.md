# Role-Based Login System - Quick Reference

## 🚀 Quick Start

### Available Routes

```
http://localhost:5173/role-selector    → Role selection page (optional)
http://localhost:5173/login            → Customer login
http://localhost:5173/staff/login      → Staff login
http://localhost:5173/admin/login      → Admin login
```

---

## 🎨 Visual Reference - Color Schemes

### Customer Login (/login)
- 🎨 **Color**: Blue → Cyan
- 💬 **Message**: "Easy access with a few clicks"
- ✨ **Features**: Sign-up option, friendly interface
- 🎯 **Accent**: Blue gradient buttons

### Staff Login (/staff/login)
- 🎨 **Color**: Purple → Pink
- 💬 **Badge**: "👷 Staff Portal"
- 📋 **Message**: "Staff accounts require admin approval"
- 🎯 **Features**: No signup, approval checklist

### Admin Login (/admin/login)
- 🎨 **Color**: Red → Orange
- 🔐 **Badge**: "🔐 Admin Access"
- ⚠️ **Message**: "Authorized personnel only"
- 🎯 **Features**: Security guidelines, activity logging notice

---

## 🧪 Testing Guide

### Test Case 1: Customer Login
```
1. Navigate to: http://localhost:5173/login
   ✓ Page should show blue/cyan theme
   ✓ Title: "Customer Login"
   ✓ Should show "Easy access with a few clicks"
   ✓ Show sign-up button in green

2. Enter credentials:
   Email: customer@trimurti.com
   Password: password123

3. Expected:
   ✓ Redirect to /dashboard
   ✓ Navigation shows customer view
```

### Test Case 2: Staff Login
```
1. Navigate to: http://localhost:5173/staff/login
   ✓ Page should show purple/pink theme
   ✓ Title: "Staff Portal"
   ✓ Badge shows "👷 Staff Portal"
   ✓ Should show approval message
   ✓ NO sign-up button visible

2. Enter credentials:
   Email: staff@trimurti.com
   Password: password123

3. Expected:
   ✓ Redirect to /staff
   ✓ Navigation shows staff view
```

### Test Case 3: Admin Login
```
1. Navigate to: http://localhost:5173/admin/login
   ✓ Page should show red/orange theme
   ✓ Title: "Admin Access"
   ✓ Badge shows "🔐 Admin Access"
   ✓ Should show "Authorized personnel only"
   ✓ Show security guidelines
   ✓ NO sign-up button visible

2. Enter credentials:
   Email: admin@trimurti.com
   Password: password123

3. Expected:
   ✓ Redirect to /admin
   ✓ Navigation shows admin view
```

### Test Case 4: Role Selector
```
1. Navigate to: http://localhost:5173/role-selector
   ✓ Should show 3 role cards
   ✓ Each card shows description and features
   ✓ Staff card shows "Admin approval required"

2. Click on role card:
   ✓ Should navigate to correct login page
   ✓ Theme should match role
```

### Test Case 5: Security - Wrong Role Login
```
1. Go to: http://localhost:5173/login (Customer page)
2. Try to login with staff credentials:
   Email: staff@trimurti.com
   Password: password123

Expected:
   ✗ Login fails
   ✓ Shows error: "...role does not match..."
```

### Test Case 6: Session Management
```
1. Login as customer
2. Navigate to /staff/login while logged in
   ✓ Redirect to /dashboard (protected route)

3. Logout
4. Try to access /dashboard
   ✓ Redirect to /login (no auth)
```

---

## 📱 Component Props Reference

### LoginForm Minimal Usage
```jsx
<LoginForm
  role="customer"
  title="Login"
  subtitle="Sign in"
  accentColor="from-blue-500 to-cyan-500"
  glowColor="blue-500"
/>
```

### LoginForm Full Usage
```jsx
<LoginForm
  role="customer"
  title="Customer Login"
  subtitle="Sign in to your account"
  accentColor="from-blue-500 to-cyan-500"
  glowColor="blue-500"
  roleConfig={{
    showSignUp: true,
    signUpText: "Create Account",
    signUpLink: "/register",
    infoMessage: {
      icon: "💡",
      text: "Easy access",
      className: "bg-blue-500/10 border border-blue-500/20",
      textColor: "text-blue-400"
    },
    warningMessage: {
      icon: "⚠️",
      title: "Title",
      text: "Message",
      titleColor: "text-blue-300",
      textColor: "text-blue-200",
      className: "bg-blue-900/30 border border-blue-700/50"
    },
    badge: {
      text: "BADGE",
      className: "bg-blue-600 text-blue-100"
    },
    footerContent: <div>Custom footer</div>
  }}
/>
```

---

## 🎯 Key Features

### ✅ Implemented
- [x] Three separate login pages
- [x] Role-specific theming (colors, gradients, badges)
- [x] Reusable LoginForm component
- [x] Role validation on login
- [x] Security warnings (especially for admin)
- [x] Info messages and approval notices
- [x] Sign-up integration for customers
- [x] Loading states during login
- [x] Error message display
- [x] Password visibility toggle
- [x] "Remember me" checkbox
- [x] "Forgot password" link
- [x] Demo credentials (development mode)
- [x] Role selector page for easy navigation

### 🔐 Security Features
- Role validation prevents unauthorized access
- Role included in login request
- Error messages don't expose user existence
- Session tokens managed securely
- Protected routes check user role
- Activity logging notice for admins

---

## 🚨 Common Issues & Fixes

### Issue: Colors not displaying

**Solution**: Ensure Tailwind CSS is properly configured in `tailwind.config.js`
```js
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {}
  }
}
```

### Issue: Components not found

**Solution**: Check import paths are correct
```jsx
// ✓ Correct
import LoginForm from '../components/LoginForm'
import CustomerLoginPage from '../pages/CustomerLoginPage'

// ✗ Wrong
import LoginForm from './LoginForm'  // Wrong path
```

### Issue: Login failing with 401

**Solution**: Backend might not be validating `requestedRole`. Check:
1. Backend is receiving the role parameter
2. Backend validates user.role === requestedRole
3. Check console for API errors

### Issue: Navigation not working

**Solution**: Ensure useNavigate is from 'react-router-dom'
```jsx
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/dashboard')
```

---

## 📊 File Checklist

Ensure these files exist and are updated:

- [x] `frontend/src/components/LoginForm.jsx` - NEW
- [x] `frontend/src/pages/CustomerLoginPage.jsx` - NEW
- [x] `frontend/src/pages/StaffLoginPage.jsx` - NEW
- [x] `frontend/src/pages/AdminLoginPage.jsx` - NEW
- [x] `frontend/src/pages/RoleSelector.jsx` - NEW
- [x] `frontend/src/App.jsx` - UPDATED (routes)
- [x] `frontend/src/context/AuthContext.jsx` - No changes
- [x] `frontend/src/services/api.js` - No changes

---

## 🔄 Login Flow Diagram

```
┌─────────────────────────────────────────────────┐
│ User visits http://localhost:5173/login          │
│ OR /staff/login                                  │
│ OR /admin/login                                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Choose Login Page   │
        │ (Customer/Staff/Adm)│
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ LoginForm Shows    │
        │ - Email field      │
        │ - Password field   │
        │ - Role-specific UI │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ User enters        │
        │ credentials        │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │ loginUser({                     │
        │   email,                       │
        │   password,                    │
        │   requestedRole: role          │
        │ })                             │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │ Backend validates:             │
        │ 1. Credentials correct?        │
        │ 2. user.role === requestedRole?│
        │ 3. User account active?        │
        └────────┬──────────────┬────────┘
                 │              │
            Valid  │              │ Invalid
                 ▼              ▼
        ┌─────────────────┐  ┌──────────────┐
        │ Return:         │  │ Return 401   │
        │ - token         │  │ - error msg  │
        │ - user object   │  └──────┬───────┘
        └────────┬────────┘         │
                 │                  ▼
                 │         ┌──────────────────┐
                 │         │ Show error:      │
                 │         │ "Invalid email..." │
                 │         └──────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ validateRole()           │
        │ Check role matches page  │
        └────────┬────────┬───────┘
                 │        │
            Valid  │        │ Mismatch
                 │        │
                 ▼        ▼
        ┌───────────┐  ┌──────────────────┐
        │ login()   │  │ Show error:      │
        │ store     │  │ "...doesn't match"│
        │ token     │  └──────────────────┘
        └────┬───────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Redirect based on role:   │
    │ - customer → /dashboard   │
    │ - staff    → /staff       │
    │ - admin    → /admin       │
    └──────────────────────────┘
```

---

## 🌐 Demo Accounts

```
CUSTOMER:
  Email: customer@trimurti.com
  Password: password123

STAFF:
  Email: staff@trimurti.com
  Password: password123

ADMIN:
  Email: admin@trimurti.com
  Password: password123
```

⚠️ **Note**: Demo credentials only for development. Change in production.

---

## 📚 Related Files

- [ROLE_BASED_LOGIN_GUIDE.md](./ROLE_BASED_LOGIN_GUIDE.md) - Comprehensive guide
- [backend/src/controllers/authController.js](./backend/src/controllers/authController.js) - Backend auth logic
- [frontend/src/context/AuthContext.jsx](./frontend/src/context/AuthContext.jsx) - Auth state management
- [frontend/src/services/api.js](./frontend/src/services/api.js) - API client

---

**Last Updated**: April 2026
**Version**: 1.0
**Status**: Production Ready

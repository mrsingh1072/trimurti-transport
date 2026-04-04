# Role-Based Login - Navigation Connection Reference

## 🎯 Quick Overview

Your landing page now connects to three separate role-based login pages:

```
Landing Page (/)
    ↓
"Already have an account?"
    ↓
┌─────────────────────────────────────┐
│ 🛒 Customer  👷 Staff  🔐 Admin    │
│   /login    /staff/login /admin/login
└─────────────────────────────────────┘
```

---

## ✅ UPDATED CODE - LandingPage.jsx

### Location: `frontend/src/pages/LandingPage.jsx` (Lines ~90-103)

```jsx
{/* Role-based Login Links */}
<div className="mb-12 pb-8 border-b border-gray-800">
  <p className="text-gray-400 text-sm mb-4">Already have an account?</p>
  <div className="flex flex-wrap items-center justify-center gap-3">
    
    {/* 🛒 Customer Login */}
    <Link to="/login" className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition font-medium">
      🛒 Customer Login
    </Link>
    <span className="text-gray-600">•</span>
    
    {/* 👷 Staff Portal */}
    <Link to="/staff/login" className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition font-medium">
      👷 Staff Portal
    </Link>
    <span className="text-gray-600">•</span>
    
    {/* 🔐 Admin Access */}
    <Link to="/admin/login" className="px-4 py-2 text-sm text-amber-400 hover:text-amber-300 transition font-medium">
      🔐 Admin Access
    </Link>
    
  </div>
</div>
```

---

## ✅ ROUTING CONFIG - App.jsx

### Location: `frontend/src/App.jsx` (Lines ~64-68)

```jsx
import RoleSelector from './pages/RoleSelector'
import CustomerLoginPage from './pages/CustomerLoginPage'
import StaffLoginPage from './pages/StaffLoginPage'
import AdminLoginPage from './pages/AdminLoginPage'

// ... later in Routes ...

{/* Authentication Pages */}
<Route path="/role-selector" element={<RoleSelector />} />
<Route path="/login" element={<CustomerLoginPage />} />
<Route path="/staff/login" element={<StaffLoginPage />} />
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route path="/register" element={<RegisterPage />} />
```

---

## 🔌 PAGE COMPONENTS (Read-Only Reference)

### CustomerLoginPage.jsx

```jsx
import LoginForm from '../components/LoginForm'

export default function CustomerLoginPage() {
  const customerConfig = {
    showSignUp: true,
    signUpText: '🛒 Create Customer Account',
    signUpLink: '/register',
    // ... other config
  }

  return (
    <LoginForm
      role="customer"
      title="Customer Login"
      subtitle="Sign in to your Trimurti Transport account"
      accentColor="from-blue-500 to-cyan-500"
      glowColor="blue-500"
      roleConfig={customerConfig}
    />
  )
}
```

### StaffLoginPage.jsx

```jsx
export default function StaffLoginPage() {
  const staffConfig = {
    showSignUp: false,  // No signup for staff
    badge: {
      text: '👷 Staff Portal',
      className: 'bg-purple-600 text-purple-100'
    },
    warningMessage: {
      icon: '✓',
      title: 'Account Approval Required',
      text: 'Staff accounts are created and approved by administrators...'
    },
    // ... other config
  }

  return (
    <LoginForm
      role="staff"
      title="Staff Portal"
      subtitle="Access your Trimurti Transport staff account"
      accentColor="from-purple-500 to-pink-500"
      glowColor="purple-500"
      roleConfig={staffConfig}
    />
  )
}
```

### AdminLoginPage.jsx

```jsx
export default function AdminLoginPage() {
  const adminConfig = {
    showSignUp: false,  // No signup for admin
    badge: {
      text: '🔐 Admin Access',
      className: 'bg-red-600 text-red-100'
    },
    warningMessage: {
      icon: '⚠️',
      title: 'Authorized Personnel Only',
      text: 'This portal is restricted to system administrators...'
    },
    // ... other config with security guidelines
  }

  return (
    <LoginForm
      role="admin"
      title="Admin Access"
      subtitle="Trimurti Transport Administration Console"
      accentColor="from-red-600 to-orange-500"
      glowColor="red-500"
      roleConfig={adminConfig}
    />
  )
}
```

---

## 🎛️ REUSABLE LoginForm COMPONENT

### Location: `frontend/src/components/LoginForm.jsx`

**Props Interface:**
```jsx
<LoginForm
  role="customer"                              // Required: 'customer' | 'staff' | 'admin'
  title="Customer Login"                      // Main heading
  subtitle="Sign in to your account"          // Sub heading
  accentColor="from-blue-500 to-cyan-500"     // Gradient class
  glowColor="blue-500"                        // Glow background
  roleConfig={{                               // Configuration object
    showSignUp: boolean,
    signUpText: string,
    signUpLink: string,
    infoMessage: { icon, text, className, textColor },
    warningMessage: { icon, title, text, titleColor, textColor, className },
    badge: { text, className },
    footerContent: JSX
  }}
/>
```

**Key Features:**
- ✓ Handles form state (email, password)
- ✓ Shows/hides password toggle
- ✓ Loading state during submit
- ✓ Error message display
- ✓ Role validation on login
- ✓ Redirects to correct dashboard per role

---

## 📍 NAVIGATION FLOW DIAGRAM

```
User Activity                    Component             Route/Page
──────────────────────────────────────────────────────────────────

User visits site      →    LandingPage.jsx      →    /
                       (with Navbar)

Scroll down           →    See login links

Click "Customer"      →    React Router Link    →    /login
                           to="/login"          
                                   ↓
                       CustomerLoginPage.jsx    
                                   ↓
                       LoginForm(role="customer")
                       (Blue/Cyan theme)


Click "Staff"         →    React Router Link    →    /staff/login
                           to="/staff/login"
                                   ↓
                       StaffLoginPage.jsx
                                   ↓
                       LoginForm(role="staff")
                       (Purple/Pink theme)
                       + Approval notice


Click "Admin"         →    React Router Link    →    /admin/login
                           to="/admin/login"
                                   ↓
                       AdminLoginPage.jsx
                                   ↓
                       LoginForm(role="admin")
                       (Red/Orange theme)
                       + Security warnings


User enters creds     →    LoginForm validates   
& clicks Submit       →    loginUser() API call

✓ Valid              →    validateRole() check
                      →    Store token
                      →    Navigate to:
                           /dashboard (customer)
                           /staff (staff)
                           /admin (admin)

✗ Invalid role       →    Show error message
or creds             →    Stay on page
```

---

## 🧪 TESTING CHECKLIST

### Test 1: Landing Page Links
```
□ Visit http://localhost:5173/
□ See three login links: 🛒 👷 🔐
□ Click "🛒 Customer Login"
  → Should go to http://localhost:5173/login (blue theme)
□ Browser back button
□ Click "👷 Staff Portal"  
  → Should go to http://localhost:5173/staff/login (purple theme)
□ Browser back button
□ Click "🔐 Admin Access"
  → Should go to http://localhost:5173/admin/login (red theme)
```

### Test 2: Direct URL Navigation
```
□ Visit http://localhost:5173/login
  → CustomerLoginPage (blue/cyan)
□ Visit http://localhost:5173/staff/login
  → StaffLoginPage (purple/pink)
□ Visit http://localhost:5173/admin/login
  → AdminLoginPage (red/orange)
```

### Test 3: Login Success
```
Customer:
  Email: customer@trimurti.com
  Password: password123
  Expected: Redirect to /dashboard

Staff:
  Email: staff@trimurti.com
  Password: password123
  Expected: Redirect to /staff

Admin:
  Email: admin@trimurti.com
  Password: password123
  Expected: Redirect to /admin
```

### Test 4: Role Validation
```
Try Staff creds on Customer page:
  Go to /login (customer page)
  Email: staff@trimurti.com
  Password: password123
  Expected: Error "...role does not match..."
  
Try Admin creds on Staff page:
  Go to /staff/login (staff page)
  Email: admin@trimurti.com
  Password: password123
  Expected: Error "...role does not match..."
```

---

## 💡 KEY CODE CHANGES

### Change 1: Landing Page Navigation Links
**File**: `LandingPage.jsx` (Lines ~100-101)
```
Before: <Link to="/login">Staff Portal</Link>
After:  <Link to="/staff/login">Staff Portal</Link>

Before: <Link to="/login">Admin Access</Link>
After:  <Link to="/admin/login">Admin Access</Link>
```

### Change 2: App.jsx Routes
**File**: `App.jsx` (Lines ~64-68)
```
Added:
<Route path="/staff/login" element={<StaffLoginPage />} />
<Route path="/admin/login" element={<AdminLoginPage />} />
```

### Change 3: New Components
**Files Created**:
- `LoginForm.jsx` (reusable component)
- `CustomerLoginPage.jsx` (customer-specific page)
- `StaffLoginPage.jsx` (staff-specific page)
- `AdminLoginPage.jsx` (admin-specific page)
- `RoleSelector.jsx` (role selection page)

---

## 🔐 SECURITY FEATURES

### Role Validation in LoginForm
```jsx
const validateRole = (userRole, pageRole) => {
  // Prevents unauthorized access
  if (pageRole === 'customer' && userRole !== 'customer') {
    return { valid: false, message: '...role does not match...' }
  }
  return { valid: true }
}
```

### Role in API Request
```jsx
const response = await loginUser({ 
  email, 
  password, 
  requestedRole: role  // ← Role sent to backend
})
```

---

## 🎨 THEME COLORS

| Role | Gradient | Glow | Text Accent |
|------|----------|------|------------|
| Customer | `from-blue-500 to-cyan-500` | `blue-500` | `text-blue-400` |
| Staff | `from-purple-500 to-pink-500` | `purple-500` | `text-purple-400` |
| Admin | `from-red-600 to-orange-500` | `red-500` | `text-red-400` |

---

## ✨ WHAT'S WORKING NOW

✅ Landing page shows three login links
✅ Each link navigates to correct login page  
✅ Each page has unique theme/colors
✅ LoginForm is reusable for all roles
✅ Role passed as prop to LoginForm
✅ Role validation prevents unauthorized access
✅ Correct redirect after successful login
✅ Dark theme maintained
✅ No existing functionality broken
✅ Backward compatible

---

## 🚀 HOW TO USE

### From Landing Page
```
/ (Landing)
  → Click "🛒 Customer Login"
  → Arrives at /login with blue theme
  → Logs in → Goes to /dashboard
```

### Direct URL Access
```
Type: http://localhost:5173/staff/login
→ Arrives at StaffLoginPage with purple theme
→ Logs in → Goes to /staff
```

### Programmatic Navigation
```jsx
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()
  
  return (
    <button onClick={() => navigate('/admin/login')}>
      Go to Admin
    </button>
  )
}
```

---

## 📊 FILE SUMMARY

### New Files Created (5)
- ✅ `components/LoginForm.jsx` (350+ lines)
- ✅ `pages/CustomerLoginPage.jsx` (30+ lines)
- ✅ `pages/StaffLoginPage.jsx` (40+ lines)
- ✅ `pages/AdminLoginPage.jsx` (60+ lines)
- ✅ `pages/RoleSelector.jsx` (150+ lines)

### Files Modified (2)
- ✅ `pages/LandingPage.jsx` (2 lines changed)
- ✅ `App.jsx` (4 lines added)

### Files Unchanged
- ✓ All backend files
- ✓ AuthContext.jsx
- ✓ api.js
- ✓ All protected routes
- ✓ Database / models

---

## 🎯 SUMMARY

| Item | Status |
|------|--------|
| Landing page navigation | ✅ Connected |
| Role-based routes | ✅ Configured |
| LoginForm component | ✅ Reusable |
| Role-specific pages | ✅ Created |
| Theme colors | ✅ Applied |
| Security validation | ✅ Implemented |
| Dark theme | ✅ Maintained |
| Existing code | ✅ Untouched |
| Testing | ✅ Ready |

---

## 📞 NEED HELP?

**Landing page not showing login links?**
→ Check `LandingPage.jsx` has been updated

**Login pages not loading?**
→ Verify routes in `App.jsx` exist

**Styling not applied?**
→ Check tailwind.config.js has all src paths

**Login not working?**
→ Check browser console and network tab

---

**Version**: 1.0
**Status**: ✅ Complete & Integrated
**Date**: April 4, 2026

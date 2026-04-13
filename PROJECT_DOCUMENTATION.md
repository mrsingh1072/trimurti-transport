# Trimurti Transport - Project Documentation & Package Diagram

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Project Structure](#project-structure)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Dependencies Analysis](#dependencies-analysis)
7. [Data Flow](#data-flow)
8. [Module Interactions](#module-interactions)

---

## Project Overview

**Trimurti Transport** is a comprehensive **Vehicle Rental Management System (VRMS)** built with modern web technologies.

### Key Features
- 🚗 Vehicle Management & Booking
- 💰 Payment Processing (Razorpay Integration)
- 📍 Real-Time Vehicle Tracking
- 📊 Admin Dashboard
- 👤 Multi-Role Access Control (Customer, Staff, Admin)
- 📝 Feedback Management
- 🔄 Return & Late Fee Management
- 📄 Digital Receipts (jsPDF)

### Technology Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB with Mongoose |
| **Real-Time** | Socket.IO, WebSocket |
| **Maps** | Leaflet, React-Leaflet |
| **Payments** | Razorpay API |
| **Authentication** | JWT (JSON Web Tokens) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRIMURTI TRANSPORT SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────┐
│                         │  │                          │  │                  │
│    FRONTEND (React)     │  │   BACKEND (Node/Express) │  │  MONGODB/ATLAS   │
│                         │  │                          │  │                  │
│  ┌────────────────────┐ │  │  ┌────────────────────┐  │  │  ┌────────────┐  │
│  │  User Interface    │ │  │  │  API Routes        │  │  │  │  Schemas   │  │
│  │  - Pages (JSX)     │ │  │  │  - Auth            │  │  │  │  - User    │  │
│  │  - Components      │ │◄──►  - Booking          │  │  │  │  - Booking │  │
│  │  - Services        │ │  │  │  - Payment         │  │  │  │  - Vehicle │  │
│  │  - Context (Auth)  │ │  │  │  - Tracking        │  │  │  │  - Payment │  │
│  └────────────────────┘ │  │  └────────────────────┘  │  │  └────────────┘  │
│                         │  │                          │  │                  │
│  Axios (HTTP)           │  │  Controllers             │  │  Mongoose ODM    │
│  Socket.IO Client       │  │  Services               │  │                  │
│  Leaflet Maps           │  │  Middleware             │  │                  │
│                         │  │  Socket.IO Server       │  │                  │
└─────────────────────────┘  └──────────────────────────┘  └──────────────────┘
         │                              │                           │
         │                              ▼                           │
         │                    ┌──────────────────────┐               │
         │                    │  External Services   │               │
         │                    │  - Razorpay API      │               │
         │                    │  - OpenStreetMap     │               │
         │                    │  - Geolocation API   │               │
         │                    └──────────────────────┘               │
         └──────────────────────────────────────────────────────────┘

```

---

## Project Structure

### Root Directory Organization

```
TrimurtiTransport/
├── backend/                    # Node.js Backend Server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API endpoints
│   │   ├── models/            # MongoDB schemas
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── config/            # Configuration files
│   │   ├── utils/             # Helper functions
│   │   ├── validations/       # Input validation schemas
│   │   ├── seed/              # Database seeding
│   │   └── server.js          # Entry point
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API client services
│   │   ├── context/           # React Context
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilities
│   │   ├── assets/            # Images, fonts
│   │   ├── App.jsx            # Main App component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── _docs/                      # Documentation (50+ guides)
│   ├── DOCUMENTATION_INDEX.md
│   ├── LIVE_TRACKING_*.md
│   ├── FEEDBACK_SYSTEM_*.md
│   ├── AUTH_*.md
│   └── ... (other guides)
│
├── IMPLEMENTATION_SUMMARY.md   # Overall implementation notes
├── TESTING_TRACKING_FIX.md    # Testing guide
├── IMPLEMENTATION_NOTES.md    # Technical details
├── package.json               # Root package
└── README.md                  # Project README
```

---

## Backend Architecture

### Directory Structure

```
backend/src/
├── config/
│   ├── database.js           # MongoDB connection
│   ├── constants.js          # Application constants
│   ├── socket.js             # Socket.IO setup
│   └── environment.js        # Environment variables
│
├── controllers/              # Request Handlers (9 files)
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── bookingController.js  # Booking operations
│   ├── vehicleController.js  # Vehicle management
│   ├── paymentController.js  # Payment handling
│   ├── trackingController.js # Real-time tracking
│   ├── returnController.js   # Vehicle returns
│   ├── feedbackController.js # Feedback handling
│   └── adminController.js    # Admin operations
│
├── routes/                   # API Endpoints (10 files)
│   ├── index.js              # Route aggregator
│   ├── authRoutes.js         # /api/auth
│   ├── userRoutes.js         # /api/users
│   ├── bookingRoutes.js      # /api/bookings
│   ├── vehicleRoutes.js      # /api/vehicles
│   ├── paymentRoutes.js      # /api/payments
│   ├── trackingRoutes.js     # /api/tracking
│   ├── returnRoutes.js       # /api/returns
│   ├── feedbackRoutes.js     # /api/feedback
│   └── adminRoutes.js        # /api/admin
│
├── models/                   # Database Schemas (6 files)
│   ├── User.js               # User schema
│   ├── Vehicle.js            # Vehicle schema
│   ├── Booking.js            # Booking schema
│   ├── Payment.js            # Payment schema
│   ├── VehicleTracking.js    # Tracking schema
│   └── Feedback.js           # Feedback schema
│
├── services/                 # Business Logic (6 files)
│   ├── authService.js        # Auth operations
│   ├── bookingService.js     # Booking logic
│   ├── vehicleService.js     # Vehicle operations
│   ├── paymentService.js     # Payment logic
│   ├── trackingService.js    # Tracking service
│   └── returnService.js      # Return operations
│
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── errorHandler.js       # Error handling
│   └── requestLogger.js      # Request logging
│
├── utils/
│   ├── logger.js             # Logging utility
│   ├── helpers.js            # Helper functions
│   └── validators.js         # Data validation
│
├── validations/
│   └── schemas.js            # Joi validation schemas
│
├── seed/
│   └── seed.js               # Database seeding script
│
└── server.js                 # Express app setup & startup
```

### Backend Dependencies

```
Core Framework:
  ├── express ^4.19.2          # Web server framework
  ├── express-async-errors     # Async error handling
  └── cors ^2.8.5              # Cross-origin requests

Database:
  ├── mongoose ^8.4.1          # MongoDB ODM
  └── mongoDB integration       # Atlas/Local instance

Authentication & Security:
  ├── jsonwebtoken ^9.0.2      # JWT tokens
  ├── bcrypt ^5.1.1            # Password hashing
  ├── helmet ^7.0.0            # Security headers
  ├── express-mongo-sanitize   # NoSQL injection prevention
  └── xss-clean ^0.1.4         # XSS prevention

Real-Time Communication:
  ├── socket.io ^4.8.3         # WebSocket library
  └── socket.io client support

Validation & Data:
  ├── joi ^17.13.1             # Schema validation
  └── yamljs ^0.3.0            # YAML parsing

Utilities:
  ├── morgan ^1.10.0           # HTTP request logger
  ├── dotenv ^16.4.5           # Environment variables
  └── swagger-ui-express       # API documentation

Development:
  ├── nodemon ^3.1.0           # Auto-restart on file changes
  ├── jest ^29.7.0             # Testing framework
  ├── supertest ^6.3.4         # HTTP testing
  └── npm scripts               # start, dev, test, seed
```

---

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── pages/                    # Page Components (20+ files)
│   ├── LandingPage.jsx       # Public landing
│   ├── LoginPage.jsx         # Generic login
│   ├── CustomerLoginPage.jsx # Customer auth
│   ├── AdminLoginPage.jsx    # Admin auth
│   ├── StaffLoginPage.jsx    # Staff auth
│   ├── RegisterPage.jsx      # Registration
│   ├── RoleSelector.jsx      # Role selection
│   ├── DashboardPage.jsx     # Main dashboard (NEW: Live Tracking)
│   ├── TrackingPage.jsx      # Vehicle tracking (UPDATED)
│   ├── TripTrackingPage.jsx  # Trip tracking
│   ├── VehiclesPage.jsx      # Vehicle listing
│   ├── CustomerVehiclesPage.jsx # Customer vehicles
│   ├── BookingsPage.jsx      # Bookings management
│   ├── MyBookingsPage.jsx    # Customer bookings
│   ├── ReturnsPage.jsx       # Return management
│   ├── PaymentsPage.jsx      # Payment history
│   ├── FeedbackPage.jsx      # Feedback submission
│   ├── HistoryPage.jsx       # Booking history
│   ├── ProfilePage.jsx       # User profile
│   ├── AdminPage.jsx         # Admin dashboard
│   └── admin/*.jsx           # Admin sub-pages

├── components/               # Reusable Components (40+)
│   ├── Layout Components
│   │   ├── AdminLayout.jsx   # Admin page wrapper
│   │   ├── DashboardLayout.jsx # Dashboard wrapper
│   │   └── Navbar.jsx        # Navigation bar
│   │
│   ├── Route Protection
│   │   ├── AdminRoute.jsx    # Admin guard
│   │   ├── CustomerRoute.jsx # Customer guard
│   │   └── AdminStaffRoute.jsx # Admin/Staff guard
│   │
│   ├── Tracking Components (UPDATED)
│   │   ├── LiveTrackingMap.jsx # Map display (ENHANCED)
│   │   ├── EnhancedLiveTrackingMap.jsx # Alternative map
│   │   ├── LiveTracking.jsx  # Tracking widget
│   │   └── LocationSharingToggle.jsx # Sharing toggle
│   │
│   ├── Forms & Modals
│   │   ├── LoginForm.jsx     # Login form
│   │   ├── BookingModal.jsx  # Booking creation
│   │   ├── PaymentCheckoutModal.jsx # Payment
│   │   ├── FeedbackModal.jsx # Feedback form
│   │   ├── AddVehicleModal.jsx # Vehicle creation
│   │   ├── EditVehicleModal.jsx # Vehicle editing
│   │   ├── EditBookingModal.jsx # Booking editing
│   │   └── ConfirmDialog.jsx # Confirmation dialog
│   │
│   ├── Data Display
│   │   ├── Card.jsx          # Generic card
│   │   ├── GlassCard.jsx     # Glass morphism card
│   │   ├── FeedbackCard.jsx  # Feedback card
│   │   ├── FeedbackList.jsx  # Feedback list
│   │   └── StatusIndicator.jsx # Status badge
│   │
│   └── Other
│       ├── ProtectedRoute.jsx
│       ├── LoadingSpinner.jsx
│       └── ErrorBoundary.jsx

├── services/                 # API & Business Logic
│   ├── api.js                # Axios client + all endpoints
│   ├── trackingService.js    # Tracking-specific service
│   └── authService.js        # Auth helper
│
├── context/                  # Global State Management
│   └── AuthContext.jsx       # User authentication context
│
├── hooks/                    # Custom React Hooks
│   ├── useAuth.js            # Auth hook
│   ├── useNavigation.js      # Navigation helpers
│   └── useTracking.js        # Tracking hook
│
├── utils/                    # Utility Functions
│   ├── formatters.js         # Data formatting
│   ├── validators.js         # Input validation
│   ├── dateUtils.js          # Date operations
│   └── constants.js          # App constants
│
├── assets/                   # Static Assets
│   ├── images/               # Image files
│   ├── icons/                # Icon files
│   └── fonts/                # Font files
│
├── App.jsx                   # Main app component + routing
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

### Frontend Dependencies

```
Core Framework:
  ├── react ^18.2.0           # UI library
  ├── react-dom ^18.2.0       # DOM rendering
  └── react-router-dom ^7.13.2 # Client routing

HTTP & Real-Time:
  ├── axios ^1.14.0           # HTTP client
  └── socket.io-client ^4.8.3  # WebSocket client

UI & Styling:
  ├── tailwindcss ^3.3.6      # Utility CSS framework
  ├── lucide-react ^0.292.0   # Icon library
  ├── framer-motion ^12.38.0  # Animation library
  ├── recharts ^2.15.4        # Charting library
  └── tailwindcss utilities   # Responsive design

Maps & Location:
  ├── leaflet ^1.9.4          # Map library
  └── react-leaflet ^4.2.1    # React wrapper

Document Generation:
  ├── jspdf ^4.2.1            # PDF generation
  ├── html2pdf.js ^0.14.0     # HTML to PDF
  └── html2canvas ^1.4.1      # Canvas rendering

Build & Development:
  ├── vite ^5.0.8             # Build tool
  ├── @vitejs/plugin-react    # React plugin
  ├── postcss ^8.4.32         # CSS processing
  ├── autoprefixer ^10.4.16   # CSS vendor prefixes
  └── npm scripts              # dev, build, preview
```

---

## Dependencies Analysis

### Backend Dependencies Tree

```
Express Server
├── HTTP Server
│   ├── CORS
│   ├── Helmet (Security)
│   ├── Morgan (Logging)
│   └── Body Parser (Built-in)
│
├── Database Layer
│   ├── Mongoose (ODM)
│   │   └── MongoDB Driver
│   └── Models (6 schemas)
│
├── Real-Time Communication
│   ├── Socket.IO
│   │   └── WebSocket Protocol
│   └── Event Emitters
│
├── Authentication
│   ├── JWT (jsonwebtoken)
│   ├── Bcrypt (Password Hashing)
│   └── Middleware Protection
│
├── Security Middleware
│   ├── Helmet
│   ├── xss-clean
│   ├── express-mongo-sanitize
│   └── CORS Policy
│
├── Data Validation
│   ├── Joi Schemas
│   └── Custom Validators
│
└── Utility Libraries
    ├── dotenv (Config)
    ├── yamljs (YAML parsing)
    └── morgan (Request logging)
```

### Frontend Dependencies Tree

```
React Application
├── UI Components
│   ├── React Core
│   ├── React Router (Navigation)
│   │   └── Page Routing
│   └── Component Hierarchy
│
├── State Management
│   ├── React Context API
│   │   └── Auth Context
│   └── Component State
│
├── Styling & Layout
│   ├── Tailwind CSS
│   ├── PostCSS Processing
│   ├── Autoprefixer
│   └── Custom CSS
│
├── Information Visualization
│   ├── Leaflet Maps
│   │   └── React-Leaflet
│   └── Recharts (Data Viz)
│
├── HTTP Communication
│   ├── Axios
│   │   └── API Client
│   └── Socket.IO Client
│
├── Rich Interface
│   ├── Framer Motion (Animations)
│   ├── Lucide React (Icons)
│   └── Custom Components
│
├── Document Generation
│   ├── jsPDF
│   ├── html2canvas
│   └── html2pdf.js
│
└── Build & Development
    ├── Vite
    ├── React Plugin
    ├── Build Optimization
    └── Development Server
```

---

## Data Flow

### Request-Response Cycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA FLOW ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────┘

USER ACTION (Frontend)
    ↓
    └─→ React Event Handler
         ↓
         └─→ Service Function (axios call)
              ↓
              └─→ HTTP POST/GET/PUT/DELETE
                   ↓
                   ├─────────────────────────────────────────────────→ CORS Check
                   │
                   └─→ BACKEND
                        ↓
                        └─→ Express Route Matching
                             ↓
                             └─→ Middleware Chain
                                  ├─→ Auth Middleware (JWT verify)
                                  ├─→ Authorization Check
                                  ├─→ Input Validation (Joi)
                                  ├─→ Request Logging
                                  └─→ Sanitization
                                       ↓
                                       └─→ Controller
                                            ↓
                                            └─→ Business Logic Layer (Service)
                                                 ↓
                                                 └─→ Database Query
                                                      ↓
                                                      └─→ MongoDB
                                                           ↓
                                                      (CRUD Operations)
                                                           ↓
                                                      Response

                        DATABASE
                             ↓
                        Response Processing
                             ↓
                        Error Handling
                             ↓
                        JSON Serialization
                             ↓
                        Response Headers

HTTP Response (200/400/500 + JSON)
    ↓
Frontend Axios Interceptor
    ↓
Service Layer Processing
    ↓
React State Update (setState)
    ↓
Component Re-render
    ↓
UI Update
    ↓
USER SEES RESULT
```

### Real-Time Data Flow (Tracking)

```
┌─────────────────────────────────────────────────────────────────────┐
│            REAL-TIME TRACKING DATA FLOW (Socket.IO)                 │
└─────────────────────────────────────────────────────────────────────┘

VEHICLE CLIENT (Driver)
    │
    ├─→ GPS Geolocation API
    │        ↓
    │   lat, lng, speed, accuracy
    │        ↓
    └─→ Socket.emit('location-update')
         ↓
    WebSocket Connection
         ↓
    BACKEND Socket Handler
         ↓
    ├─→ Validate Location Data
    ├─→ Update VehicleTracking Model
    ├─→ Update Booking.currentLocation
    └─→ Broadcast to Tracked Admins
         ↓
    ADMIN/STAFF CLIENT
         ↓
    ├─→ Socket.on('vehicle-updated')
    ├─→ Update Component State
    ├─→ Re-render Map
    └─→ Display New Position
         ↓
    USER SEES LIVE VEHICLE POSITION
```

---

## Module Interactions

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION MODULE                         │
└──────────────────────────────────────────────────────────────────┘

LOGIN REQUEST
    ↓
authController.login()
    ↓
authService.authenticateUser()
    │
    ├─→ User.findOne({email})
    ├─→ bcrypt.compare(password, hash)
    ├─→ JWT Sign (user payload)
    └─→ Return token + user data
    ↓
Response with Token
    ↓
FRONTEND: Store in localStorage
    ↓
FUTURE REQUESTS
    ↓
Authorization Header: Bearer {TOKEN}
    ↓
authMiddleware.protect()
    │
    ├─→ Extract token from header
    ├─→ JWT verify
    ├─→ Add user to req.user
    └─→ Next middleware
    ↓
AUTHORIZED REQUEST PROCEEDS
```

### Booking & Payment Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              BOOKING & PAYMENT INTERACTION                       │
└──────────────────────────────────────────────────────────────────┘

CUSTOMER BOOKING REQUEST
    ↓
bookingController.createBooking()
    ↓
bookingService.validateBooking()
    │
    ├─→ Check vehicle availability
    ├─→ Check duration
    └─→ Calculate price
    ↓
paymentController.createPaymentOrder()
    ↓
paymentService.initializeRazorpay()
    │
    ├─→ Call Razorpay API
    ├─→ Get order ID
    └─→ Send to frontend
    ↓
FRONTEND: Display Razorpay Checkout
    ↓
CUSTOMER: Complete Payment
    ↓
paymentController.verifyPayment()
    ↓
paymentService.verifySignature()
    │
    ├─→ Verify Razorpay signature
    ├─→ Create Payment record
    └─→ Update Booking status
    ↓
BOOKING CONFIRMED
    ↓
Send Confirmation Email/Notification
    ↓
enableLocationSharing() (Tracking Enabled)
```

### Vehicle Tracking Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                VEHICLE TRACKING INTERACTION                      │
└──────────────────────────────────────────────────────────────────┘

DRIVER ENABLES LOCATION SHARING
    ↓
trackingController.enableLocationSharing()
    ↓
trackingService.initializeTracking()
    │
    ├─→ Create VehicleTracking document
    ├─→ Set locationSharingEnabled = true
    └─→ Update Booking.isTracking = true
    ↓
DRIVER STARTS JOURNEY
    ↓
FRONTEND: Start Geolocation Watch
    ↓
PERIODIC LOCATION UPDATES
    ↓
Socket.emit('location-update')
    ↓
BACKEND Socket Handler
    ↓
trackingService.updateLocation()
    │
    ├─→ Create LocationHistory entry
    ├─→ Update VehicleTracking.currentLocation
    ├─→ Calculate speed, distance
    └─→ Broadcast to admin
    ↓
ADMIN DASHBOARD
    ↓
GET /api/tracking/live
    ↓
trackingController.getLiveTracking()
    ↓
Fetch all Bookings with isTracking=true
    ↓
Populate user, vehicle, location data
    ↓
Return consistent response format
    ↓
DISPLAY ON DASHBOARD & MAP
```

### Return & Fine Management

```
┌──────────────────────────────────────────────────────────────────┐
│            RETURN & FINE MANAGEMENT INTERACTION                  │
└──────────────────────────────────────────────────────────────────┘

CUSTOMER REQUESTS RETURN
    ↓
bookingController.requestReturn()
    ↓
Booking.returnStatus = 'requested'
    ↓
STAFF REVIEWS & PROCESSES
    ↓
returnController.processReturn()
    │
    ├─→ Check return date
    ├─→ Calculate late fees
    ├─→ Check vehicle damage
    └─→ Calculate damage fees
    ↓
paymentService.calculateFines()
    ↓
CREATE Fine Payment Order
    ↓
IF LATE OR DAMAGED
    ↓
CUSTOMER PAYS FINE (Razorpay)
    ↓
OR
    ↓
REQUEST WAIVER
    ↓
ADMIN APPROVES/REJECTS
    ↓
Update Booking.finalAmount
    ↓
TRIP COMPLETED
```

---

## Component Hierarchy - Frontend

```
App.jsx (Root)
│
├─→ AuthContext Provider
│
├─→ Routes
│   │
│   ├─→ PUBLIC ROUTES
│   │   ├─→ LandingPage
│   │   ├─→ LoginPage
│   │   ├─→ RegisterPage
│   │   ├─→ CustomerLoginPage
│   │   ├─→ AdminLoginPage
│   │   └─→ StaffLoginPage
│   │
│   ├─→ PROTECTED ROUTES (AuthRoute)
│   │   │
│   │   ├─→ CUSTOMER ROUTES
│   │   │   ├─→ DashboardPage
│   │   │   │   ├─→ Card (Stats)
│   │   │   │   ├─→ BookingsList
│   │   │   │   └─→ QuickActions
│   │   │   ├─→ VehiclesPage
│   │   │   ├─→ MyBookingsPage
│   │   │   ├─→ TrackingPage (UPDATED)
│   │   │   │   ├─→ LiveTrackingMap (ENHANCED)
│   │   │   │   └─→ VehicleSidebar
│   │   │   ├─→ ProfilePage
│   │   │   └─→ FeedbackPage
│   │   │
│   │   ├─→ STAFF ROUTES
│   │   │   ├─→ DashboardPage (Live Tracking Tab)
│   │   │   ├─→ BookingsPage
│   │   │   ├─→ ReturnsPage
│   │   │   ├─→ TrackingPage
│   │   │   └─→ AdminLayout
│   │   │
│   │   └─→ ADMIN ROUTES
│   │       ├─→ AdminLayout
│   │       ├─→ AdminPage (Dashboard)
│   │       ├─→ VehicleManagement
│   │       ├─→ UsersPage
│   │       ├─→ PaymentsPage
│   │       ├─→ WaiverManagement
│   │       └─→ TrackingPage (All Vehicles)
```

---

## API Endpoints Architecture

### Authentication (Auth)
```
POST   /api/auth/register        # User registration
POST   /api/auth/login           # User login
POST   /api/auth/logout          # Logout
GET    /api/auth/verify          # Verify token
POST   /api/auth/refresh         # Refresh token
```

### Users (User Management)
```
GET    /api/users                # Get all users (admin)
GET    /api/users/:id            # Get user profile
PUT    /api/users/:id            # Update profile
GET    /api/users/role/:role     # Get users by role
```

### Vehicles (Vehicle Management)
```
GET    /api/vehicles             # List all vehicles
GET    /api/vehicles/:id         # Get vehicle details
POST   /api/vehicles             # Create vehicle (admin)
PUT    /api/vehicles/:id         # Update vehicle
DELETE /api/vehicles/:id         # Delete vehicle
GET    /api/vehicles/available   # Get available vehicles
```

### Bookings (Booking Management)
```
GET    /api/bookings             # Get all bookings
GET    /api/bookings/:id         # Get booking details
POST   /api/bookings             # Create booking
PUT    /api/bookings/:id         # Update booking
DELETE /api/bookings/:id         # Cancel booking
GET    /api/bookings/user/:userId # Get user bookings
GET    /api/bookings/stats       # Booking statistics
```

### Payments (Payment Processing)
```
GET    /api/payments             # Get all payments
POST   /api/payments/order       # Create payment order
POST   /api/payments/verify      # Verify payment
GET    /api/payments/:id         # Get payment details
GET    /api/payments/booking/:bookingId # Booking payments
```

### Tracking (Live Vehicle Tracking)
```
GET    /api/tracking/live        # Get all active tracking (UPDATED)
GET    /api/tracking/:bookingId  # Get booking tracking
POST   /api/:bookingId/location  # Update vehicle location
POST   /api/:bookingId/location-sharing/enable  # Enable tracking
POST   /api/:bookingId/location-sharing/disable # Disable tracking
```

### Returns (Vehicle Returns)
```
POST   /api/returns/:bookingId    # Request return
GET    /api/returns               # Get all returns
PUT    /api/returns/:bookingId    # Process return
GET    /api/returns/pending       # Get pending returns
```

### Feedback (Feedback Management)
```
GET    /api/feedback              # Get all feedback
GET    /api/feedback/:id          # Get feedback details
POST   /api/feedback              # Submit feedback
PUT    /api/feedback/:id          # Update feedback
DELETE /api/feedback/:id          # Delete feedback
```

### Admin (Admin Operations)
```
GET    /api/admin/dashboard       # Admin dashboard stats
GET    /api/admin/analytics       # Analytics data
POST   /api/admin/users/:id/approve # Approve staff
GET    /api/admin/reports         # Generate reports
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                           │
└─────────────────────────────────────────────────────────────────────┘

User Collection
├─ _id: ObjectId (Primary Key)
├─ name, email, phone
├─ role: 'customer' | 'staff' | 'admin'
├─ passwordHash
├─ isApproved (for staff)
└─ timestamps

    ↑         ↑                  ↑
    │         │                  │
    │         │                  └─────────────────┐
    │         └──────────────────────────────┐     │
    │                                        │     │
Vehicle Collection                  Booking Collection
├─ _id                              ├─ _id
├─ name, model                      ├─ user (Ref: User)
├─ registrationNumber               ├─ vehicle (Ref: Vehicle)
├─ type, capacity                   ├─ startDate, endDate
├─ pricePerDay                      ├─ totalPrice
├─ isAvailable                      ├─ status, paymentStatus
└─ timestamps                       ├─ currentLocation
                                    ├─ isTracking
                                    └─ timestamps
                                    
    ├─ returnStatus
    ├─ actualReturnDate
    ├─ lateFee, damageFee
    └─ paymentId (Ref: Payment)

Payment Collection
├─ _id
├─ booking (Ref: Booking)
├─ amount, status
├─ razorpayOrderId
├─ razorpayPaymentId
└─ timestamps

VehicleTracking Collection
├─ _id
├─ booking (Ref: Booking)
├─ vehicle (Ref: Vehicle)
├─ currentLocation: {lat, lng}
├─ locationHistory: [{lat, lng, timestamp}]
├─ status, speed, distance
├─ locationSharingEnabled
└─ timestamps

Feedback Collection
├─ _id
├─ booking (Ref: Booking)
├─ user (Ref: User)
├─ rating: 1-5
├─ comment
└─ timestamps
```

---

## Environment Configuration

### Backend (.env)
```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Feature Flags
VITE_ENABLE_TRACKING=true
VITE_ENABLE_FEEDBACK=true

# External APIs
VITE_RAZORPAY_KEY_ID=your_key_id
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Frontend (CDN)  │
│  - React Build   │
│  - Static Assets │
│  - CSS/JS        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│   Cloud Hosting (Vercel)     │
│   - Next.js or React Deploy  │
│   - Auto-scaling             │
│   - SSL/HTTPS                │
└────────┬─────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│     API Gateway / Load Balancer    │
│     - Route optimization           │
│     - SSL Termination              │
│     - Rate limiting                │
└────────┬───────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│   Backend Server (Heroku)    │
│   - Node.js Express          │
│   - Docker Container         │
│   - Environment Variables    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│   Database (MongoDB Atlas)   │
│   - Cloud-hosted             │
│   - Automated Backups        │
│   - Scalable                 │
└──────────────────────────────┘
```

---

## Summary Table

| Component | Type | Purpose | Status |
|-----------|------|---------|--------|
| Frontend | React 18 + Vite | User interface | Active |
| Backend | Express.js + Socket.IO | API & Real-time | Active |
| Database | MongoDB + Mongoose | Data persistence | Active |
| Authentication | JWT + Bcrypt | Security layer | Active |
| Payment | Razorpay API | Payment processing | Integrated |
| Tracking | Socket.IO + Leaflet | Real-time tracking | Enhanced |
| Documentation | Markdown | Project docs | Comprehensive |

---

## Quick Start Commands

```bash
# Backend Setup
cd backend
npm install
npm run dev                    # Start development server

# Frontend Setup
cd frontend
npm install
npm run dev                    # Start development server

# Production Build
npm run build                  # Build optimized bundle
npm run preview               # Preview production build

# Database Seeding
npm run seed                   # Populate test data

# Testing
npm test                       # Run test suite
```

---

**Generated:** April 13, 2026  
**Project:** Trimurti Transport VRMS  
**Version:** 1.0.0

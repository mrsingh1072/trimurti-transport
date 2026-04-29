# Trimurti Transport - Vehicle Rental Management System (VRMS)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Database Models](#database-models)
10. [User Roles & Permissions](#user-roles--permissions)
11. [Key Features Explained](#key-features-explained)
12. [Project Structure](#project-structure)
13. [Contributing Guidelines](#contributing-guidelines)
14. [Troubleshooting](#troubleshooting)
15. [License](#license)

---

## Project Overview

**Trimurti Transport** is an enterprise-grade **Vehicle Rental Management System (VRMS)** designed to streamline vehicle rentals for commercial and personal use. The platform provides a complete ecosystem for managing vehicles, bookings, payments, returns, and customer interactions with role-based access control and real-time tracking capabilities.

### Key Highlights

- ✅ **Multi-role system**: Customer, Staff, and Admin dashboards
- ✅ **Real-time tracking**: Socket.IO integration for live vehicle tracking
- ✅ **Payment integration**: Razorpay for secure payment processing
- ✅ **Advanced booking**: Automatic overlap prevention and dynamic pricing
- ✅ **Return management**: Late fees and damage charge calculation
- ✅ **Feedback system**: Customer satisfaction tracking
- ✅ **Premium UI**: Glass-morphic design with dark theme
- ✅ **Fully responsive**: Works seamlessly on desktop and mobile

---

## Features

### 🚗 Core Features

1. **Vehicle Management**
   - CRUD operations for vehicles
   - Multiple vehicle categories (Car, Bike, Truck, Bus, Tractor, JCB)
   - Availability tracking
   - Condition monitoring (Excellent, Good, Fair)
   - Location-based filtering

2. **Booking System**
   - Create and manage vehicle bookings
   - Automatic overlap detection to prevent double bookings
   - Duration-based pricing (hourly or daily rates)
   - Soft delete functionality for audit trail

3. **Payment Processing**
   - Razorpay integration for online payments
   - Payment status tracking (Pending, Completed, Failed)
   - Payment signature verification
   - Secure transaction handling

4. **Return Management**
   - Process vehicle returns
   - Automatic late fee calculation (50% of daily price per late day)
   - Damage charge assessment
   - Final amount computation

5. **Real-time Tracking**
   - Live GPS tracking of vehicles
   - WebSocket-based real-time updates via Socket.IO
   - Trip history and analytics
   - Location-based insights

6. **Customer Feedback**
   - Star rating system (1-5 stars)
   - Detailed feedback collection
   - Admin review and response capability

### 👥 User Management

1. **Authentication & Authorization**
   - JWT-based token authentication
   - Role-based access control (RBAC)
   - User status management (Pending, Active, Rejected)

2. **User Roles**
   - **Customer**: Browse vehicles, make bookings, pay online, view bookings
   - **Staff**: Manage vehicles, process bookings and returns, handle payments
   - **Admin**: Full system access, user management, analytics, system configuration

### 🎁 Advanced Features

1. **Promotions & Discounts**
   - Coupon system with code-based discounts
   - Festival offers and seasonal promotions
   - Referral rewards program
   - Discount analytics and tracking

2. **Wallet & Credits**
   - Customer wallet management
   - Wallet credit accumulation through referrals and promotions
   - Wallet-based payments

3. **Analytics Dashboard**
   - Real-time revenue tracking
   - Top-performing vehicles
   - Booking statistics
   - Payment analytics

---

## Tech Stack

### Backend

| Technology     | Version  | Purpose                 |
| -------------- | -------- | ----------------------- |
| **Node.js**    | v25.1.0  | JavaScript runtime      |
| **Express.js** | ^4.19.2  | Web framework           |
| **MongoDB**    | Latest   | NoSQL database          |
| **Mongoose**   | ^8.4.1   | MongoDB ODM             |
| **JWT**        | ^9.0.2   | Authentication tokens   |
| **bcryptjs**   | ^2.4.3   | Password hashing        |
| **Razorpay**   | ^2.9.6   | Payment gateway         |
| **Socket.IO**  | ^4.8.3   | Real-time communication |
| **Joi**        | ^17.13.1 | Data validation         |
| **Helmet**     | ^7.0.0   | Security headers        |
| **CORS**       | ^2.8.5   | Cross-origin requests   |
| **Morgan**     | ^1.10.0  | HTTP logging            |
| **Swagger**    | ^5.0.1   | API documentation       |
| **Jest**       | ^29.7.0  | Testing framework       |
| **Nodemon**    | ^3.1.0   | Development auto-reload |

### Frontend

| Technology        | Version  | Purpose                 |
| ----------------- | -------- | ----------------------- |
| **React**         | ^18.2.0  | UI library              |
| **Vite**          | ^5.0.8   | Build tool & dev server |
| **React Router**  | ^7.13.2  | Client-side routing     |
| **Tailwind CSS**  | ^3.3.6   | Utility-first CSS       |
| **Axios**         | ^1.14.0  | HTTP client             |
| **Recharts**      | ^2.15.4  | Data visualization      |
| **jsPDF**         | ^4.2.1   | PDF generation          |
| **html2canvas**   | ^1.4.1   | Canvas rendering        |
| **Framer Motion** | ^12.38.0 | Animation library       |
| **Lucide React**  | ^0.292.0 | Icon library            |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React + Vite)             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │  Customer    │   Staff      │   Admin      │            │
│  │  Dashboard   │   Dashboard  │   Dashboard  │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                          ↓ (HTTP/WebSocket)                │
│                   Proxy to Backend (5001)                   │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│               Backend Layer (Express + Node.js)            │
│  ┌──────────────────────────────────────────────────┐      │
│  │  API Routes                                      │      │
│  │  /auth, /vehicles, /bookings, /payments, etc    │      │
│  └──────────────────────────────────────────────────┘      │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Middleware                                      │      │
│  │  Auth, Authorization, Error Handling, Logging   │      │
│  └──────────────────────────────────────────────────┘      │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Controllers                                     │      │
│  │  Business Logic & Request Handling               │      │
│  └──────────────────────────────────────────────────┘      │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Models & Services                               │      │
│  │  Data Models, Business Services                  │      │
│  └──────────────────────────────────────────────────┘      │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Socket.IO (Real-time Tracking & Updates)       │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│            Data Layer (MongoDB + Mongoose)                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Collections:                                    │      │
│  │  - Users, Vehicles, Bookings, Payments         │      │
│  │  - Returns, Feedback, VehicleTracking          │      │
│  │  - Coupons, Wallets, Analytics                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites

- **Node.js** v14+ (v25.1.0+ recommended)
- **npm** v6+
- **MongoDB** Atlas account or local MongoDB instance
- **Razorpay** account (for payment testing)
- **Git** for version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/mrsingh1072/trimurti-transport.git
cd trimurti-transport
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify installation (should see nodemon executable)
chmod +x node_modules/.bin/*
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

---

## Environment Configuration

### Backend `.env` File

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trimurti_transport?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_very_secret_jwt_key_change_this
JWT_EXPIRES_IN=1d

# Razorpay Configuration (get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### Environment Variables Explanation

| Variable              | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `PORT`                | Backend server port (default: 5001)                          |
| `NODE_ENV`            | Environment mode (development/production/test)               |
| `MONGO_URI`           | MongoDB connection string with credentials                   |
| `JWT_SECRET`          | Secret key for signing JWT tokens (use strong random string) |
| `JWT_EXPIRES_IN`      | JWT token expiration time (e.g., "1d" = 1 day)               |
| `RAZORPAY_KEY_ID`     | Razorpay public key for test/live payments                   |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key for signature verification               |

### Getting Razorpay Credentials

1. Sign up at [Razorpay](https://razorpay.com)
2. Navigate to **Settings → API Keys**
3. Copy your **Key ID** and **Key Secret**
4. Use **Test Keys** during development

---

## Running the Application

### Option 1: Run Backend & Frontend Separately (Recommended)

#### Terminal 1 - Start Backend

```bash
cd backend
npm install  # Run only if dependencies aren't installed
npm start    # Production mode
# OR
npm run dev  # Development mode with auto-reload
```

**Expected output:**

```
🔧 [SERVER] Environment Configuration:
   - PORT: 5001
   - MONGO_URI: ✅ Set
   - JWT_SECRET: ✅ Set
   - RAZORPAY_KEY_ID: ✅ rzp_test_SYC7Y1...

MongoDB connected: ac-wupz2su-shard-00-02.jjskig9.mongodb.net

🚀 Server running on port 5001
📡 Socket.IO ready for real-time tracking
```

#### Terminal 2 - Start Frontend

```bash
cd frontend
npm install  # Run only if dependencies aren't installed
npm run dev
```

**Expected output:**

```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Option 2: Database Seeding (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This will create:

- Sample users (Customer, Staff, Admin)
- Sample vehicles with various categories
- Sample bookings and payments

### Accessing the Application

| Component            | URL                            |
| -------------------- | ------------------------------ |
| Frontend Application | http://localhost:5173          |
| Backend API          | http://localhost:5001          |
| Swagger API Docs     | http://localhost:5001/api/docs |
| Health Check         | http://localhost:5001/health   |

---

## API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "customer"  // or "staff"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "email": "john@example.com",
    "role": "customer",
    "status": "active"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Vehicle Endpoints

#### Get All Vehicles

```http
GET /api/vehicles?category=Car&location=Mumbai&availability=true
Authorization: Bearer {token}

Response: 200 OK
{
  "vehicles": [
    {
      "_id": "...",
      "name": "Honda City",
      "category": "Car",
      "pricePerDay": 2500,
      "availability": true,
      "location": "Mumbai",
      "condition": "Excellent"
    }
  ]
}
```

#### Create Vehicle (Staff/Admin Only)

```http
POST /api/vehicles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Maruti Suzuki Swift",
  "category": "Car",
  "pricePerDay": 2000,
  "location": "Mumbai",
  "condition": "Good"
}

Response: 201 Created
```

### Booking Endpoints

#### Create Booking

```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "vehicleId": "...",
  "startDate": "2026-05-01T10:00:00Z",
  "endDate": "2026-05-05T10:00:00Z",
  "durationType": "days",
  "durationValue": 4
}

Response: 201 Created
{
  "booking": {
    "_id": "...",
    "status": "confirmed",
    "totalPrice": 8000,
    "paymentStatus": "pending"
  }
}
```

#### Get My Bookings

```http
GET /api/bookings/my-bookings
Authorization: Bearer {token}

Response: 200 OK
```

### Payment Endpoints

#### Create Payment Order

```http
POST /api/payments/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "...",
  "amount": 8000
}

Response: 201 Created
{
  "orderId": "order_...",
  "paymentId": "...",
  "amount": 800000,  // in paise
  "key": "rzp_test_..."
}
```

#### Verify Payment

```http
POST /api/payments/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "...",
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}

Response: 200 OK
```

### Return Endpoints

#### Request Return

```http
POST /api/returns/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "..."
}

Response: 201 Created
```

#### Process Return (Staff/Admin)

```http
POST /api/returns/:returnId/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "actualReturnDate": "2026-05-05T12:00:00Z",
  "damageDescription": "Minor scratches on bumper",
  "damageFee": 500
}

Response: 200 OK
```

### Complete API Documentation

For complete API documentation with all endpoints, request/response formats, and error codes:

**Visit:** `http://localhost:5001/api/docs` (when backend is running)

This provides interactive Swagger documentation where you can test all endpoints.

---

## Database Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  phone: String,
  role: String (enum: 'customer', 'staff', 'admin'),
  status: String (enum: 'pending', 'active', 'rejected'),
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  category: String (enum: 'Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB'),
  pricePerDay: Number (min: 500),
  availability: Boolean (default: true),
  condition: String (enum: 'Excellent', 'Good', 'Fair'),
  location: String (required, indexed),
  isDeleted: Boolean (soft delete),
  deletedBy: ObjectId (ref: User),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  vehicle: ObjectId (ref: Vehicle, required),
  startDate: Date (required),
  endDate: Date (required),
  durationType: String (enum: 'hours', 'days'),
  durationValue: Number,
  totalPrice: Number (required),
  status: String (enum: 'pending', 'confirmed', 'ongoing', 'cancelled', 'completed'),
  paymentStatus: String (enum: 'pending', 'paid', 'failed'),
  lateFee: Number (default: 0),
  damageFee: Number (default: 0),
  finalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  booking: ObjectId (ref: Booking),
  amount: Number (required),
  status: String (enum: 'pending', 'completed', 'failed'),
  method: String (e.g., 'upi', 'card'),
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### VehicleTracking Model

```javascript
{
  _id: ObjectId,
  vehicle: ObjectId (ref: Vehicle),
  booking: ObjectId (ref: Booking),
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  speed: Number,
  heading: Number,
  isActive: Boolean,
  lastUpdate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  booking: ObjectId (ref: Booking, required),
  rating: Number (1-5, required),
  comments: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## User Roles & Permissions

### 1. Customer

**Permissions:**

- ✅ Browse all available vehicles
- ✅ Create bookings
- ✅ Make online payments via Razorpay
- ✅ Request vehicle returns
- ✅ View booking history
- ✅ Submit feedback and ratings
- ✅ Access personal dashboard

**Restrictions:**

- ❌ Cannot manage vehicles
- ❌ Cannot access admin features
- ❌ Cannot process payments for other users

### 2. Staff

**Permissions:**

- ✅ All customer permissions
- ✅ Create and manage vehicles
- ✅ View and manage bookings
- ✅ Process vehicle returns
- ✅ Process payments
- ✅ Assign damage fees and late fees
- ✅ Access staff dashboard

**Restrictions:**

- ❌ Cannot access admin features
- ❌ Cannot manage user roles
- ❌ Cannot view system analytics

### 3. Admin

**Permissions:**

- ✅ Full system access
- ✅ All staff permissions
- ✅ Manage user roles and status
- ✅ View system analytics
- ✅ Manage promotions and coupons
- ✅ Access admin dashboard
- ✅ Generate reports
- ✅ Configure system settings

**Restrictions:**

- None (full access)

---

## Key Features Explained

### 🔐 Authentication & Authorization

The system uses **JWT (JSON Web Tokens)** for stateless authentication:

1. **Token Generation**: Upon login/registration, a JWT token is issued containing user ID, role, and status
2. **Token Validation**: Each protected route verifies the token before granting access
3. **Role-Based Access**: Routes are protected by middleware that checks user role

**Flow:**

```
User → Login → JWT Token Generated → Stored in localStorage →
Sent with every API request → Verified by backend → Access Granted/Denied
```

### 📅 Booking System

The booking system includes advanced features:

1. **Overlap Prevention**: Automatically checks if the vehicle is available during requested dates
2. **Dynamic Pricing**: Calculates total price based on:
   - Vehicle daily/hourly rate
   - Duration (hours or days)
   - Applicable discounts/coupons

3. **Booking Workflow**:
   ```
   Create Booking → Payment Required → Process Payment →
   Booking Confirmed → Vehicle Picked Up → Return → Fees Calculated → Complete
   ```

### 💳 Payment Processing

Razorpay integration ensures secure payment handling:

1. **Order Creation**: Backend creates Razorpay order with booking details
2. **Client-Side Processing**: Frontend redirects to Razorpay checkout
3. **Signature Verification**: Backend verifies payment signature for security
4. **Transaction Recording**: Payment details stored in database

### 📍 Real-Time Tracking

Socket.IO enables live vehicle tracking:

1. **Location Updates**: Vehicle GPS updates pushed to connected clients
2. **WebSocket Connection**: Establishes persistent connection between frontend and backend
3. **Real-time Map**: Interactive map shows vehicle location in real-time

### 🎁 Discount & Coupon System

Flexible promotion management:

1. **Coupon Creation**: Admins create promo codes with validity periods
2. **Usage Tracking**: Tracks coupon usage and prevents abuse
3. **Dynamic Discounts**: Calculates discounts based on coupon rules

---

## Project Structure

```
trimurti-transport/
│
├── backend/
│   ├── src/
│   │   ├── server.js              # Main server file
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── constants.js       # Application constants
│   │   │   ├── swagger.js         # Swagger configuration
│   │   │   └── socket.js          # Socket.IO setup
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── vehicleController.js
│   │   │   ├── bookingController.js
│   │   │   ├── paymentController.js
│   │   │   ├── returnController.js
│   │   │   ├── feedbackController.js
│   │   │   ├── trackingController.js
│   │   │   ├── adminController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Vehicle.js
│   │   │   ├── Booking.js
│   │   │   ├── Payment.js
│   │   │   ├── Feedback.js
│   │   │   ├── VehicleTracking.js
│   │   │   ├── Coupon.js
│   │   │   ├── WalletCredit.js
│   │   │   └── others...
│   │   ├── routes/
│   │   │   ├── index.js           # Main router
│   │   │   ├── authRoutes.js
│   │   │   ├── vehicleRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── trackingRoutes.js
│   │   │   └── others...
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT & Authorization
│   │   │   ├── errorMiddleware.js # Error handling
│   │   │   └── validationMiddleware.js
│   │   ├── services/
│   │   │   ├── paymentService.js
│   │   │   ├── returnService.js
│   │   │   └── others...
│   │   ├── validations/
│   │   │   ├── bookingValidation.js
│   │   │   └── others...
│   │   └── seed/
│   │       └── seed.js            # Database seeding
│   │
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── vehicles.test.js
│   │
│   ├── package.json
│   ├── .env                       # Environment variables
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Main App component
│   │   ├── index.css             # Global styles & Tailwind
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── VehiclesPage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── TrackingPage.jsx
│   │   │   ├── FeedbackPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── StaffLoginPage.jsx
│   │   │   ├── CustomerLoginPage.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   └── others...
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── GlassCard.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── BookingModal.jsx
│   │   │   ├── PaymentCheckoutModal.jsx
│   │   │   ├── LiveTrackingMap.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── StaffRoute.jsx
│   │   │   ├── CustomerRoute.jsx
│   │   │   └── others...
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance with interceptors
│   │   │   └── constants.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state management
│   │   │   └── others...
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   └── utils/
│   │       ├── pdfGenerator.js
│   │       └── others...
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js            # Vite configuration with API proxy
│   ├── tailwind.config.js         # Tailwind CSS config
│   └── README.md
│
├── package.json                  # Root package file (if monorepo)
└── README.md                     # This file
```

---

## Contributing Guidelines

We welcome contributions from the community! Please follow these guidelines to ensure smooth collaboration.

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trimurti-transport.git
   cd trimurti-transport
   ```
3. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make your changes** following the coding standards
2. **Test your changes** thoroughly
3. **Commit with clear messages**:
   ```bash
   git commit -m "feat: Add vehicle real-time tracking feature"
   ```

### Commit Message Format

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
git commit -m "feat(booking): Add automatic overlap detection"
git commit -m "fix(payment): Resolve Razorpay signature verification"
git commit -m "docs(readme): Update installation instructions"
```

### Code Style Guidelines

#### Backend (Node.js/Express)

- Use **ES6+ syntax** (arrow functions, const/let, template literals)
- Follow **Airbnb style guide**
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and models
- Add JSDoc comments for functions
- Keep functions **small and focused** (< 50 lines)

**Example:**

```javascript
/**
 * Create a new booking
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} Created booking
 */
const createBooking = async (bookingData) => {
  // Implementation
};
```

#### Frontend (React)

- Use **functional components** with hooks
- Follow **React best practices**
- Use **camelCase** for variables and props
- Use **PascalCase** for component names
- Separate styles using **Tailwind CSS classes**
- Use **meaningful variable and function names**

**Example:**

```jsx
const VehicleCard = ({ vehicle, onBooking }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async () => {
    setIsLoading(true);
    try {
      await onBooking(vehicle._id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-glass p-4 rounded-lg">
      <h3 className="text-xl font-bold">{vehicle.name}</h3>
      {/* More JSX */}
    </div>
  );
};
```

### Before Submitting a Pull Request

- ✅ Test all changes locally
- ✅ Update documentation if needed
- ✅ Run linter/formatter
- ✅ Ensure code has no console errors
- ✅ Add tests for new features
- ✅ Check for code duplication
- ✅ Verify all environment variables are documented

### Creating a Pull Request

1. **Push your branch** to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the changes
   - Detailed description of what changed and why
   - Reference to any related issues
   - Screenshots/GIFs for UI changes

**PR Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update

## Testing

- [ ] Tested on localhost
- [ ] All tests passing
- [ ] No console errors

## Checklist

- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

### Reporting Issues

When reporting bugs:

1. **Use the issue tracker** on GitHub
2. **Provide detailed information**:
   - Step-by-step reproduction
   - Expected vs. actual behavior
   - Environment details (Node version, OS, etc.)
   - Error messages and logs
   - Screenshots if applicable

3. **Use descriptive titles**:
   - ❌ "Bug in booking"
   - ✅ "Booking creation fails when vehicle is already booked for same date"

### Code Review Process

1. At least one maintainer will review your PR
2. Provide feedback or request changes if needed
3. Make necessary updates
4. Once approved, PR will be merged

---

## Troubleshooting

### Backend Issues

#### Issue: `npm run dev` fails with permission denied

**Solution:**

```bash
chmod +x node_modules/.bin/*
npm run dev
```

#### Issue: MongoDB connection error

**Solution:**

1. Verify `MONGO_URI` in `.env` file
2. Check MongoDB username/password encoding (use URL encoding for special characters)
3. Ensure IP whitelist includes your current IP in MongoDB Atlas
4. Test connection string in MongoDB Compass

```bash
# Example: If password has special character @
# Password: myPass@123
# Encoded: myPass%40123
```

#### Issue: Razorpay payment fails

**Solution:**

1. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
2. Ensure you're using **Test Keys** for development
3. Verify payment amount > 0 (minimum ₹1)
4. Check Razorpay dashboard for error details

#### Issue: JWT token invalid

**Solution:**

1. Verify `JWT_SECRET` is set in `.env`
2. Check token expiration: `JWT_EXPIRES_IN`
3. Clear localStorage and login again
4. Ensure backend and frontend are using same JWT_SECRET

### Frontend Issues

#### Issue: API requests failing with CORS error

**Solution:**

1. Verify backend is running on correct port (5001)
2. Check `vite.config.js` proxy configuration
3. Ensure backend has CORS enabled
4. Check browser console for exact error

#### Issue: Components not rendering correctly

**Solution:**

1. Clear browser cache: `Ctrl+Shift+Delete`
2. Rebuild frontend: `npm run build`
3. Check React DevTools for component state
4. Verify Tailwind CSS is building: `npm run dev`

#### Issue: Real-time tracking not working

**Solution:**

1. Verify Socket.IO is enabled in backend
2. Check WebSocket connection in browser Network tab
3. Ensure booking status is 'ongoing'
4. Look for Socket.IO connection errors in browser console

### Database Issues

#### Issue: MongoDB operation timeout

**Solution:**

1. Check internet connection
2. Verify MongoDB cluster status
3. Increase connection timeout in `MONGO_URI`
4. Check MongoDB logs for errors

#### Issue: Duplicate key error on unique fields

**Solution:**

1. Data already exists with same unique value
2. Check database for duplicates:
   ```bash
   # Connect to MongoDB and check
   db.users.findOne({ email: "duplicate@example.com" })
   ```
3. Remove duplicate or use different value

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

### License Summary

- ✅ You can use this project commercially
- ✅ You can modify and distribute
- ✅ You must include license and copyright notice
- ❌ No warranty or liability provided

---

## Support & Contact

- **Issues**: Use GitHub Issues tracker for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Email**: [Project maintainers email]

---

## Acknowledgments

- **Razorpay** for payment processing
- **MongoDB** for database
- **Socket.IO** for real-time features
- All contributors and testers

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

---

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

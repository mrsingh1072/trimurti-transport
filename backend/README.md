# Trimurti Transport Backend (VRMS)

Production-grade backend for the Trimurti Transport Vehicle Rental Management System (VRMS) built with Node.js, Express, and MongoDB.

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing
- Joi for request validation
- Helmet, CORS, and sanitization middleware for security

## Getting Started

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `.env` (sample values already provided):
   - `MONGO_URI`
   - `PORT`
   - `JWT_SECRET`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

5. Seed sample data (users, vehicles):
   ```bash
   npm run seed
   ```

## API Base URL

- Default: `http://localhost:5000`

## Swagger API Docs

- Available at: `http://localhost:5000/api/docs`

## Core Modules

- Auth (register/login)
- Vehicle management
- Bookings (with overlap prevention)
- Returns (late fees + damage charges)
- Payments

Refer to the Swagger docs and source code for detailed request/response shapes.

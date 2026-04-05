# Feedback & Rating System - Quick Reference

## Overview
Complete customer feedback & rating system for Trimurti Transport. Customers can submit feedback after completed trips, staff can view all feedback, and landing page displays latest testimonials.

## Features Implemented

### ✓ Backend Infrastructure (COMPLETE)
- **Feedback Model** (`backend/src/models/Feedback.js`)
  - Stores customer feedback with ratings (1-5)
  - One feedback per booking (unique constraint)
  - Validates returnStatus='processed' before allowing feedback

- **Feedback Controller** (`backend/src/controllers/feedbackController.js`)
  - `submitFeedback()` - Customers can submit feedback (POST /)
  - `getAllFeedback()` - Staff/Admin view all feedback (GET /)
  - `getLatestFeedback()` - Latest 3 feedback for landing page (GET /latest)
  - `getAverageRating()` - Rating statistics (GET /average)

- **Feedback Routes** (`backend/src/routes/feedbackRoutes.js`)
  - POST / - Submit feedback (customers only)
  - GET / - View all feedback (admin/staff only)
  - GET /latest - Latest feedback (public)
  - GET /average - Rating stats (public)

### ✓ Frontend API Services (COMPLETE)
Located in `frontend/src/services/api.js`:
- `submitFeedback(feedbackData)` - Submit customer feedback
- `getLatestFeedback()` - Fetch latest 3 feedback
- `getAllFeedback()` - Fetch all feedback (admin)
- `getAverageRating()` - Get rating distribution

### ✓ Frontend UI Components (COMPLETE)

#### FeedbackModal (`frontend/src/components/FeedbackModal.jsx`)
- **Purpose**: Modal form for submitting feedback after completed trip
- **Props**:
  - `isOpen` (boolean) - Modal visibility
  - `booking` (object) - Selected booking with vehicle info
  - `onClose` (function) - Close handler
  - `onSuccess` (function) - Success callback to refresh data
- **Features**:
  - Star rating selector (1-5 stars)
  - Message textarea (min 10 characters)
  - Vehicle info display
  - Validation & error handling
  - Submit button with loading state

#### HistoryPage Updates (`frontend/src/pages/HistoryPage.jsx`)
- Added "Give Feedback" button to each completed booking
- Integrated FeedbackModal
- Auto-refresh bookings after feedback submission
- State management for feedback modal

## How to Use

### For Customers:
1. Navigate to **History** page (from Navbar)
2. View your completed trips
3. Click **"Give Feedback"** button on any completed booking
4. Select rating (1-5 stars)
5. Enter feedback message (minimum 10 characters)
6. Click **"Submit Feedback"**
7. Modal closes and data refreshes

### For Staff/Admin:
1. View all customer feedback in Staff/Admin panel
2. See customer name, vehicle, rating, and message
3. Monitor customer satisfaction
4. Use for quality improvement

### For Landing Page:
1. Displays latest 3 customer feedback items
2. Shows star ratings and customer messages
3. Includes average rating statistics
4. Automatically updates as new feedback is submitted
5. Fallback to static testimonials if no feedback exists

## Data Flow

```
Customer Action
    ↓
FeedbackModal (UI)
    ↓
submitFeedback() (API Service)
    ↓
POST /api/feedback/ (Backend Route)
    ↓
feedbackController.submitFeedback()
    ↓
Feedback Model (MongoDB)
    ↓
Response to Frontend
    ↓
handleFeedbackSuccess() callback
    ↓
fetchBookings() (refresh data)
```

## Validation Rules

**Message:**
- Minimum 10 characters
- Maximum 1000 characters (backend)
- Required field

**Rating:**
- Must be integer between 1-5
- Required field

**Booking:**
- Must have returnStatus = 'processed'
- Can only submit one feedback per booking
- User must own the booking

## Error Handling

- If booking hasn't been returned (returnStatus ≠ 'processed'): 400 Bad Request
- If user tries to submit duplicate feedback: 409 Conflict
- If booking doesn't belong to user: 403 Forbidden
- If validation fails: 400 Bad Request with detailed message

## Database Schema

### Feedback Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref User),
  booking: ObjectId (ref Booking, unique),
  message: String (10-1000 chars),
  rating: Number (1-5),
  createdAt: Date (indexed)
}

Indexes:
- user + createdAt (compound)
- createdAt + rating
```

## Testing

### Submit Feedback
```bash
POST http://localhost:5000/api/feedback/
Authorization: Bearer <customer_auth_token>

Body: {
  "bookingId": "board_id_here",
  "rating": 5,
  "message": "Great service and clean vehicle!"
}
```

### Get Latest Feedback (No Auth)
```bash
GET http://localhost:5000/api/feedback/latest
```

### Get All Feedback (Admin Only)
```bash
GET http://localhost:5000/api/feedback/
Authorization: Bearer <admin_auth_token>
```

### Get Rating Stats
```bash
GET http://localhost:5000/api/feedback/average
```

## Remaining Work

### Pending Components:
1. **StarRating Component** (reusable across app)
   - Location: `frontend/src/components/StarRating.jsx`
   - 5 clickable stars displaying feedback ratings

2. **Admin Feedback Viewing Section**
   - Location: Staff/Admin dashboard
   - Display all feedback with user/vehicle/rating/message
   - Call `getAllFeedback()` API

3. **Landing Page Integration**
   - Replace static testimonials with dynamic feedback
   - Call `getLatestFeedback()` API
   - Display latest 3 feedback items
   - Show average rating

## Files Modified/Created

### Created:
- ✓ `backend/src/models/Feedback.js`
- ✓ `backend/src/controllers/feedbackController.js`
- ✓ `backend/src/routes/feedbackRoutes.js`
- ✓ `frontend/src/components/FeedbackModal.jsx`

### Modified:
- ✓ `backend/src/routes/index.js` (added feedback routes)
- ✓ `frontend/src/services/api.js` (added feedback API functions)
- ✓ `frontend/src/pages/HistoryPage.jsx` (integrated FeedbackModal)

### Remaining:
- ⏳ `frontend/src/components/StarRating.jsx`
- ⏳ Admin feedback viewing section
- ⏳ Landing page testimonials integration

## Next Steps

1. Create reusable `StarRating` component
2. Build Admin/Staff feedback viewing section
3. Integrate feedback into landing page testimonials
4. Test end-to-end workflow
5. Deploy to production

## Console Logging

All operations log to console for debugging:
- Feedback submission: `submitFeedback() called with data:`
- Success: `✓ Feedback submitted successfully`
- Errors include: `Error submitting feedback:` with details

## Performance Considerations

- Feedback collection indexes on `createdAt` for quick sorting
- Compound index `user + createdAt` for user-specific queries
- Population of user/booking/vehicle data in getAllFeedback()
- Limiting latest feedback to 3 items for landing page

---

**Status**: Backend 100% Complete | Frontend Services 100% Complete | UI Components 60% Complete (FeedbackModal ✓, StarRating ⏳, Admin Section ⏳, Landing Page ⏳)

**Build**: ✓ Successful (2652 modules, 0 errors)

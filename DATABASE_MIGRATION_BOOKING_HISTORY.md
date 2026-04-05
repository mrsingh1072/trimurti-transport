# Database Migration Script - Booking History Fix

## Problem
Old bookings created before the returnStatus field was added may not display in History because:
- They may only have `status: "completed"` without `returnStatus: "processed"`
- New bookings have both fields properly set
- Frontend filtering now supports both fields, but old data needs updating

---

## Quick Fix Approach

### Option 1: Frontend-Only Fix (Applied Automatically)
✓ Already implemented - backend now adds fallback logic
✓ Converts `status: "completed"` → shows in history automatically
✓ No database changes needed

### Option 2: Database Migration (Optional - For Data Consistency)
For production environments where you want data consistency, run this script:

---

## Database Migration Script

### Prerequisites
1. Connect to your MongoDB instance
2. Open MongoDB Compass or MongoDB shell
3. Select your database (trimurti_transport or similar)

### Option A: MongoDB Compass UI
1. Open **Collections**
2. Select **bookings** collection
3. Click **Bulk Edit**
4. Run the update query below

### Option B: MongoDB Shell / mongosh
```javascript
// Connect to database
use trimurti_transport;

// Option 1: Update all completed bookings without returnStatus
db.bookings.updateMany(
  {
    status: "completed",
    $or: [
      { returnStatus: { $exists: false } },
      { returnStatus: "none" }
    ]
  },
  [
    {
      $set: {
        returnStatus: "processed",
        updatedAt: new Date()
      }
    }
  ]
);

// Verify the update
db.bookings.countDocuments({ status: "completed", returnStatus: "processed" });

// Check specific examples
db.bookings.find({ status: "completed", returnStatus: "processed" }).limit(3).pretty();
```

### Option C: Node.js Script
If you want to run this via your backend:

```javascript
// backend/scripts/fixBookingHistory.js
const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');

async function fixBookingHistory() {
  try {
    console.log('🔧 Starting booking history fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Find all completed bookings without proper returnStatus
    const result = await Booking.updateMany(
      {
        status: 'completed',
        $or: [
          { returnStatus: { $exists: false } },
          { returnStatus: 'none' }
        ]
      },
      {
        $set: {
          returnStatus: 'processed',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✓ Updated ${result.modifiedCount} bookings`);
    
    // Verify
    const fixed = await Booking.countDocuments({
      status: 'completed',
      returnStatus: 'processed'
    });
    console.log(`✓ Total completed bookings with returnStatus='processed': ${fixed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBookingHistory();
```

Run it with:
```bash
node backend/scripts/fixBookingHistory.js
```

---

## Verification Steps

### Check How Many Bookings Need Fixing
```javascript
// Bookings that are completed but don't have returnStatus
db.bookings.countDocuments({
  status: "completed",
  $or: [
    { returnStatus: { $exists: false } },
    { returnStatus: "none" }
  ]
});

// Expected: Shows number of bookings to fix

// After fix, should return 0:
db.bookings.countDocuments({
  status: "completed",
  returnStatus: { $ne: "processed" }
});
```

### Check Distribution
```javascript
// See all return statuses
db.bookings.aggregate([
  { $group: { _id: "$returnStatus", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// See status distribution
db.bookings.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

### Random Sample Check
```javascript
// Check a few completed bookings
db.bookings.find({ status: "completed" }).limit(5).pretty();

// Verify they have returnStatus: "processed"
```

---

## Rollback (If Needed)
```javascript
// Only if something goes wrong, revert to backup
// This assumes you have a backup. Otherwise, data is lost.

// To be safe, run BEFORE migration:
db.bookings.find().count();  // Record the count

// After migration:
db.bookings.find().count();  // Should be same

// Check specific fields
db.bookings.find({ _id: ObjectId("...") }).pretty();
```

---

## Timeline

| Phase | Action | Impact |
|-------|--------|--------|
| **Now** | Deploy frontend + backend fixes | Old bookings start showing |
| **Optional** | Run migration script | Ensures data consistency |
| **Post** | Verify all users see history | Completed bookings visible |

---

## What Changed

### Backend (bookingController.js)
```javascript
// Added fallback logic when sending bookings to frontend
bookings = bookings.map(booking => {
  if (!booking.returnStatus || booking.returnStatus === 'none') {
    if (booking.status === 'completed') {
      booking.returnStatus = 'processed';  // ← Automatic conversion
    }
  }
  return booking;
});
```

### Frontend (HistoryPage.jsx & MyBookingsPage.jsx)
```javascript
// Improved filter to accept both conditions
const historyBookings = bookings.filter(b => {
  const isProcessed = b.returnStatus === 'processed';
  const isCompleted = b.status?.toLowerCase() === 'completed';
  return isProcessed || isCompleted;  // ← Accepts both
});
```

---

## FAQ

**Q: Do I NEED to run the migration?**
A: No. The frontend fix works automatically. Migration is optional for data consistency.

**Q: Will this affect active bookings?**
A: No. Only impacts `status: "completed"` bookings.

**Q: Can I undo this?**
A: Yes. Restore from backup or reverse the update query.

**Q: How long does it take?**
A: Depends on document count. Usually < 1 second for typical systems.

**Q: Do users need to refresh?**
A: They'll see updated history after page refresh or browser cache clear.

---

## Monitoring

After deployment, monitor:
```bash
# Check logs for returnStatus updates
grep "returnStatus" logs/app.log

# Monitor booking history requests
grep "History bookings:" logs/app.log

# Check successful updates
grep "Updated.*bookings" logs/migration.log
```

---

## Documentation References
- Backend Model: `backend/src/models/Booking.js`
- Service: `backend/src/services/bookingService.js`
- Controller: `backend/src/controllers/bookingController.js`
- Frontend: `frontend/src/pages/HistoryPage.jsx`, `frontend/src/pages/MyBookingsPage.jsx`

# Frontend API Integration Guide

## Overview

The frontend is now connected to your backend APIs. The landing page dynamically fetches and displays dashboard statistics from your backend server.

## Setup

### Prerequisites
- Backend running at: `http://localhost:5000/api`
- axios installed (already added via npm)

### Files Created/Modified

1. **`src/services/api.js`** - API service layer
   - Axios instance with baseURL configuration
   - Functions for API calls: `getDashboardStats()`, `getBookings()`, `getVehicles()`
   - Error handling with fallback values

2. **`src/utils/formatters.js`** - Utility functions for formatting numbers
   - `formatNumber(2847)` → "2,847"
   - `formatLargeNumber(1200000)` → "1.2M"
   - `formatCurrency(100000)` → "₹1,00,000"
   - `formatPercentage(98.5)` → "98.5%"
   - `formatGrowth(156)` → "+156%"

3. **`src/pages/LandingPage.jsx`** - Updated component
   - Uses `useState` for data, loading, and error states
   - Uses `useEffect` to fetch data on component mount
   - Displays loading state ("...") while fetching
   - Shows error message if API fails (fallback to default values)
   - Animated fade-in when numbers load

## API Expected Response Format

### Endpoint: `GET /api/vehicles/stats`

The backend should respond with:

```json
{
  "activeBookings": 2847,
  "totalRevenue": 1200000,
  "availableVehicles": 45,
  "totalVehicles": 120
}
```

Or (with snake_case):

```json
{
  "total_bookings": 2847,
  "total_revenue": 1200000,
  "available_vehicles": 45,
  "total_vehicles": 120
}
```

The code handles both camelCase and snake_case automatically.

## Dashboard Stats Displayed

The landing page hero section displays 4 statistics:

1. **Active Rentals** - Number of active bookings
2. **Revenue** - Total revenue (formatted as "1.2M")
3. **Available Vehicles** - Number of vehicles available for rent
4. **Total Fleet** - Total number of vehicles

## How to Use

### Start the Application

1. **Ensure backend is running:**
   ```bash
   cd backend
   npm start
   # Backend should be at http://localhost:5000
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **View the landing page** - Statistics will load automatically from the backend

### Customizing API Calls

To add more API calls to other components:

1. **Add function in `src/services/api.js`:**
   ```javascript
   export const getBookings = async () => {
     try {
       const response = await apiClient.get('/bookings')
       return response.data
     } catch (error) {
       handleError(error)
       return []
     }
   }
   ```

2. **Use in component:**
   ```javascript
   import { getBookings } from '../services/api'
   
   useEffect(() => {
     const fetchBookings = async () => {
       const data = await getBookings()
       setBookings(data)
     }
     fetchBookings()
   }, [])
   ```

## Error Handling

- If API fails, default values are used (0 for numbers)
- Error message is displayed in yellow below the stats
- Console logs the error for debugging
- Application continues to work with fallback data

## Loading State

While data is being fetched:
- Stats show "..." instead of numbers
- Each stat has a staggered fade-in animation (0.1s delay between each)

## Formatting Numbers

The formatters automatically:
- Add thousand separators: 2847 → "2,847"
- Abbreviate large numbers: 1200000 → "1.2M"
- Format currency with INR symbol: 100000 → "₹1,00,000"

## Testing Without Backend

If your backend is not running:
1. Default values (0) will be displayed
2. Yellow error message will show: "Failed to load statistics. Using default values."
3. The UI continues to work normally

## Backend Endpoints Reference

Ensure your backend has these endpoints:

| Endpoint | Method | Response | Purpose |
|----------|--------|----------|---------|
| `/api/vehicles/stats` | GET | Dashboard stats | Main landing page stats |
| `/api/vehicles` | GET | Array of vehicles | Vehicle list |
| `/api/bookings` | GET | Array of bookings | Bookings list |
| `/api/bookings/stats` | GET | Booking stats | Booking statistics |
| `/api/vehicles/count` | GET | Count objects | Vehicle counts |

## Future Enhancements

To add more stats:

1. Update API endpoint response
2. Add state in component
3. Call new API in useEffect
4. Format and display the data

Example:
```javascript
const [satisfactionRating, setSatisfactionRating] = useState(0)

// In useEffect
setSatisfactionRating(statsResponse.satisfaction || 0)

// In JSX
<p>{formatPercentage(satisfactionRating)}</p>
```

## Browser Console Debugging

Open browser DevTools (F12) → Console to see:
- Loading/error messages
- API response data
- Any errors encountered

## Performance Notes

- API calls happen only once when component mounts
- No unnecessary re-renders or API spam
- Default/fallback values ensure UI stability
- Axios instance is configured with 10-second timeout

---

**Need help?** Check browser console for API errors and ensure:
1. Backend is running at `http://localhost:5000`
2. CORS is enabled on backend (if different domain)
3. API endpoints match the expected format

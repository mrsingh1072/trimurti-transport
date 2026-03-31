# 🚀 Vehicle CRUD - Quick Reference Guide

## File Structure
```
frontend/src/
├── components/
│   ├── Toast.jsx                    # Notification toasts
│   ├── AddVehicleModal.jsx          # Add vehicle form
│   ├── EditVehicleModal.jsx         # Edit vehicle form
│   ├── ConfirmDialog.jsx            # Delete confirmation dialog
│   └── ... (existing components)
├── pages/staff/
│   └── VehiclesPage.jsx             # Staff vehicle management
└── services/
    └── api.js                       # API calls (already has CRUD)

backend/src/
├── models/
│   └── Vehicle.js                   # MongoDB schema
├── routes/
│   └── vehicleRoutes.js             # API routes
├── controllers/
│   └── vehicleController.js         # Request handlers
├── services/
│   └── vehicleService.js            # Business logic
├── validations/
│   └── vehicleValidation.js         # Input validation
└── seed/
    └── seed.js                      # Database seeding
```

---

## API Quick Reference

### **GET /api/vehicles**
```bash
curl http://localhost:5000/api/vehicles
```
Returns: Array of all vehicles

### **POST /api/vehicles**
```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Honda City",
    "category": "Car",
    "pricePerDay": 2000,
    "location": "Delhi",
    "condition": "Good",
    "availability": true
  }'
```

### **PUT /api/vehicles/ID**
```bash
curl -X PUT http://localhost:5000/api/vehicles/ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### **DELETE /api/vehicles/ID**
```bash
curl -X DELETE http://localhost:5000/api/vehicles/ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Component Usage

### **Toast Notification**
```jsx
import Toast from '@/components/Toast'

// In JSX
{toast && (
  <Toast
    message="Vehicle Added Successfully!"
    type="success"  // 'success' | 'error' | 'warning'
    duration={3000}
    onClose={() => setToast(null)}
  />
)}

// In code
setToast({ 
  type: 'success', 
  message: 'Vehicle Added Successfully!' 
})
```

### **Add Vehicle Modal**
```jsx
import AddVehicleModal from '@/components/AddVehicleModal'

<AddVehicleModal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  onSubmit={async (formData) => {
    await createVehicle(formData)
  }}
  isLoading={isSubmitting}
/>
```

### **Edit Vehicle Modal**
```jsx
import EditVehicleModal from '@/components/EditVehicleModal'

<EditVehicleModal
  isOpen={showEditModal}
  vehicle={editingVehicle}  // Must have _id, name, category, etc.
  onClose={() => {
    setShowEditModal(false)
    setEditingVehicle(null)
  }}
  onSubmit={async (formData) => {
    await updateVehicle(editingVehicle._id, formData)
  }}
  isLoading={isSubmitting}
/>
```

### **Confirm Dialog**
```jsx
import ConfirmDialog from '@/components/ConfirmDialog'

<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete Vehicle"
  message="Are you sure you want to delete this vehicle?"
  confirmText="Delete"
  onConfirm={async () => {
    await deleteVehicle(vehicleId)
  }}
  onCancel={() => setShowDeleteConfirm(false)}
  isLoading={isDeleting}
  isDangerous={true}
/>
```

---

## State Management Pattern

```jsx
// Category filter
const [selectedCategory, setSelectedCategory] = useState('all')

// Search term
const [searchTerm, setSearchTerm] = useState('')

// Modal visibility
const [showAddModal, setShowAddModal] = useState(false)
const [showEditModal, setShowEditModal] = useState(false)
const [editingVehicle, setEditingVehicle] = useState(null)
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
const [deletingVehicleId, setDeletingVehicleId] = useState(null)

// Loading states
const [isSubmitting, setIsSubmitting] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)

// Toast
const [toast, setToast] = useState(null)

// useEffect for filtering
useEffect(() => {
  filterVehicles()
}, [vehicles, selectedCategory, searchTerm])
```

---

## Filtering Logic

```jsx
const filterVehicles = () => {
  let filtered = vehicles

  // Category filter
  if (selectedCategory !== 'all') {
    filtered = filtered.filter((v) => v.category === selectedCategory)
  }

  // Search filter
  if (searchTerm.trim()) {
    filtered = filtered.filter((v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  setFilteredVehicles(filtered)
}
```

---

## Common Operations

### **Add Vehicle**
```jsx
const handleAddVehicle = async (formData) => {
  try {
    setIsSubmitting(true)
    await createVehicle(formData)
    setShowAddModal(false)
    setToast({ type: 'success', message: 'Vehicle Added Successfully!' })
    fetchVehicles() // Refresh list
  } catch (err) {
    setToast({ type: 'error', message: 'Failed to create vehicle' })
  } finally {
    setIsSubmitting(false)
  }
}
```

### **Edit Vehicle**
```jsx
const handleEditVehicle = async (formData) => {
  try {
    setIsSubmitting(true)
    await updateVehicle(editingVehicle._id, formData)
    setShowEditModal(false)
    setEditingVehicle(null)
    setToast({ type: 'success', message: 'Vehicle Updated Successfully!' })
    fetchVehicles() // Refresh list
  } catch (err) {
    setToast({ type: 'error', message: 'Failed to update vehicle' })
  } finally {
    setIsSubmitting(false)
  }
}
```

### **Delete Vehicle**
```jsx
const handleDeleteVehicle = async () => {
  try {
    setIsDeleting(true)
    await deleteVehicle(deletingVehicleId)
    setShowDeleteConfirm(false)
    setDeletingVehicleId(null)
    setToast({ type: 'success', message: 'Vehicle Deleted Successfully!' })
    fetchVehicles() // Refresh list
  } catch (err) {
    setToast({ type: 'error', message: 'Failed to delete vehicle' })
  } finally {
    setIsDeleting(false)
  }
}
```

---

## Database Queries

### **MongoDB with Mongoose**

```javascript
// Get all vehicles
const vehicles = await Vehicle.find()

// Get by category
const cars = await Vehicle.find({ category: 'Car' })

// Get available vehicles
const available = await Vehicle.find({ availability: true })

// Filter by location
const puneCars = await Vehicle.find({ 
  category: 'Car',
  location: 'Pune' 
})

// Update one
const updated = await Vehicle.findByIdAndUpdate(
  id, 
  { condition: 'Good' },
  { new: true }
)

// Delete one
const deleted = await Vehicle.findByIdAndDelete(id)

// Count
const total = await Vehicle.countDocuments()
const available = await Vehicle.countDocuments({ availability: true })
```

---

## Validation Examples

### **Frontend Validation** (in modals)
```javascript
if (!formData.name.trim()) {
  alert('Vehicle name is required')
  return
}

if (!formData.pricePerDay || formData.pricePerDay <= 0) {
  alert('Price per day must be greater than 0')
  return
}

if (!formData.location.trim()) {
  alert('Location is required')
  return
}
```

### **Backend Validation** (Joi schema)
```javascript
const createVehicleSchema = Joi.object({
  name: Joi.string().trim().required(),
  category: Joi.string()
    .valid('Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB')
    .required(),
  pricePerDay: Joi.number().positive().required(),
  location: Joi.string().trim().required(),
  condition: Joi.string()
    .valid('Good', 'Average', 'Poor')
    .optional()
    .default('Good'),
  availability: Joi.boolean().optional().default(true),
})
```

---

## Styling Classes

### **Condition Badges**
```jsx
const getConditionBadge = (condition) => {
  const badges = {
    Good: 'bg-green-500/20 text-green-400',      // Green
    Average: 'bg-yellow-500/20 text-yellow-400', // Yellow
    Poor: 'bg-red-500/20 text-red-400',          // Red
  }
  return badges[condition] || 'bg-gray-500/20 text-gray-400'
}
```

### **Availability Badges**
```jsx
const getAvailabilityBadge = (availability) => {
  return availability
    ? 'bg-blue-500/20 text-blue-400'        // Blue (available)
    : 'bg-orange-500/20 text-orange-400'    // Orange (not available)
}
```

### **Buttons**
```jsx
// Add button
className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white"

// Edit button
className="bg-blue-500/20 text-blue-400 rounded"

// Delete button
className="bg-red-500/20 text-red-400 rounded"

// Confirm button
className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
```

---

## Debugging Tips

### **Check API Response**
```javascript
// In browser console
await fetch('http://localhost:5000/api/vehicles')
  .then(r => r.json())
  .then(data => console.log(data))
```

### **Check Store Token**
```javascript
localStorage.getItem('authToken')
```

### **Check User**
```javascript
JSON.parse(localStorage.getItem('user'))
```

### **Check Vehicle State**
```javascript
console.log('Vehicles:', vehicles)
console.log('Filtered:', filteredVehicles)
console.log('Category:', selectedCategory)
console.log('Search:', searchTerm)
```

### **Check Network Requests**
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. Check request/response

---

## Common Issues & Solutions

### **Issue: Can't see Add button**
**Solution**: Ensure you're logged in as Staff (not Customer)

### **Issue: Modal doesn't open**
**Solution**: Check if `showAddModal` state is true

### **Issue: API returns 401**
**Solution**: Check if auth token exists in localStorage

### **Issue: Validation error**
**Solution**: Fill all required fields with valid data

### **Issue: Toast doesn't show**
**Solution**: Verify Toast component is imported and used

### **Issue: Filter doesn't work**
**Solution**: Check if `filterVehicles()` is called in useEffect

---

## Performance Tips

1. **Use useCallback** for memoized functions
2. **Use useMemo** for expensive computations
3. **Lazy load** modals (don't render until needed)
4. **Paginate** vehicle list if > 1000 items
5. **Debounce** search input
6. **Use loading** states to prevent double submissions

---

## Security Checklist

- ✅ Authorization token required for POST/PUT/DELETE
- ✅ Role checking on backend (Staff/Admin only)
- ✅ Input validation on both frontend & backend
- ✅ XSS protection (sanitization)
- ✅ CORS enabled (trusted origin)
- ✅ Helmet middleware active
- ✅ MongoDB sanitization active
- ✅ Error messages don't leak data

---

## Testing Commands

```bash
# Seed database
npm run seed

# Run tests
npm test

# Start backend
npm start

# Start frontend
npm run dev

# Build frontend
npm run build

# Check linting
npm run lint
```

---

## Environment Variables

```env
# Backend (.env)
NODE_ENV=development
PORT=5000
DB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

---

## Useful Links

- 📚 [MongoDB Docs](https://docs.mongodb.com/)
- 📚 [Mongoose Docs](https://mongoosejs.com/)
- 📚 [React Docs](https://react.dev/)
- 📚 [Express Docs](https://expressjs.com/)
- 📚 [Tailwind CSS](https://tailwindcss.com/)
- 📚 [Lucide Icons](https://lucide.dev/)

---

## Quick Start

1. **Clone repo** & install dependencies
2. **Run seed** to populate database
3. **Start backend**: `npm start`
4. **Start frontend**: `npm run dev`
5. **Login as Staff**: staff@trimurti.com / Staff@123
6. **Navigate to Manage Vehicles**
7. **Test Add/Edit/Delete** vehicle operations
8. **Check Customer dashboard** for visibility

---

## Version History

- **v1.0.0** - Initial CRUD implementation with full features
  - ✅ 4 new components
  - ✅ 7 files updated
  - ✅ Full CRUD operations
  - ✅ Category filtering
  - ✅ Search functionality
  - ✅ Toast notifications
  - ✅ MongoDB persistence

---

## Support Resources

1. **VEHICLE_CRUD_GUIDE.md** - Complete user guide
2. **VEHICLE_CRUD_IMPLEMENTATION.md** - Implementation details
3. **Code comments** - In all source files
4. **Console errors** - Check browser dev tools
5. **Network tab** - Check API responses

---

*Last Updated: 2024*
*Status: Production Ready ✅*


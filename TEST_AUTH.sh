#!/bin/bash
# QUICK TEST SCRIPT FOR AUTH & VEHICLE CREATION
# Run these commands in order

echo "=========================================="
echo "🧪 AUTHENTICATION & VEHICLE CREATION TEST"
echo "=========================================="
echo ""

# Step 1: Seed Database
echo "📦 Step 1: Seeding Database..."
cd backend
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ Seed failed! Check your database connection."
    exit 1
fi
echo "✅ Database seeded successfully"
echo ""

# Step 2: Start Backend
echo "🚀 Step 2: Starting Backend Server..."
npm start &
BACKEND_PID=$!
sleep 3
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Listen on http://localhost:5000"
echo ""

# Step 3: Start Frontend (in separate terminal instruction)
echo "🎨 Step 3: Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
sleep 3
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Open http://localhost:5173 in browser"
echo ""

# Step 4: Instructions
echo "=========================================="
echo "✅ SERVERS RUNNING - TEST NOW!"
echo "=========================================="
echo ""
echo "TEST STEPS:"
echo "1. Open browser: http://localhost:5173"
echo "2. Login with STAFF:"
echo "   Email: staff@trimurti.com"
echo "   Password: Staff@123"
echo "3. Navigate to: Staff Dashboard → Manage Vehicles"
echo "4. Click: + Add Vehicle"
echo "5. Fill form and submit"
echo "6. Check backend console for:"
echo "   ✅ [LOGIN] SUCCESS"
echo "   ✅ [AUTH MIDDLEWARE] USER FOUND"
echo "   ✅ [AUTHORIZATION] ACCESS GRANTED"
echo "   ✅ Vehicle created successfully"
echo ""
echo "WATCH BROWSER CONSOLE FOR:"
echo "   📤 [API REQUEST]: POST /vehicles"
echo "   ✅ Token found in localStorage"
echo "✅ Vehicle created successfully!"
echo ""
echo "IF 401 ERROR:"
echo "1. Run in browser console:"
echo "   localStorage.clear()"
echo "2. Refresh page and login again"
echo "3. Check backend console for ❌ errors"
echo ""
echo "STOP SERVERS:"
echo "Kill process $BACKEND_PID and $FRONTEND_PID"
echo "Or press Ctrl+C in terminal"
echo ""

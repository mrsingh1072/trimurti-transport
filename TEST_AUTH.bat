@echo off
REM QUICK TEST SCRIPT FOR AUTH & VEHICLE CREATION (Windows)
REM Run this batch file from project root

echo ==========================================
echo.
echo AUTHENTICATION ^& VEHICLE CREATION TEST
echo.
echo ==========================================
echo.

REM Step 1: Seed Database
echo [1/3] Seeding Database...
cd backend
call npm run seed
if errorlevel 1 (
    echo ERROR: Seed failed! Check your database connection.
    pause
    exit /b 1
)
echo.
echo SUCCESS: Database seeded
echo.

REM Step 2: Start Backend
echo [2/3] Starting Backend Server...
echo Listening on http://localhost:5000
start cmd /k npm start
timeout /t 3

REM Step 3: Start Frontend
echo [3/3] Starting Frontend Server...
cd ..\frontend
echo Opening http://localhost:5173 in ~3 seconds...
start cmd /k npm run dev
timeout /t 3

echo.
echo ==========================================
echo SERVERS RUNNING - TEST NOW!
echo ==========================================
echo.
echo MANUAL TESTING STEPS:
echo.
echo 1. Open browser: http://localhost:5173
echo.
echo 2. Login with STAFF credentials:
echo    Email: staff@trimurti.com
echo    Password: Staff@123
echo.
echo 3. Go to: Staff Dashboard ^> Manage Vehicles
echo.
echo 4. Click: + Add Vehicle button
echo.
echo 5. Fill form and click Create
echo.
echo EXPECTED RESULTS:
echo ✓ No 401 Unauthorized error
echo ✓ Toast showing "Vehicle created successfully"
echo ✓ New vehicle appears in list
echo ✓ Backend console shows green checkmarks (✅)
echo.
echo TROUBLESHOOTING:
echo.
echo If you get 401 error:
echo 1. Open Developer Tools (F12)
echo 2. Go to Console tab
echo 3. Run: localStorage.clear()
echo 4. Refresh the page
echo 5. Login again
echo.
echo Check backend console for these logs:
echo ✅ [LOGIN] SUCCESS
echo ✅ [AUTH MIDDLEWARE] USER FOUND
echo ✅ [AUTHORIZATION] ACCESS GRANTED
echo ✅ Vehicle created successfully
echo.
echo TO STOP SERVERS:
echo - Close the terminal windows or press Ctrl+C
echo.
pause

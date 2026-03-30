import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerRoute from './components/CustomerRoute'
import StaffRoute from './components/StaffRoute'
import AdminRoute from './components/AdminRoute'

// Auth Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Dashboard Pages
import DashboardOverview from './pages/DashboardOverview'
import VehiclesPage from './pages/VehiclesPage'
import BookingsPage from './pages/BookingsPage'
import ReturnsPage from './pages/ReturnsPage'
import AdminPage from './pages/AdminPage'

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffBookingsPage from './pages/staff/BookingsPage'
import StaffReturnsPage from './pages/staff/ReturnsPage'
import StaffVehiclesPage from './pages/staff/VehiclesPage'

// Customer Pages
import LandingPage from './pages/LandingPage'
import CustomerVehiclesPage from './pages/CustomerVehiclesPage'
import MyBookingsPage from './pages/MyBookingsPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/UsersPage'
import AdminBookingsPage from './pages/admin/BookingsPage'
import AdminPaymentsPage from './pages/admin/PaymentsPage'
import AdminVehiclesPage from './pages/admin/VehicleManagement'
import AdminReportsPage from './pages/admin/ReportsPage'
import AdminSettingsPage from './pages/admin/SettingsPage'
import StaffApprovalPage from './pages/admin/StaffApprovalPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gradient-dark">
                <Navbar />
                <LandingPage />
              </div>
            }
          />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Pages */}
          <Route
            path="/vehicles"
            element={
              <CustomerRoute>
                <div className="min-h-screen bg-gray-950 pt-20">
                  <Navbar />
                  <CustomerVehiclesPage />
                </div>
              </CustomerRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <CustomerRoute>
                <div className="min-h-screen bg-gray-950 pt-20">
                  <Navbar />
                  <MyBookingsPage />
                </div>
              </CustomerRoute>
            }
          />

          {/* Customer Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <CustomerRoute>
                <DashboardLayout />
              </CustomerRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="returns" element={<ReturnsPage />} />
          </Route>

          {/* Staff Routes */}
          <Route
            path="/staff"
            element={
              <StaffRoute>
                <StaffDashboard />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/bookings"
            element={
              <StaffRoute>
                <StaffBookingsPage />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/returns"
            element={
              <StaffRoute>
                <StaffReturnsPage />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/vehicles"
            element={
              <StaffRoute>
                <StaffVehiclesPage />
              </StaffRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminBookingsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminRoute>
                <AdminPaymentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <AdminRoute>
                <AdminVehiclesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReportsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettingsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/staff-approvals"
            element={
              <AdminRoute>
                <StaffApprovalPage />
              </AdminRoute>
            }
          />

          {/* Redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

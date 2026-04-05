import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerRoute from './components/CustomerRoute'
import StaffRoute from './components/StaffRoute'
import AdminRoute from './components/AdminRoute'
import ToastContainer from './components/ToastContainer'

// Auth Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RoleSelector from './pages/RoleSelector'
import CustomerLoginPage from './pages/CustomerLoginPage'
import StaffLoginPage from './pages/StaffLoginPage'
import AdminLoginPage from './pages/AdminLoginPage'

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffBookingsPage from './pages/staff/BookingsPage'
import StaffReturnsPage from './pages/staff/ReturnsPage'
import StaffVehiclesPage from './pages/staff/VehiclesPage'
import StaffPaymentsPage from './pages/staff/PaymentsPage'
import StaffWaiverManagement from './pages/staff/WaiverManagement'

// Customer Pages
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import CustomerVehiclesPage from './pages/CustomerVehiclesPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProfilePage from './pages/ProfilePage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/UsersPage'
import AdminBookingsPage from './pages/admin/BookingsPage'
import AdminPaymentsPage from './pages/admin/PaymentsPage'
import AdminVehiclesPage from './pages/admin/VehicleManagement'
import AdminReportsPage from './pages/admin/ReportsPage'
import AdminSettingsPage from './pages/admin/SettingsPage'
import StaffApprovalPage from './pages/admin/StaffApprovalPage'
import AdminWaiverManagement from './pages/admin/WaiverManagement'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
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
          <Route path="/role-selector" element={<RoleSelector />} />
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
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

          <Route
            path="/profile"
            element={
              <CustomerRoute>
                <div className="min-h-screen bg-gray-950 pt-20">
                  <Navbar />
                  <ProfilePage />
                </div>
              </CustomerRoute>
            }
          />

          {/* Customer Dashboard - New Enhanced UI */}
          <Route
            path="/dashboard"
            element={
              <CustomerRoute>
                <div className="min-h-screen bg-gray-950 pt-20">
                  <Navbar />
                  <DashboardPage />
                </div>
              </CustomerRoute>
            }
          />

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
          <Route
            path="/staff/payments"
            element={
              <StaffRoute>
                <StaffPaymentsPage />
              </StaffRoute>
            }
          />
          <Route
            path="/staff/waivers"
            element={
              <StaffRoute>
                <StaffWaiverManagement />
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
            path="/admin/waivers"
            element={
              <AdminRoute>
                <AdminWaiverManagement />
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

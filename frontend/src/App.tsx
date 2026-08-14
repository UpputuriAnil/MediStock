import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { PharmacistDashboard } from './pages/PharmacistDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { MedicineInventory } from './pages/MedicineInventory';
import { Categories } from './pages/Categories';
import { Suppliers } from './pages/Suppliers';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { StockLogs } from './pages/StockLogs';
import { ExpiryTracking } from './pages/ExpiryTracking';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const isAuth = isAuthenticated && !!user;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#0F172A',
                  color: '#F8FAFC',
                  borderRadius: '14px',
                  fontSize: '13px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                },
              }}
            />
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Root redirect to login page first */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Protected Dashboard Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  <Route
                    path="/admin-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/admin dashboard" element={<Navigate to="/admin-dashboard" replace />} />
                  <Route path="/admin_dashboard" element={<Navigate to="/admin-dashboard" replace />} />

                  <Route
                    path="/pharmacist-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['pharmacist']}>
                        <PharmacistDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/pharmacist dashboard" element={<Navigate to="/pharmacist-dashboard" replace />} />
                  <Route path="/pharmacist_dashboard" element={<Navigate to="/pharmacist-dashboard" replace />} />
                  
                  <Route
                    path="/staff-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['staff', 'admin']}>
                        <StaffDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/staff dashboard" element={<Navigate to="/staff-dashboard" replace />} />
                  <Route path="/staff_dashboard" element={<Navigate to="/staff-dashboard" replace />} />

                  <Route
                    path="/supplier-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['supplier', 'admin']}>
                        <SupplierDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/supplier dashboard" element={<Navigate to="/supplier-dashboard" replace />} />
                  <Route path="/supplier_dashboard" element={<Navigate to="/supplier-dashboard" replace />} />

                  <Route path="/medicines" element={<MedicineInventory />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/purchase-orders" element={<PurchaseOrders />} />
                  <Route path="/stock-logs" element={<StockLogs />} />
                  <Route path="/expiry-tracking" element={<ExpiryTracking />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route
                    path="/reports"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                        <Reports />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/settings" element={<Settings />} />

                  {/* Admin-only Governance & Monitoring Routes */}
                  <Route
                    path="/users"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <Users />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/roles" element={<Navigate to="/users" replace />} />
                  <Route
                    path="/system-monitoring"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                </Route>

                {/* Fallback redirect for top-level routes */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

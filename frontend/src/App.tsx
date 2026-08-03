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

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const hasToken = !!localStorage.getItem('accessToken');
  const hasSavedUser = !!localStorage.getItem('medistock_user');
  const isAuth = isAuthenticated || !!user || (hasToken && hasSavedUser);

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

                {/* Protected Dashboard Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="medicines" element={<MedicineInventory />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="suppliers" element={<Suppliers />} />
                  <Route path="purchase-orders" element={<PurchaseOrders />} />
                  <Route path="stock-logs" element={<StockLogs />} />
                  <Route path="expiry-tracking" element={<ExpiryTracking />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

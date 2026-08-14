import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const savedUserRaw = localStorage.getItem('medistock_user') || sessionStorage.getItem('medistock_user');
  let activeUser: any = user;
  if (savedUserRaw && savedUserRaw !== 'undefined' && savedUserRaw !== 'null') {
    try {
      activeUser = JSON.parse(savedUserRaw);
    } catch (e) {}
  }

  if (!isAuthenticated && !activeUser) {
    return <Navigate to="/login" replace />;
  }

  const rawRole = String(activeUser?.role || activeUser?.roles?.[0] || user?.role || '').toLowerCase();
  const email = (activeUser?.email || user?.email || '').toLowerCase();

  if (rawRole.includes('admin') || email === 'admin@medistock.com') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (rawRole.includes('supplier') || email.includes('supplier')) {
    return <Navigate to="/supplier-dashboard" replace />;
  }

  if (rawRole.includes('staff') || email === 'staff@medistock.com') {
    return <Navigate to="/staff-dashboard" replace />;
  }

  return <Navigate to="/pharmacist-dashboard" replace />;
};

export default Dashboard;

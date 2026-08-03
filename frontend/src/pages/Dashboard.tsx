import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboardView } from '../components/dashboard/AdminDashboardView';
import { PharmacistDashboardView } from '../components/dashboard/PharmacistDashboardView';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const userRoleStr = (user?.role || (user as any)?.roles?.[0] || '').toLowerCase();
  const isAdmin = userRoleStr.includes('admin');

  if (isAdmin) {
    return <AdminDashboardView />;
  }

  return <PharmacistDashboardView />;
};

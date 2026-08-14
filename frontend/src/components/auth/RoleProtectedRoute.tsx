import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isAuth = isAuthenticated && !!user;

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const email = (user?.email || '').toLowerCase();
  const rawRole = (user?.role || (user as any)?.roles?.[0] || '').toString().toLowerCase();

  let userRoleNorm = 'pharmacist';
  if (rawRole.includes('admin') || email === 'admin@medistock.com') {
    userRoleNorm = 'admin';
  } else if (rawRole.includes('supplier') || email.includes('supplier')) {
    userRoleNorm = 'supplier';
  } else if (rawRole.includes('staff') || email === 'staff@medistock.com') {
    userRoleNorm = 'staff';
  } else {
    userRoleNorm = 'pharmacist';
  }

  const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

  const isAllowed = normalizedAllowedRoles.some((allowed) => {
    if (allowed.includes('admin') && userRoleNorm === 'admin') return true;
    if (allowed.includes('pharm') && userRoleNorm === 'pharmacist') return true;
    if (allowed.includes('staff') && userRoleNorm === 'staff') return true;
    if (allowed.includes('supplier') && userRoleNorm === 'supplier') return true;
    return false;
  });

  if (!isAllowed) {
    if (userRoleNorm === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userRoleNorm === 'supplier') {
      return <Navigate to="/supplier-dashboard" replace />;
    } else if (userRoleNorm === 'staff') {
      return <Navigate to="/staff-dashboard" replace />;
    } else {
      return <Navigate to="/pharmacist-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;

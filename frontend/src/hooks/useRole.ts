import { useAuth } from '../context/AuthContext';

export type UserRole = 'ADMIN' | 'PHARMACIST' | 'STAFF' | 'SUPPLIER' | 'USER';

export const useRole = () => {
  const { user, isAuthenticated } = useAuth();

  const roleRaw = (user?.role || (user as any)?.roles?.[0] || '').toString().toUpperCase();
  const email = (user?.email || '').toLowerCase();

  const isAdmin = Boolean(isAuthenticated && (roleRaw.includes('ADMIN') || email === 'admin@medistock.com'));
  const isSupplier = Boolean(isAuthenticated && !isAdmin && (roleRaw.includes('SUPPLIER') || roleRaw.includes('SUPPLY') || email.includes('supplier')));
  const isStaff = Boolean(isAuthenticated && !isAdmin && !isSupplier && (roleRaw.includes('STAFF') || email === 'staff@medistock.com'));
  const isPharmacist = Boolean(isAuthenticated && !isAdmin && !isSupplier && !isStaff && (roleRaw.includes('PHARM') || email === 'pharmacist@medistock.com' || (!roleRaw && isAuthenticated)));

  let role: UserRole = 'USER';
  if (isAdmin) role = 'ADMIN';
  else if (isSupplier) role = 'SUPPLIER';
  else if (isStaff) role = 'STAFF';
  else if (isPharmacist) role = 'PHARMACIST';
  else if (isAuthenticated && roleRaw) {
    const cleanRole = roleRaw.replace('ROLE_', '').trim();
    role = (cleanRole as UserRole) || 'USER';
  }

  const hasRole = (requiredRole: string | string[]): boolean => {
    if (!isAuthenticated) return false;
    const required = (Array.isArray(requiredRole) ? requiredRole : [requiredRole]).map((r) => r.toUpperCase());
    return required.some((r) => r.includes(role));
  };

  return {
    role,
    isAdmin,
    isPharmacist,
    isStaff,
    isSupplier,
    hasRole,
  };
};

export default useRole;



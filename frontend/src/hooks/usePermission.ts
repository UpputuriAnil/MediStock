import { useRole } from './useRole';

export const ADMIN_PERMISSIONS = [
  'USER_MANAGEMENT',
  'ROLE_MANAGEMENT',
  'PERMISSION_MANAGEMENT',
  'MEDICINE_MANAGEMENT',
  'SUPPLIER_MANAGEMENT',
  'PURCHASE_MANAGEMENT',
  'INVENTORY_MANAGEMENT',
  'EXPIRY_MANAGEMENT',
  'NOTIFICATIONS_MANAGEMENT',
  'REPORTS_MANAGEMENT',
  'SYSTEM_MONITORING',
  'MEDICINE_DELETE',
  'SUPPLIER_DELETE',
] as const;

export const PHARMACIST_PERMISSIONS = [
  'MEDICINE_MANAGEMENT',
  'SUPPLIER_MANAGEMENT',
  'PURCHASE_MANAGEMENT',
  'INVENTORY_MANAGEMENT',
  'EXPIRY_MANAGEMENT',
  'NOTIFICATIONS_MANAGEMENT',
  'REPORTS_MANAGEMENT',
] as const;

export type Permission = typeof ADMIN_PERMISSIONS[number];

export const usePermission = () => {
  const { isAdmin, isPharmacist } = useRole();

  const hasPermission = (permission: Permission): boolean => {
    if (isAdmin) {
      return (ADMIN_PERMISSIONS as readonly string[]).includes(permission);
    }
    if (isPharmacist) {
      return (PHARMACIST_PERMISSIONS as readonly string[]).includes(permission);
    }
    return false;
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};

export default usePermission;

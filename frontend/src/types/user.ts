export type UserRole = 'Admin' | 'Chief Pharmacist' | 'Inventory Manager' | 'Staff Pharmacist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastActive: string;
  phone?: string;
}

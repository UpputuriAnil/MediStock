export type UserRole = 'Admin' | 'Chief Pharmacist' | 'Supplier' | 'Staff Pharmacist' | 'Pharmacist' | 'Staff' | 'User';

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
  supplierId?: string;
}


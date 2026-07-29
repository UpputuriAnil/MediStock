export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  performanceScore: number; // e.g. 98%
  activeOrders: number;
  totalSupplied: number;
  status: 'Preferred' | 'Active' | 'Under Review';
  rating: number;
}

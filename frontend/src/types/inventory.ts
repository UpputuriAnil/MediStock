export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  supplier: string;
  stock: number;
  minStockThreshold: number;
  unit: string;
  price: number;
  batchNumber: string;
  expiryDate: string;
  manufactureDate: string;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Near Expiry' | 'Expired';
  imageUrl?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  itemCount: number;
  description: string;
  iconName?: string;
}

export interface StockLog {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment' | 'Disposed';
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy: string;
  timestamp: string;
  reason: string;
}

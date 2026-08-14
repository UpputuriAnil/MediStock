export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  medicineId?: string;
  medicineName?: string;
  quantity?: number;
  pricePerUnit?: number;
  assignedPharmacistId?: string;
  assignedPharmacistName?: string;
  assignedPharmacistEmail?: string;
  itemsCount: number;
  totalAmount: number;
  batchNumber?: string;
  expiryDate?: string;
  invoiceNumber?: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled';
  orderedDate: string;
  expectedDelivery: string;
  createdByName: string;
  items?: {
    medicineName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

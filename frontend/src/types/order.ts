export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  itemsCount: number;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderedDate: string;
  expectedDelivery: string;
  createdByName: string;
  items?: {
    medicineName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

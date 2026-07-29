export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  read: boolean;
  category: 'Stock' | 'Expiry' | 'Order' | 'System';
}

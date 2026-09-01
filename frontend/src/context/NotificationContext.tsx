import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types/notification';
import { useAuth } from './AuthContext';
import { getDaysRemaining } from '../utils/formatters';
import { MOCK_MEDICINES } from '../services/mockData';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
}

const SUPPLIER_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_sup_1',
    title: 'New Purchase Order Requisition',
    message: 'New Purchase Order PO-8824 created by Central Pharmacy for 500 units of Amoxicillin Trihydrate. Action required.',
    timestamp: '10 mins ago',
    type: 'alert',
    read: false,
    category: 'Order',
  },
  {
    id: 'n_sup_2',
    title: 'Consignment Shipment Request',
    message: 'Purchase Order PO-8802 requires consignment dispatch confirmation for BioPharma Global.',
    timestamp: '1 hour ago',
    type: 'warning',
    read: false,
    category: 'Order',
  },
  {
    id: 'n_sup_3',
    title: 'Delivery Acknowledgment & Restock',
    message: 'Purchase Order PO-8801 marked as Delivered & Received into Central Stock by Pharmacy Manager.',
    timestamp: '3 hours ago',
    type: 'success',
    read: true,
    category: 'Order',
  },
  {
    id: 'n_sup_4',
    title: 'Vendor Fulfillment Rating Updated',
    message: 'Your Supplier Fulfillment Rating was updated to 98.5% (Grade A+ Certified Partner).',
    timestamp: 'Yesterday',
    type: 'info',
    read: true,
    category: 'System',
  },
  {
    id: 'n_sup_5',
    title: 'Low Stock Reorder Notice',
    message: 'Hospital inventory for Paracetamol 500mg Vials is low. Reorder requisition recommended for Apex BioPharma.',
    timestamp: '2 days ago',
    type: 'warning',
    read: true,
    category: 'Stock',
  },
];

const STAFF_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_stf_1',
    title: 'Operational Low Stock Warning',
    message: 'Amoxicillin 500mg reaches minimum threshold (15 units remaining in Ward A inventory).',
    timestamp: '15 mins ago',
    type: 'warning',
    read: false,
    category: 'Stock',
  },
  {
    id: 'n_stf_2',
    title: 'Restock Action Logged',
    message: 'Restock of 500 units of Paracetamol 500mg Vials recorded into main catalog.',
    timestamp: '2 hours ago',
    type: 'success',
    read: false,
    category: 'Stock',
  },
  {
    id: 'n_stf_3',
    title: 'Batch Expiry Warning',
    message: 'Lantus SoloStar Insulin (Batch BT-90112) expires in 19 days. Rotate stock to front.',
    timestamp: '5 hours ago',
    type: 'warning',
    read: true,
    category: 'Expiry',
  },
  {
    id: 'n_stf_4',
    title: 'Shift Task Assignment',
    message: 'Routine physical inventory stock count requested for Respiratory & Asthma aisle.',
    timestamp: 'Yesterday',
    type: 'info',
    read: true,
    category: 'System',
  },
];

const PHARMACIST_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_phm_1',
    title: 'Out of Stock Critical Alert',
    message: 'EpiPen Auto-Injector 0.3mg reached 0 units. Immediate reorder requisition suggested.',
    timestamp: '10 mins ago',
    type: 'alert',
    read: false,
    category: 'Stock',
  },
  {
    id: 'n_phm_2',
    title: 'Near Expiry Warning',
    message: 'Lantus SoloStar Insulin (Batch BT-90112) expires in 19 days. Prioritize dispensing.',
    timestamp: '1 hour ago',
    type: 'warning',
    read: false,
    category: 'Expiry',
  },
  {
    id: 'n_phm_3',
    title: 'Shipment Dispatched Notice',
    message: 'Purchase Order PO-8802 (Pfizer Direct / BioPharma Global) is now in transit.',
    timestamp: '3 hours ago',
    type: 'info',
    read: true,
    category: 'Order',
  },
  {
    id: 'n_phm_4',
    title: 'Quarterly Stock Audit Verified',
    message: 'Quarterly inventory audit for Antibiotics finished with 99.8% precision.',
    timestamp: 'Yesterday',
    type: 'success',
    read: true,
    category: 'System',
  },
];

const ADMIN_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_adm_1',
    title: 'User Governance Audit Alert',
    message: 'User role permissions modified for Staff Member account sarah.jenkins@medistock.health.',
    timestamp: '5 mins ago',
    type: 'info',
    read: false,
    category: 'System',
  },
  {
    id: 'n_adm_2',
    title: 'Critical Out of Stock Emergency',
    message: 'Emergency item EpiPen Auto-Injector 0.3mg reached 0 units across central network.',
    timestamp: '20 mins ago',
    type: 'alert',
    read: false,
    category: 'Stock',
  },
  {
    id: 'n_adm_3',
    title: 'Vendor Onboarding Complete',
    message: 'Certified distributor Novopharm Global registered to system vendor database.',
    timestamp: '2 hours ago',
    type: 'success',
    read: true,
    category: 'System',
  },
  {
    id: 'n_adm_4',
    title: 'System Security Scan Passed',
    message: 'HIPAA & GxP compliance audit passed with 100% data integrity verified.',
    timestamp: 'Yesterday',
    type: 'success',
    read: true,
    category: 'System',
  },
];

const buildInventoryAlerts = (): NotificationItem[] => {
  let medList: any[] = [];
  try {
    const raw = localStorage.getItem('medistock_medicines');
    if (raw) medList = JSON.parse(raw);
  } catch (e) { }

  if (!Array.isArray(medList) || medList.length === 0) {
    medList = MOCK_MEDICINES;
  }

  const alerts: NotificationItem[] = [];

  medList.forEach((m: any) => {
    if (!m || !m.id) return;
    const stock = Number(m.stock || 0);
    const minThreshold = Number(m.minStockThreshold || 50);
    const daysLeft = getDaysRemaining(m.expiryDate || '2028-01-01');

    // 1. Out of Stock Alert (Critical)
    if (stock === 0 || m.status === 'Out of Stock') {
      alerts.push({
        id: `notif_out_of_stock_${m.id}`,
        title: `Critical Out of Stock Emergency`,
        message: `Medicine "${m.name}" (${m.brandName || m.id}) reached 0 ${m.unit || 'units'} stock across central inventory. Immediate reorder required.`,
        timestamp: 'Just now',
        type: 'alert',
        read: false,
        category: 'Stock',
      });
    }
    // 2. Low Stock Warning (min 50 units or minStockThreshold)
    else if (stock <= 50 || stock <= minThreshold || m.status === 'Low Stock') {
      alerts.push({
        id: `notif_low_stock_${m.id}`,
        title: `Low Stock Reorder Alert (Under 50 Units)`,
        message: `Low inventory level for "${m.name}": ${stock} ${m.unit || 'units'} remaining (Minimum threshold: 50 units).`,
        timestamp: '10 mins ago',
        type: 'warning',
        read: false,
        category: 'Stock',
      });
    }

    // 3. Expired Batch Alert (Past expiry date)
    if (daysLeft < 0 || m.status === 'Expired') {
      alerts.push({
        id: `notif_expired_${m.id}`,
        title: `Expired Batch Disposal Alert`,
        message: `Batch ${m.batchNumber || 'BT-EXP'} of "${m.name}" expired on ${m.expiryDate} (${Math.abs(daysLeft)} days ago). Immediate quarantine & disposal required.`,
        timestamp: '15 mins ago',
        type: 'alert',
        read: false,
        category: 'Expiry',
      });
    }
    // 4. Near Expiry Warning (Within 90 Days)
    else if (daysLeft >= 0 && daysLeft <= 90 || m.status === 'Near Expiry') {
      alerts.push({
        id: `notif_near_expiry_${m.id}`,
        title: `Near Expiry Risk Warning (Within 90 Days)`,
        message: `Batch ${m.batchNumber || 'BT-NEXP'} of "${m.name}" expires in ${daysLeft} days (${m.expiryDate}). Prioritize dispensing before expiration.`,
        timestamp: '30 mins ago',
        type: 'warning',
        read: false,
        category: 'Expiry',
      });
    }
  });

  return alerts;
};

const getStoredNotifications = (roleKey: string, fallback: NotificationItem[]): NotificationItem[] => {
  const dynamicAlerts = buildInventoryAlerts();
  try {
    const raw = localStorage.getItem(`medistock_notifications_${roleKey}`);
    if (raw && raw !== 'undefined' && raw !== 'null') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const storedMap = new Map(parsed.map((item: NotificationItem) => [item.id, item]));
        const mergedDynamic = dynamicAlerts.map((item) => {
          if (storedMap.has(item.id)) {
            return storedMap.get(item.id)!;
          }
          return item;
        });

        const dynamicIds = new Set(dynamicAlerts.map((a) => a.id));
        const customStored = parsed.filter((item: NotificationItem) => !dynamicIds.has(item.id));
        return [...mergedDynamic, ...customStored];
      }
    }
  } catch (e) { }

  const fallbackIds = new Set(fallback.map((f) => f.id));
  const uniqueDynamic = dynamicAlerts.filter((a) => !fallbackIds.has(a.id));
  return [...uniqueDynamic, ...fallback];
};

const setStoredNotifications = (roleKey: string, items: NotificationItem[]) => {
  try {
    localStorage.setItem(`medistock_notifications_${roleKey}`, JSON.stringify(items));
  } catch (e) { }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Role detection for role-based notifications
  const userRoleStr = (user?.role || (user as any)?.roles?.[0] || 'Pharmacist').toString().toLowerCase();
  const userEmail = (user?.email || '').toLowerCase();

  let currentRoleKey = 'pharmacist';
  let defaultList = PHARMACIST_NOTIFICATIONS;

  if (userRoleStr.includes('admin') || userEmail === 'admin@medistock.com') {
    currentRoleKey = 'admin';
    defaultList = ADMIN_NOTIFICATIONS;
  } else if (userRoleStr.includes('supplier') || userEmail.includes('supplier')) {
    currentRoleKey = 'supplier';
    defaultList = SUPPLIER_NOTIFICATIONS;
  } else if (userRoleStr.includes('staff') || userEmail === 'staff@medistock.com') {
    currentRoleKey = 'staff';
    defaultList = STAFF_NOTIFICATIONS;
  } else {
    currentRoleKey = 'pharmacist';
    defaultList = PHARMACIST_NOTIFICATIONS;
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStoredNotifications(currentRoleKey, defaultList)
  );

  // Sync notifications whenever logged in user / role changes!
  useEffect(() => {
    const loaded = getStoredNotifications(currentRoleKey, defaultList);
    setNotifications(loaded);
  }, [currentRoleKey, userEmail]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      setStoredNotifications(currentRoleKey, updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      setStoredNotifications(currentRoleKey, updated);
      return updated;
    });
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      setStoredNotifications(currentRoleKey, updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setStoredNotifications(currentRoleKey, []);
    toast.success('Notification center cleared');
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `n_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newItem, ...prev];
      setStoredNotifications(currentRoleKey, updated);
      return updated;
    });

    // Also push to supplier storage if order notification!
    if (item.category === 'Order') {
      const supExisting = getStoredNotifications('supplier', SUPPLIER_NOTIFICATIONS);
      setStoredNotifications('supplier', [newItem, ...supExisting]);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

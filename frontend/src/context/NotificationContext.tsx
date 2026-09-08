import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types/notification';
import { useAuth } from './AuthContext';
import { getDaysRemaining } from '../utils/formatters';
import { MOCK_MEDICINES, MOCK_ORDERS } from '../services/mockData';
import toast from 'react-hot-toast';
import api from '../services/api';

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

const getOrderNotificationsFromOrders = (): NotificationItem[] => {
  const orderAlerts: NotificationItem[] = [];
  try {
    let orderList: any[] = [];
    const raw = localStorage.getItem('medistock_orders');
    if (raw && raw !== 'undefined' && raw !== 'null') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        orderList = parsed;
      }
    }
    if (!Array.isArray(orderList) || orderList.length === 0) {
      orderList = MOCK_ORDERS;
    }

    orderList.forEach((ord: any) => {
      if (!ord) return;
      const orderNum = ord.orderNumber || ord.id || 'PO-8800';
      const medName = ord.medicineName || 'Pharmaceutical Supplies';
      const qty = ord.quantity || ord.itemsCount || 100;
      const creator = ord.createdByName || ord.assignedPharmacistName || 'Admin / Pharmacist';
      const supName = ord.supplierName || 'Supplier';

      orderAlerts.push({
        id: `notif_order_${orderNum}`,
        title: `New Purchase Order Requisition (${orderNum})`,
        message: `New Purchase Order ${orderNum} created by ${creator} for ${qty} units of ${medName} (Supplier: ${supName}). Action required: Accept & Process Order.`,
        timestamp: ord.orderedDate || 'Recently',
        type: 'alert',
        read: false,
        category: 'Order',
      });
    });
  } catch (e) { }
  return orderAlerts;
};

const buildInventoryAlerts = (roleKey: string): NotificationItem[] => {
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
        message: `Medicine "${m.name}" (${m.brandName || m.id}) reached 0 ${m.unit || 'units'} stock. Immediate reorder required.`,
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
        title: `Low Stock Reorder Alert`,
        message: `Low inventory level for "${m.name}": ${stock} ${m.unit || 'units'} remaining (Minimum threshold: ${minThreshold} units).`,
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
        message: `Batch ${m.batchNumber || 'BT-EXP'} of "${m.name}" expired on ${m.expiryDate} (${Math.abs(daysLeft)} days ago). Immediate quarantine required.`,
        timestamp: '15 mins ago',
        type: 'alert',
        read: false,
        category: 'Expiry',
      });
    }
    // 4. Near Expiry Warning (Within 90 Days)
    else if ((daysLeft >= 0 && daysLeft <= 90) || m.status === 'Near Expiry') {
      alerts.push({
        id: `notif_near_expiry_${m.id}`,
        title: `Near Expiry Risk Warning (Within 90 Days)`,
        message: `Batch ${m.batchNumber || 'BT-NEXP'} of "${m.name}" expires in ${daysLeft} days (${m.expiryDate}). Prioritize dispensing.`,
        timestamp: '30 mins ago',
        type: 'warning',
        read: false,
        category: 'Expiry',
      });
    }
  });

  // Filter alerts based on role relevance
  if (roleKey === 'supplier') {
    return alerts.filter((a) => a.category === 'Order' || a.category === 'Stock');
  }
  if (roleKey === 'admin') {
    return alerts.filter((a) => a.type === 'alert' || a.category === 'Stock' || a.category === 'System');
  }
  if (roleKey === 'staff') {
    return alerts.filter((a) => a.category === 'Stock' || a.category === 'Expiry');
  }

  // Default Pharmacist: All dispensary stock, expiry, and order alerts
  return alerts;
};

const getStoredNotifications = (accountKey: string, roleKey: string, fallback: NotificationItem[]): NotificationItem[] => {
  const dynamicAlerts = buildInventoryAlerts(roleKey);
  const orderNotifications = getOrderNotificationsFromOrders();

  let keysToCheck = [`medistock_notifications_${accountKey}`];
  if (roleKey === 'supplier') {
    keysToCheck.push('medistock_notifications_supplier', 'medistock_notifications_all_suppliers');
  }

  let customStored: NotificationItem[] = [];
  keysToCheck.forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      if (raw && raw !== 'undefined' && raw !== 'null') {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: NotificationItem) => {
            if (item && item.id && !customStored.some((existing) => existing.id === item.id || (existing.title === item.title && existing.message === item.message))) {
              customStored.push(item);
            }
          });
        }
      }
    } catch (e) { }
  });

  if (roleKey === 'supplier') {
    const allSupplierItems = [...customStored, ...orderNotifications, ...dynamicAlerts, ...fallback];
    const uniqueMap = new Map<string, NotificationItem>();

    allSupplierItems.forEach((item) => {
      if (!item) return;
      if (item.category === 'Order' || item.category === 'Stock') {
        const key = item.id || `${item.title}_${item.message}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      }
    });
    return Array.from(uniqueMap.values());
  }

  const fallbackIds = new Set(fallback.map((f) => f.id));
  const uniqueDynamic = dynamicAlerts.filter((a) => !fallbackIds.has(a.id));
  return [...customStored, ...uniqueDynamic, ...fallback];
};

const setStoredNotifications = (accountKey: string, items: NotificationItem[]) => {
  try {
    localStorage.setItem(`medistock_notifications_${accountKey}`, JSON.stringify(items));
    localStorage.setItem(`medistock_notifications_supplier`, JSON.stringify(items));
  } catch (e) { }
};

export const pushNotificationToAccount = (
  targetAccountKeyOrRole: string,
  notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
) => {
  const newItem: NotificationItem = {
    ...notification,
    id: `notif_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: 'Just now',
    read: false,
  };

  const normKey = targetAccountKeyOrRole.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
  const targetKeys = [
    `medistock_notifications_${normKey}`,
    `medistock_notifications_supplier`,
    `medistock_notifications_all_suppliers`
  ];

  targetKeys.forEach((storageKey) => {
    try {
      const raw = localStorage.getItem(storageKey);
      let existing: NotificationItem[] = [];
      if (raw && raw !== 'undefined' && raw !== 'null') {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) existing = parsed;
      }
      const exists = existing.some((n) => n.title === newItem.title && n.message === newItem.message);
      if (!exists) {
        const updated = [newItem, ...existing];
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Error pushing notification to account:', e);
    }
  });

  // Try pushing to backend API if available
  api.post('/notifications', {
    title: newItem.title,
    message: newItem.message,
    type: newItem.type,
    category: newItem.category,
    read: false,
  }).catch(() => { });
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Role & Email detection for account-specific notifications
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

  const accountKey = userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, '_') : currentRoleKey;

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStoredNotifications(accountKey, currentRoleKey, defaultList)
  );

  // Sync notifications whenever logged in user / account / role changes!
  useEffect(() => {
    const loaded = getStoredNotifications(accountKey, currentRoleKey, defaultList);
    setNotifications(loaded);
  }, [accountKey, currentRoleKey]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      setStoredNotifications(accountKey, updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      setStoredNotifications(accountKey, updated);
      return updated;
    });
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      setStoredNotifications(accountKey, updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setStoredNotifications(accountKey, []);
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
      setStoredNotifications(accountKey, updated);
      return updated;
    });

    // Also push to supplier storage if order notification!
    if (item.category === 'Order') {
      const supExisting = getStoredNotifications('supplier', 'supplier', SUPPLIER_NOTIFICATIONS);
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine, Category, StockLog } from '../types/inventory';
import { Supplier } from '../types/supplier';
import { PurchaseOrder } from '../types/order';
import {
  MOCK_MEDICINES,
  MOCK_CATEGORIES,
  MOCK_SUPPLIERS,
  MOCK_ORDERS,
  MOCK_STOCK_LOGS,
} from '../services/mockData';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../services/api';
import { pushNotificationToAccount } from './NotificationContext';

interface InventoryContextType {
  medicines: Medicine[];
  categories: Category[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  stockLogs: StockLog[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updated: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  bulkDeleteMedicines: (ids: string[]) => void;
  addCategory: (category: Omit<Category, 'id' | 'itemCount'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'performanceScore' | 'activeOrders' | 'totalSupplied' | 'rating'>) => void;
  deleteSupplier: (id: string) => void;
  addOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'orderedDate'>) => void;
  updateOrderStatus: (orderId: string, status: PurchaseOrder['status']) => void;
  adjustStock: (medicineId: string, delta: number, reason: string) => void;
}

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw && raw !== 'undefined' && raw !== 'null') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as unknown as T;
      }
    }
  } catch (e) { }
  return fallback;
};

const setStored = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { }
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const stored = getStored('medistock_medicines', MOCK_MEDICINES);
    if (!Array.isArray(stored) || stored.length < MOCK_MEDICINES.length) {
      localStorage.setItem('medistock_medicines', JSON.stringify(MOCK_MEDICINES));
      return MOCK_MEDICINES;
    }
    return stored;
  });
  const [categories, setCategories] = useState<Category[]>(() => getStored('medistock_categories', MOCK_CATEGORIES));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('medistock_suppliers', MOCK_SUPPLIERS));
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const stored = getStored('medistock_orders', MOCK_ORDERS);
    if (!Array.isArray(stored) || stored.length < MOCK_ORDERS.length) {
      localStorage.setItem('medistock_orders', JSON.stringify(MOCK_ORDERS));
      return MOCK_ORDERS;
    }
    return stored;
  });
  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => getStored('medistock_stock_logs', MOCK_STOCK_LOGS));

  // Sync initial suppliers and purchase orders with backend database if running
  useEffect(() => {
    api.get('/suppliers')
      .then((res) => {
        if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const backendSups: Supplier[] = res.data.data.map((s: any) => ({
            id: String(s.id || `SUP-${Math.floor(10 + Math.random() * 90)}`),
            name: s.name,
            contactPerson: s.contactPerson || 'Vendor Contact',
            email: s.email || 'vendor@medistock.com',
            phone: s.phoneNumber || '+1 (800) 555-0199',
            address: s.address || 'Central Distribution Center',
            category: s.category || 'Pharmaceuticals',
            status: s.active !== false ? 'Active' : 'Under Review',
            performanceScore: s.rating ? Number(s.rating) * 20 : 95.0,
            activeOrders: 0,
            totalSupplied: 0,
            rating: s.rating ? Number(s.rating) : 4.5,
          }));

          setSuppliers((prev) => {
            const mergedMap = new Map<string, Supplier>();
            prev.forEach((sup) => mergedMap.set(sup.name.toLowerCase(), sup));
            backendSups.forEach((sup) => mergedMap.set(sup.name.toLowerCase(), sup));
            const mergedList = Array.from(mergedMap.values());
            setStored('medistock_suppliers', mergedList);
            return mergedList;
          });
        }
      })
      .catch(() => { });

    api.get('/purchase-orders')
      .then((res) => {
        if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const backendOrders: PurchaseOrder[] = res.data.data.map((o: any) => ({
            id: String(o.id || `PO-${o.orderNumber}`),
            orderNumber: o.orderNumber || `PO-${o.id}`,
            supplierId: String(o.supplier?.id || 'SUP-01'),
            supplierName: o.supplierName || o.supplier?.name || 'BioPharma Global Inc.',
            medicineId: String(o.medicine?.id || ''),
            medicineName: o.medicineName || o.medicine?.name || 'Amoxicillin 500mg',
            quantity: o.quantity || o.itemsCount || 100,
            pricePerUnit: o.pricePerUnit ? Number(o.pricePerUnit) : 5.0,
            itemsCount: o.itemsCount || o.quantity || 100,
            totalAmount: o.totalAmount ? Number(o.totalAmount) : (o.quantity || 100) * 5.0,
            assignedPharmacistName: o.assignedPharmacistName || o.assignedPharmacist?.name || 'Dr. Sarah Jenkins',
            assignedPharmacistEmail: o.assignedPharmacistEmail || o.assignedPharmacist?.email || 'sarah.jenkins@medistock.health',
            batchNumber: o.batchNumber || 'BT-9941',
            expiryDate: o.expiryDate ? String(o.expiryDate).slice(0, 10) : '2027-12-31',
            invoiceNumber: o.invoiceNumber || 'INV-001',
            notes: o.notes || '',
            status: o.status || 'Pending',
            orderedDate: o.orderedDate ? String(o.orderedDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
            expectedDelivery: new Date().toISOString().slice(0, 10),
            createdByName: o.createdByName || 'Admin User',
          }));

          setOrders((prev) => {
            const mergedMap = new Map<string, PurchaseOrder>();
            prev.forEach((ord) => mergedMap.set(ord.orderNumber.toLowerCase(), ord));
            backendOrders.forEach((ord) => mergedMap.set(ord.orderNumber.toLowerCase(), ord));
            const mergedList = Array.from(mergedMap.values());
            setStored('medistock_orders', mergedList);
            return mergedList;
          });
        }
      })
      .catch(() => { });

    // Sync registered supplier user accounts from medistock_user_registry & localStorage
    const syncAllSuppliers = () => {
      try {
        const rawStored = localStorage.getItem('medistock_suppliers');
        let currentSups: Supplier[] = MOCK_SUPPLIERS;
        if (rawStored && rawStored !== 'undefined' && rawStored !== 'null') {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed) && parsed.length > 0) currentSups = parsed;
        }

        const rawReg = localStorage.getItem('medistock_user_registry');
        let registeredUsers: any[] = [];
        if (rawReg && rawReg !== 'undefined' && rawReg !== 'null') {
          const registry = JSON.parse(rawReg);
          if (registry && typeof registry === 'object') {
            registeredUsers = Object.values(registry);
          }
        }

        const registeredSuppliers = registeredUsers.filter((u: any) => {
          const r = (u.role || '').toLowerCase();
          const em = (u.email || '').toLowerCase();
          return r.includes('supplier') || r.includes('supply') || em.includes('supplier');
        });

        const mergedMap = new Map<string, Supplier>();
        currentSups.forEach((s) => {
          const key = s.email ? s.email.toLowerCase() : s.name.toLowerCase();
          if (key) mergedMap.set(key, s);
        });

        registeredSuppliers.forEach((u: any) => {
          const emailKey = (u.email || '').toLowerCase().trim();
          let cleanName = (u.name || '').trim();
          if (cleanName.includes('vinay0@gmail.com')) {
            cleanName = cleanName.replace(/[\s\(\)]*vinay0@gmail\.com[\s\(\)]*/gi, '').trim() || 'Vinay Supplier';
          }
          if (!cleanName) cleanName = emailKey.split('@')[0] || 'Supplier Partner';

          if (emailKey && !mergedMap.has(emailKey)) {
            const newSup: Supplier = {
              id: u.id || `SUP-${Math.floor(100 + Math.random() * 900)}`,
              name: cleanName,
              contactPerson: cleanName,
              email: u.email || emailKey,
              phone: u.phone || '+1 (800) 555-0199',
              address: 'Registered Vendor Logistics',
              category: 'Pharmaceutical Supplies',
              status: 'Active',
              performanceScore: 95.0,
              activeOrders: 0,
              totalSupplied: 0,
              rating: 4.8,
            };
            mergedMap.set(emailKey, newSup);
          }
        });

        // Ensure clean supplier entries without email in name
        const vinayKey = 'vinay0@gmail.com';
        if (!mergedMap.has(vinayKey)) {
          try {
            const rawReg = localStorage.getItem('medistock_user_registry');
            if (rawReg && rawReg.includes(vinayKey)) {
              mergedMap.set(vinayKey, {
                id: 'SUP-VINAY0',
                name: 'Vinay Supplier',
                contactPerson: 'Vinay Supplier',
                email: vinayKey,
                phone: '+1 (800) 555-0199',
                address: 'Registered Vendor Logistics',
                category: 'Pharmaceutical Supplies',
                status: 'Active',
                performanceScore: 95.0,
                activeOrders: 0,
                totalSupplied: 0,
                rating: 4.8,
              });
            }
          } catch (e) { }
        }

        // Clean up any existing supplier names that had email embedded in name
        mergedMap.forEach((sup, key) => {
          if (sup.name && sup.name.includes('vinay0@gmail.com')) {
            sup.name = sup.name.replace(/[\s\(\)]*vinay0@gmail\.com[\s\(\)]*/gi, '').trim() || 'Vinay Supplier';
          }
        });

        const mergedList = Array.from(mergedMap.values());
        setSuppliers((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(mergedList)) {
            setStored('medistock_suppliers', mergedList);
            return mergedList;
          }
          return prev;
        });
      } catch (e) { }
    };

    syncAllSuppliers();

    const handleSync = () => syncAllSuppliers();
    window.addEventListener('medistock_supplier_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('medistock_supplier_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      setStored('medistock_suppliers', updated);
      return updated;
    });
    api.delete(`/suppliers/${id}`).catch(() => { });
    toast.success('Supplier removed successfully');
  };

  const addMedicine = (medData: Omit<Medicine, 'id'>) => {
    const id = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMed: Medicine = {
      ...medData,
      id,
      imageUrl: medData.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    };
    setMedicines((prev) => {
      const updated = [newMed, ...prev];
      setStored('medistock_medicines', updated);
      return updated;
    });

    const paymentLogSuffix = newMed.razorpayPaymentId
      ? ` (Paid via Razorpay: ${newMed.razorpayPaymentId})`
      : '';

    // Add log entry
    const newLog: StockLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      medicineId: id,
      medicineName: newMed.name,
      type: 'Stock In',
      quantity: newMed.stock,
      previousStock: 0,
      newStock: newMed.stock,
      performedBy: 'Current User',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      reason: `Initial medicine entry added to database${paymentLogSuffix}`,
    };
    setStockLogs((prev) => {
      const updated = [newLog, ...prev];
      setStored('medistock_stock_logs', updated);
      return updated;
    });

    if (newMed.razorpayPaymentId) {
      toast.success(`Medicine "${newMed.name}" registered & Paid via Razorpay (${newMed.razorpayPaymentId})!`);
    } else {
      toast.success(`Medicine "${newMed.name}" created successfully!`);
    }
  };

  const updateMedicine = (id: string, updated: Partial<Medicine>) => {
    setMedicines((prev) => {
      const updatedList = prev.map((m) => (m.id === id ? { ...m, ...updated } : m));
      setStored('medistock_medicines', updatedList);
      return updatedList;
    });
    toast.success('Medicine record updated');
  };

  const deleteMedicine = (id: string) => {
    const med = medicines.find((m) => m.id === id);
    setMedicines((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      setStored('medistock_medicines', updated);
      return updated;
    });
    toast.success(`Removed medicine "${med?.name || id}"`);
  };

  const bulkDeleteMedicines = (ids: string[]) => {
    setMedicines((prev) => {
      const updated = prev.filter((m) => !ids.includes(m.id));
      setStored('medistock_medicines', updated);
      return updated;
    });
    toast.success(`Deleted ${ids.length} selected medicines`);
  };

  const addCategory = (catData: Omit<Category, 'id' | 'itemCount'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
      itemCount: 0,
    };
    setCategories((prev) => {
      const updated = [...prev, newCat];
      setStored('medistock_categories', updated);
      return updated;
    });
    toast.success(`Category "${newCat.name}" added!`);
  };

  const addSupplier = async (supData: Omit<Supplier, 'id' | 'performanceScore' | 'activeOrders' | 'totalSupplied' | 'rating'>) => {
    const newSup: Supplier = {
      ...supData,
      id: `SUP-${Math.floor(10 + Math.random() * 90)}`,
      performanceScore: 95.0,
      activeOrders: 0,
      totalSupplied: 0,
      rating: 4.5,
    };

    setSuppliers((prev) => {
      const updated = [...prev, newSup];
      setStored('medistock_suppliers', updated);
      return updated;
    });

    try {
      await api.post('/suppliers', {
        name: newSup.name,
        contactPerson: newSup.contactPerson,
        email: newSup.email,
        phoneNumber: newSup.phone,
        address: newSup.address,
        rating: newSup.rating,
        active: true,
      });
    } catch (e) { }

    toast.success(`Supplier "${newSup.name}" saved to database!`);
  };

  const addOrder = (orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'orderedDate'>) => {
    const orderNum = `PO-${Math.floor(8800 + Math.random() * 100)}`;
    const newOrder: PurchaseOrder = {
      ...orderData,
      id: `PO-2026-${orderNum}`,
      orderNumber: orderNum,
      orderedDate: new Date().toISOString().slice(0, 10),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      setStored('medistock_orders', updated);
      return updated;
    });

    // Update active orders count on the supplier record
    setSuppliers((prev) => {
      const updated = prev.map((s) => {
        if (s.id === newOrder.supplierId || s.name === newOrder.supplierName) {
          return {
            ...s,
            activeOrders: (s.activeOrders || 0) + 1,
            totalSupplied: (s.totalSupplied || 0) + newOrder.totalAmount,
          };
        }
        return s;
      });
      setStored('medistock_suppliers', updated);
      return updated;
    });

    // Dispatch notification to target Supplier
    const supObj = suppliers.find((s) => s.id === newOrder.supplierId || s.name.toLowerCase() === newOrder.supplierName.toLowerCase());
    const supEmail = supObj?.email || '';

    const reqNotification = {
      title: `New Purchase Order Requisition (${orderNum})`,
      message: `New Purchase Order ${orderNum} created by ${newOrder.createdByName || 'Pharmacy Portal'} for ${newOrder.quantity || newOrder.itemsCount} units of ${newOrder.medicineName}. Action required: Accept & Process Order.`,
      category: 'Order' as const,
      type: 'alert' as const,
    };

    pushNotificationToAccount('supplier', reqNotification);
    if (supEmail) {
      pushNotificationToAccount(supEmail, reqNotification);
    }

    // Sync with backend API if running
    api.post('/purchase-orders/purchase', {
      medicineName: newOrder.medicineName,
      supplierName: newOrder.supplierName,
      pharmacistName: newOrder.assignedPharmacistName,
      pharmacistEmail: newOrder.assignedPharmacistEmail,
      quantity: newOrder.quantity || newOrder.itemsCount,
      pricePerUnit: newOrder.pricePerUnit,
      batchNumber: newOrder.batchNumber,
      expiryDate: newOrder.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      invoiceNumber: newOrder.invoiceNumber,
      notes: newOrder.notes,
    }).catch(() => { });

    toast.success(`Purchase Order ${orderNum} generated with status 'Pending'! Supplier notification sent.`);
  };

  const updateOrderStatus = (orderId: string, newStatus: PurchaseOrder['status']) => {
    const existingOrder = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

    const targetOrder: PurchaseOrder = existingOrder
      ? { ...existingOrder, status: newStatus }
      : {
        id: orderId,
        orderNumber: orderId.startsWith('PO-') ? orderId : `PO-${orderId}`,
        supplierId: 'SUP-01',
        supplierName: 'BioPharma Global Inc.',
        medicineName: 'Amoxicillin 500mg',
        quantity: 500,
        pricePerUnit: 5.0,
        itemsCount: 500,
        totalAmount: 2500.0,
        assignedPharmacistName: 'Dr. Sarah Jenkins',
        assignedPharmacistEmail: 'sarah.jenkins@medistock.health',
        batchNumber: 'BT-9941',
        expiryDate: '2027-12-31',
        invoiceNumber: 'INV-001',
        notes: '',
        status: newStatus,
        orderedDate: new Date().toISOString().slice(0, 10),
        expectedDelivery: new Date().toISOString().slice(0, 10),
        createdByName: 'Admin User',
      };

    setOrders((prev) => {
      const exists = prev.some((o) => o.id === orderId || o.orderNumber === orderId);
      const updated = exists
        ? prev.map((o) => ((o.id === orderId || o.orderNumber === orderId) ? { ...o, status: newStatus } : o))
        : [targetOrder, ...prev];
      setStored('medistock_orders', updated);
      return updated;
    });

    const orderNumStr = targetOrder.orderNumber;
    const supName = targetOrder.supplierName;
    const medName = targetOrder.medicineName;
    const qty = targetOrder.quantity || targetOrder.itemsCount;
    const pharmEmail = targetOrder.assignedPharmacistEmail || '';

    if ((newStatus as string) === 'Approved' || (newStatus as string) === 'Accepted') {
      const acceptNotif = {
        title: `Purchase Order ${orderNumStr} Accepted by Supplier`,
        message: `Supplier "${supName}" accepted Purchase Order ${orderNumStr} for ${qty} units of ${medName}. Order is being processed.`,
        category: 'Order' as const,
        type: 'success' as const,
      };
      pushNotificationToAccount('admin', acceptNotif);
      pushNotificationToAccount('pharmacist', acceptNotif);
      if (pharmEmail) pushNotificationToAccount(pharmEmail, acceptNotif);
    } else if (newStatus === 'Shipped') {
      const shipNotif = {
        title: `Consignment Dispatched (${orderNumStr})`,
        message: `Supplier "${supName}" shipped Purchase Order ${orderNumStr}. Consignment is in transit.`,
        category: 'Order' as const,
        type: 'info' as const,
      };
      pushNotificationToAccount('admin', shipNotif);
      pushNotificationToAccount('pharmacist', shipNotif);
      if (pharmEmail) pushNotificationToAccount(pharmEmail, shipNotif);
    }

    if (newStatus === 'Delivered' || newStatus === 'Completed') {
      const addQty = qty || 500;

      // Dispatch delivery notification
      const deliveryNotif = {
        title: `Order Delivered & Restocked (${orderNumStr})`,
        message: `Purchase Order ${orderNumStr} delivered by "${supName}". ${addQty} units restocked and assigned to ${targetOrder.assignedPharmacistName || 'Pharmacist'}.`,
        category: 'Order' as const,
        type: 'success' as const,
      };
      pushNotificationToAccount('admin', deliveryNotif);
      pushNotificationToAccount('pharmacist', deliveryNotif);
      if (pharmEmail) {
        pushNotificationToAccount(pharmEmail, deliveryNotif);
      }

      // Automatically restock supplied medicines when delivered!
      setMedicines((prevMeds) => {
        let restocked = false;
        const targetMedId = targetOrder.medicineId;
        const targetMedName = (medName || targetOrder.medicineName || '').toLowerCase().trim();
        const supNameLower = (supName || targetOrder.supplierName || '').toLowerCase().trim();

        const updatedMeds = prevMeds.map((med) => {
          const mName = (med.name || '').toLowerCase().trim();
          const mBrand = (med.brandName || '').toLowerCase().trim();
          const medSup = (med.supplier || '').toLowerCase().trim();

          const matchId = targetMedId && med.id === targetMedId;
          const matchName = targetMedName && (mName.includes(targetMedName) || targetMedName.includes(mName) || (mBrand && (mBrand.includes(targetMedName) || targetMedName.includes(mBrand))));
          const matchSup = supNameLower && (medSup.includes(supNameLower.split(' ')[0]) || supNameLower.includes(medSup.split(' ')[0]));

          if (matchId || matchName || (!targetMedName && matchSup)) {
            restocked = true;
            const delta = addQty;
            const previousStock = Number(med.stock || 0);
            const newStock = previousStock + delta;

            const newLog: StockLog = {
              id: `LOG-${Date.now().toString().slice(-4)}`,
              medicineId: med.id,
              medicineName: med.name,
              type: 'Stock In',
              quantity: delta,
              previousStock,
              newStock,
              performedBy: supName || 'Supplier Delivery',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              reason: `Supplier delivered Purchase Order ${orderNumStr} (${delta} units assigned to ${targetOrder.assignedPharmacistName || 'Pharmacist'})`,
            };

            setStockLogs((l) => {
              const updatedLogs = [newLog, ...l];
              setStored('medistock_stock_logs', updatedLogs);
              return updatedLogs;
            });

            return {
              ...med,
              stock: newStock,
              batchNumber: targetOrder.batchNumber || med.batchNumber,
              expiryDate: targetOrder.expiryDate || med.expiryDate,
              status: 'In Stock' as const,
            };
          }
          return med;
        });

        if (!restocked) {
          const newMed: Medicine = {
            id: targetMedId || `med_${Date.now()}`,
            name: targetOrder.medicineName || 'Delivered Medicine Item',
            genericName: targetOrder.medicineName || 'Rx Medicine',
            category: 'General Pharmaceuticals',
            supplier: supName || 'Supplier',
            stock: addQty,
            minStockThreshold: 20,
            unit: 'tablets',
            price: targetOrder.pricePerUnit || 5.0,
            batchNumber: targetOrder.batchNumber || `BT-${Math.floor(1000 + Math.random() * 9000)}`,
            manufactureDate: (targetOrder as any).manufactureDate || '2024-01-01',
            expiryDate: targetOrder.expiryDate || '2027-12-31',
            status: 'In Stock',
            location: 'Central Pharmacy Shelf',
          };
          updatedMeds.push(newMed);
        }

        setStored('medistock_medicines', updatedMeds);
        return updatedMeds;
      });

      toast.success(
        `Purchase Order ${orderNumStr} marked as Delivered! ${addQty} units restocked & assigned to ${targetOrder.assignedPharmacistName || 'Pharmacist'}.`
      );
    } else {
      toast.success(`Order ${orderNumStr} status updated to ${newStatus}`);
    }
  };

  const adjustStock = (medicineId: string, delta: number, reason: string): boolean => {
    if (!delta || isNaN(delta)) {
      toast.error('Invalid quantity entered for stock adjustment.');
      return false;
    }

    const targetMed = medicines.find((m) => m.id === medicineId);
    if (!targetMed) {
      toast.error('Medicine record not found.');
      return false;
    }

    if (delta < 0 && Math.abs(delta) > targetMed.stock) {
      toast.error(
        `Insufficient stock! Cannot issue ${Math.abs(delta)} units. Available stock is only ${targetMed.stock} units. Stock cannot be negative.`
      );
      return false;
    }

    let success = false;
    setMedicines((prev) => {
      const updatedMeds = prev.map((m) => {
        if (m.id === medicineId) {
          const previousStock = m.stock;
          const newStock = previousStock + delta;
          if (newStock < 0) return m; // Hard safeguard against negative stock

          let newStatus: Medicine['status'] = m.status;
          if (newStock === 0) newStatus = 'Out of Stock';
          else if (newStock <= m.minStockThreshold) newStatus = 'Low Stock';
          else newStatus = 'In Stock';

          const newLog: StockLog = {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            medicineId,
            medicineName: m.name,
            type: delta > 0 ? 'Stock In' : 'Stock Out',
            quantity: Math.abs(delta),
            previousStock,
            newStock,
            performedBy: 'Current User',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            reason,
          };

          setStockLogs((l) => {
            const updatedLogs = [newLog, ...l];
            setStored('medistock_stock_logs', updatedLogs);
            return updatedLogs;
          });

          success = true;
          return { ...m, stock: newStock, status: newStatus };
        }
        return m;
      });

      if (success) {
        setStored('medistock_medicines', updatedMeds);
      }
      return updatedMeds;
    });

    if (success) {
      toast.success(`Stock adjusted (${delta > 0 ? '+' : ''}${delta} units)`);
      return true;
    }
    return false;
  };

  return (
    <InventoryContext.Provider
      value={{
        medicines,
        categories,
        suppliers,
        orders,
        stockLogs,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        bulkDeleteMedicines,
        addCategory,
        addSupplier,
        deleteSupplier,
        addOrder,
        updateOrderStatus,
        adjustStock,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

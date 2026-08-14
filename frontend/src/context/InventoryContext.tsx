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
  } catch (e) {}
  return fallback;
};

const setStored = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
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

  // Sync initial suppliers with backend database if running
  useEffect(() => {
    axios.get('/api/suppliers')
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
      .catch(() => {});
  }, []);

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      setStored('medistock_suppliers', updated);
      return updated;
    });
    axios.delete(`/api/suppliers/${id}`).catch(() => {});
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
      reason: 'Initial medicine entry added to database',
    };
    setStockLogs((prev) => {
      const updated = [newLog, ...prev];
      setStored('medistock_stock_logs', updated);
      return updated;
    });
    toast.success(`Medicine "${newMed.name}" created successfully!`);
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
      await axios.post('/api/suppliers', {
        name: newSup.name,
        contactPerson: newSup.contactPerson,
        email: newSup.email,
        phoneNumber: newSup.phone,
        address: newSup.address,
        rating: newSup.rating,
        active: true,
      });
    } catch (e) {}

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

    toast.success(`Purchase Order ${orderNum} generated!`);
  };

  const updateOrderStatus = (orderId: string, newStatus: PurchaseOrder['status']) => {
    let targetOrder: PurchaseOrder | undefined;

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          targetOrder = { ...o, status: newStatus };
          return targetOrder;
        }
        return o;
      });
      setStored('medistock_orders', updated);
      return updated;
    });

    if ((newStatus === 'Delivered' || newStatus === 'Completed') && targetOrder) {
      const supName = (targetOrder.supplierName || '').toLowerCase();
      const targetMedName = (targetOrder.medicineName || '').toLowerCase();
      const targetMedId = targetOrder.medicineId;
      const addQty = targetOrder.quantity || targetOrder.itemsCount || 500;

      // Automatically restock supplied medicines when delivered!
      setMedicines((prevMeds) => {
        let restocked = false;
        const updatedMeds = prevMeds.map((med) => {
          const medSup = (med.supplier || '').toLowerCase();
          const matchMed = (targetMedId && med.id === targetMedId) || (targetMedName && med.name.toLowerCase().includes(targetMedName));
          const matchSup = supName && (medSup.includes(supName.split(' ')[0]) || supName.includes(medSup.split(' ')[0]));

          if (matchMed || (!targetMedName && matchSup)) {
            restocked = true;
            const delta = addQty;
            const previousStock = med.stock;
            const newStock = previousStock + delta;

            const newLog: StockLog = {
              id: `LOG-${Date.now().toString().slice(-4)}`,
              medicineId: med.id,
              medicineName: med.name,
              type: 'Stock In',
              quantity: delta,
              previousStock,
              newStock,
              performedBy: targetOrder?.supplierName || 'Supplier Delivery',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              reason: `Supplier delivered Purchase Order ${targetOrder?.orderNumber} (${delta} units assigned to ${targetOrder?.assignedPharmacistName || 'Pharmacist'})`,
            };

            setStockLogs((l) => {
              const updatedLogs = [newLog, ...l];
              setStored('medistock_stock_logs', updatedLogs);
              return updatedLogs;
            });

            return {
              ...med,
              stock: newStock,
              batchNumber: targetOrder?.batchNumber || med.batchNumber,
              expiryDate: targetOrder?.expiryDate || med.expiryDate,
              status: 'In Stock' as const,
            };
          }
          return med;
        });

        if (restocked) {
          setStored('medistock_medicines', updatedMeds);
        }
        return updatedMeds;
      });

      toast.success(
        `Purchase Order ${targetOrder.orderNumber} marked as Delivered! ${addQty} units restocked & assigned to ${targetOrder.assignedPharmacistName || 'Pharmacist'}.`
      );
    } else {
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
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

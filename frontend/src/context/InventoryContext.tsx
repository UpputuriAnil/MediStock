import React, { createContext, useContext, useState } from 'react';
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
  addOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'orderedDate'>) => void;
  adjustStock: (medicineId: string, delta: number, reason: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(MOCK_MEDICINES);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [orders, setOrders] = useState<PurchaseOrder[]>(MOCK_ORDERS);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(MOCK_STOCK_LOGS);

  const addMedicine = (medData: Omit<Medicine, 'id'>) => {
    const id = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMed: Medicine = {
      ...medData,
      id,
      imageUrl: medData.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    };
    setMedicines((prev) => [newMed, ...prev]);

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
    setStockLogs((prev) => [newLog, ...prev]);
    toast.success(`Medicine "${newMed.name}" created successfully!`);
  };

  const updateMedicine = (id: string, updated: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
    toast.success('Medicine record updated');
  };

  const deleteMedicine = (id: string) => {
    const med = medicines.find((m) => m.id === id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    toast.success(`Removed medicine "${med?.name || id}"`);
  };

  const bulkDeleteMedicines = (ids: string[]) => {
    setMedicines((prev) => prev.filter((m) => !ids.includes(m.id)));
    toast.success(`Deleted ${ids.length} selected medicines`);
  };

  const addCategory = (catData: Omit<Category, 'id' | 'itemCount'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
      itemCount: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    toast.success(`Category "${newCat.name}" added!`);
  };

  const addSupplier = (supData: Omit<Supplier, 'id' | 'performanceScore' | 'activeOrders' | 'totalSupplied' | 'rating'>) => {
    const newSup: Supplier = {
      ...supData,
      id: `SUP-${Math.floor(10 + Math.random() * 90)}`,
      performanceScore: 95.0,
      activeOrders: 0,
      totalSupplied: 0,
      rating: 4.5,
    };
    setSuppliers((prev) => [...prev, newSup]);
    toast.success(`Supplier "${newSup.name}" registered!`);
  };

  const addOrder = (orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'orderedDate'>) => {
    const orderNum = `PO-${Math.floor(8800 + Math.random() * 100)}`;
    const newOrder: PurchaseOrder = {
      ...orderData,
      id: `PO-2026-${orderNum}`,
      orderNumber: orderNum,
      orderedDate: new Date().toISOString().slice(0, 10),
    };
    setOrders((prev) => [newOrder, ...prev]);
    toast.success(`Purchase Order ${orderNum} generated!`);
  };

  const adjustStock = (medicineId: string, delta: number, reason: string) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medicineId) {
          const previousStock = m.stock;
          const newStock = Math.max(0, previousStock + delta);
          let newStatus: Medicine['status'] = m.status;
          if (newStock === 0) newStatus = 'Out of Stock';
          else if (newStock <= m.minStockThreshold) newStatus = 'Low Stock';
          else newStatus = 'In Stock';

          // log
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
          setStockLogs((l) => [newLog, ...l]);

          return { ...m, stock: newStock, status: newStatus };
        }
        return m;
      })
    );
    toast.success(`Stock adjusted by ${delta > 0 ? '+' : ''}${delta}`);
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
        addOrder,
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

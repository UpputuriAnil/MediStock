import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MedicineFilterBar } from '../components/medicine/MedicineFilterBar';
import { MedicineTable } from '../components/medicine/MedicineTable';
import { MedicineCard } from '../components/medicine/MedicineCard';
import { AddEditMedicineModal } from '../components/medicine/AddEditMedicineModal';
import { MedicineDrawer } from '../components/medicine/MedicineDrawer';
import { useInventory } from '../context/InventoryContext';
import { Button } from '../components/common/Button';
import { Medicine } from '../types/inventory';
import { getDaysRemaining } from '../utils/formatters';

import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';

export const MedicineInventory: React.FC = () => {
  const { medicines, deleteMedicine, bulkDeleteMedicines, categories, suppliers } = useInventory();
  const { user } = useAuth();
  const { isAdmin, isPharmacist, isStaff, isSupplier } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedExpiryRange, setSelectedExpiryRange] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawer state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);

  const canAddMedicine = isAdmin || isPharmacist;

  // Filtered medicine list (search/filter by name, category, supplier, batch number, expiry date, status)
  const filteredMedicines = medicines.filter((m) => {
    if (isSupplier) {
      const uName = (user?.name || '').toLowerCase();
      const uEmail = (user?.email || '').toLowerCase();
      const uPrefix = uEmail.split('@')[0] || '';

      const hasSpecificMatch = medicines.some((med) => {
        const s = (med.supplier || '').toLowerCase();
        return (
          (uName && uName !== 'user' && uName !== 'supplier' && (s.includes(uName) || uName.includes(s))) ||
          (uPrefix && uPrefix.length > 3 && uPrefix !== 'supplier' && (s.includes(uPrefix) || uPrefix.includes(s)))
        );
      });

      if (hasSpecificMatch) {
        const s = (m.supplier || '').toLowerCase();
        const isMatch = (
          (uName && uName !== 'user' && uName !== 'supplier' && (s.includes(uName) || uName.includes(s))) ||
          (uPrefix && uPrefix.length > 3 && uPrefix !== 'supplier' && (s.includes(uPrefix) || uPrefix.includes(s)))
        );
        if (!isMatch) return false;
      }
    }

    const query = searchQuery.trim().toLowerCase();

    // Multi-attribute free-text search matching
    const matchesSearch =
      !query ||
      (m.name || '').toLowerCase().includes(query) ||
      (m.genericName || '').toLowerCase().includes(query) ||
      (m.category || '').toLowerCase().includes(query) ||
      (m.supplier || '').toLowerCase().includes(query) ||
      (m.batchNumber || '').toLowerCase().includes(query) ||
      (m.expiryDate || '').toLowerCase().includes(query) ||
      (m.location || '').toLowerCase().includes(query) ||
      (m.status || '').toLowerCase().includes(query);

    // Dropdown filters
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSup = selectedSupplier === 'All' || m.supplier === selectedSupplier;
    const matchesStat = selectedStatus === 'All' || m.status === selectedStatus;

    // Expiry date range filter
    let matchesExpiry = true;
    if (selectedExpiryRange !== 'All') {
      const daysLeft = getDaysRemaining(m.expiryDate);
      if (selectedExpiryRange === 'Expired') {
        matchesExpiry = daysLeft < 0;
      } else if (selectedExpiryRange === '30 Days') {
        matchesExpiry = daysLeft >= 0 && daysLeft <= 30;
      } else if (selectedExpiryRange === '60 Days') {
        matchesExpiry = daysLeft >= 0 && daysLeft <= 60;
      } else if (selectedExpiryRange === '90 Days') {
        matchesExpiry = daysLeft >= 0 && daysLeft <= 90;
      }
    }

    return matchesSearch && matchesCat && matchesSup && matchesStat && matchesExpiry;
  });

  const categoryNames = categories.map((c) => c.name);
  const supplierNames = suppliers.map((s) => s.name);

  // Compute summary metrics
  const totalMedicinesCount = filteredMedicines.length;
  const totalAvailableStock = filteredMedicines.reduce((sum, m) => sum + m.stock, 0);
  const lowStockCount = filteredMedicines.filter((m) => m.status === 'Low Stock' || m.status === 'Out of Stock').length;
  const expiredOrNearExpiryCount = filteredMedicines.filter((m) => {
    const days = getDaysRemaining(m.expiryDate);
    return days <= 30 || m.status === 'Near Expiry' || m.status === 'Expired';
  }).length;

  return (
    <div className="space-y-6">
      {/* Page Header Title & Add Medicine Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isSupplier ? 'Authorized Supplied Medicines Catalog' : 'Medicine Inventory Catalog'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSupplier
              ? 'Access Principle: Viewing only products authorized for supply by your vendor account'
              : 'Manage pharmaceutical items, batch expiration timelines, unit prices, and stock locations'}
          </p>
        </div>

        {canAddMedicine && (
          <Button
            onClick={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
            variant="primary"
            size="md"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Medicine
          </Button>
        )}
      </div>

      {/* Task 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            💊
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Medicines</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalMedicinesCount} SKUs</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            📦
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalAvailableStock.toLocaleString()} Units</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            ⚠️
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{lowStockCount} Items</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            ⏳
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expired / Near Expiry</p>
            <p className="text-xl font-black text-red-600 dark:text-red-400">{expiredOrNearExpiryCount} Items</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <MedicineFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedExpiryRange={selectedExpiryRange}
        setSelectedExpiryRange={setSelectedExpiryRange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        categories={categoryNames}
        suppliers={supplierNames}
        medicines={filteredMedicines}
        selectedCount={selectedIds.length}
        onBulkDelete={() => {
          bulkDeleteMedicines(selectedIds);
          setSelectedIds([]);
        }}
        onAddMedicine={() => {
          setEditingMedicine(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* View Switcher: Table or Grid */}
      {viewMode === 'table' ? (
        <MedicineTable
          medicines={filteredMedicines}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onView={(med) => setViewingMedicine(med)}
          onEdit={(med) => {
            setEditingMedicine(med);
            setIsAddModalOpen(true);
          }}
          onDelete={(id) => deleteMedicine(id)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onView={(m) => setViewingMedicine(m)}
              onEdit={(m) => {
                setEditingMedicine(m);
                setIsAddModalOpen(true);
              }}
              onDelete={(id) => deleteMedicine(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        medicineToEdit={editingMedicine}
      />

      {/* Detail Slide-over Drawer */}
      <MedicineDrawer
        isOpen={!!viewingMedicine}
        onClose={() => setViewingMedicine(null)}
        medicine={viewingMedicine}
      />
    </div>
  );
};

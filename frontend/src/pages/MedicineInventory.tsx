import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MedicineFilterBar } from '../components/medicine/MedicineFilterBar';
import { MedicineTable } from '../components/medicine/MedicineTable';
import { MedicineCard } from '../components/medicine/MedicineCard';
import { AddEditMedicineModal } from '../components/medicine/AddEditMedicineModal';
import { MedicineDrawer } from '../components/medicine/MedicineDrawer';
import { useInventory } from '../context/InventoryContext';
import { Medicine } from '../types/inventory';

export const MedicineInventory: React.FC = () => {
  const { medicines, deleteMedicine, bulkDeleteMedicines, categories, suppliers } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawer state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);

  // Filtered medicine list
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSup = selectedSupplier === 'All' || m.supplier === selectedSupplier;
    const matchesStat = selectedStatus === 'All' || m.status === selectedStatus;

    return matchesSearch && matchesCat && matchesSup && matchesStat;
  });

  const categoryNames = categories.map((c) => c.name);
  const supplierNames = suppliers.map((s) => s.name);

  return (
    <div className="space-y-6">
      {/* Page Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Medicine Inventory Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage pharmaceutical items, batch expiration timelines, unit prices, and stock locations
          </p>
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

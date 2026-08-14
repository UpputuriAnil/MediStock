import React from 'react';
import { Search, Filter, LayoutGrid, Table, Download, FileText, Trash2, Plus, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { exportToCSV, exportMedicinesToPDF } from '../../utils/exportUtils';
import { Medicine } from '../../types/inventory';
import { useAuth } from '../../context/AuthContext';

interface MedicineFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedSupplier: string;
  setSelectedSupplier: (s: string) => void;
  selectedStatus: string;
  setSelectedStatus: (st: string) => void;
  selectedExpiryRange?: string;
  setSelectedExpiryRange?: (ex: string) => void;
  viewMode: 'table' | 'grid';
  setViewMode: (v: 'table' | 'grid') => void;
  categories: string[];
  suppliers: string[];
  medicines: Medicine[];
  selectedCount: number;
  onBulkDelete: () => void;
  onAddMedicine: () => void;
}

export const MedicineFilterBar: React.FC<MedicineFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSupplier,
  setSelectedSupplier,
  selectedStatus,
  setSelectedStatus,
  selectedExpiryRange = 'All',
  setSelectedExpiryRange,
  viewMode,
  setViewMode,
  categories,
  suppliers,
  medicines,
  selectedCount,
  onBulkDelete,
  onAddMedicine,
}) => {
  const { user } = useAuth();
  const userRoleStr = (user?.role || (user as any)?.roles?.[0] || 'Staff').toLowerCase();
  const isAdmin = userRoleStr.includes('admin');
  const isPharmacist = userRoleStr.includes('pharm');
  const canAdd = isAdmin || isPharmacist;
  const canBulkDelete = isAdmin;
  const canExport = isAdmin || isPharmacist;

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSupplier !== 'All' ||
    selectedStatus !== 'All' ||
    selectedExpiryRange !== 'All' ||
    searchQuery !== '';

  return (
    <div className="glass-card rounded-2xl p-4 mb-6 border border-slate-200/70 dark:border-slate-800 space-y-4 shadow-soft">
      {/* Top Search & Primary Action Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search input - Search by Name, Category, Supplier, Batch #, Expiry Date, Status */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, category, supplier, batch #, expiry date, status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
          {canBulkDelete && selectedCount > 0 && (
            <Button
              onClick={onBulkDelete}
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete ({selectedCount})
            </Button>
          )}

          {/* Export buttons */}
          {canExport && (
            <>
              <Button
                onClick={() => exportToCSV('Medicine_Inventory', medicines)}
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export CSV
              </Button>

              <Button
                onClick={() => exportMedicinesToPDF('Medicine Inventory Report', medicines)}
                variant="outline"
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5 text-danger-500" />}
              >
                Export PDF
              </Button>
            </>
          )}

          {/* Grid / Table View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs' : ''
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs' : ''
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {canAdd && (
            <Button
              onClick={onAddMedicine}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Medicine
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Multi-Attribute Filters Row */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
        <span className="flex items-center gap-1 text-slate-400">
          <Filter className="w-3.5 h-3.5 text-primary-500" /> Multi-Attribute Filters:
        </span>

        {/* 1. Category select */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 font-semibold cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* 2. Supplier select */}
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 font-semibold cursor-pointer"
        >
          <option value="All">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* 3. Stock Status select */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 font-semibold cursor-pointer"
        >
          <option value="All">All Stock Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Near Expiry">Near Expiry</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Expired">Expired</option>
        </select>

        {/* 4. Expiry Date Range select */}
        {setSelectedExpiryRange && (
          <select
            value={selectedExpiryRange}
            onChange={(e) => setSelectedExpiryRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 font-semibold cursor-pointer"
          >
            <option value="All">All Expiry Dates</option>
            <option value="30 Days">Expiring in 30 Days</option>
            <option value="60 Days">Expiring in 60 Days</option>
            <option value="90 Days">Expiring in 90 Days</option>
            <option value="Expired">Already Expired</option>
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedSupplier('All');
              setSelectedStatus('All');
              if (setSelectedExpiryRange) setSelectedExpiryRange('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-danger-500 hover:underline ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

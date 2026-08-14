import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  Search,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { DashboardNotificationWidget } from '../components/dashboard/DashboardNotificationWidget';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { medicines, stockLogs, adjustStock, suppliers } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low Stock' | 'In Stock' | 'Out of Stock'>('All');
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [actionMode, setActionMode] = useState<'RESTOCK' | 'ISSUE'>('RESTOCK');
  const [adjustAmount, setAdjustAmount] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Restocking operational count');

  // Milestone 2 Staff Dashboard KPI Summaries
  const totalMedicines = medicines.length;
  const totalAvailableStock = medicines.reduce((acc, m) => acc + (m.stock || 0), 0);
  const lowStockCount = medicines.filter((m) => (m.stock || 0) <= (m.minStockThreshold || 0)).length;

  // Filtered medicine list for staff search & filter
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const nameMatch = (med.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const genericMatch = (med.genericName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const supplierMatch = (med.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
      const batchMatch = (med.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSearch = nameMatch || genericMatch || supplierMatch || batchMatch;
      const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
      const matchesSupplier = selectedSupplier === 'All' || (med.supplier || '').toLowerCase().includes(selectedSupplier.toLowerCase().split(' ')[0]);
      const matchesStock =
        stockFilter === 'All' ||
        (stockFilter === 'Low Stock' && med.stock <= med.minStockThreshold && med.stock > 0) ||
        (stockFilter === 'In Stock' && med.stock > med.minStockThreshold) ||
        (stockFilter === 'Out of Stock' && med.stock === 0);

      return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
    });
  }, [medicines, searchTerm, selectedCategory, selectedSupplier, stockFilter]);

  // Categories list
  const categoriesList = useMemo(() => {
    const cats = Array.from(new Set(medicines.map((m) => m.category).filter(Boolean)));
    return ['All', ...cats];
  }, [medicines]);

  // Suppliers list
  const suppliersList = useMemo(() => {
    const sups = Array.from(new Set(suppliers.map((s) => s.name).filter(Boolean)));
    return ['All', ...sups];
  }, [suppliers]);

  // Recent permitted inventory logs for Staff
  const recentLogs = useMemo(() => {
    return stockLogs.slice(0, 8);
  }, [stockLogs]);

  const handleStockAdjustment = (medicineId: string, mode: 'RESTOCK' | 'ISSUE') => {
    const qty = Math.abs(adjustAmount);
    if (!qty || qty <= 0) return;
    const delta = mode === 'RESTOCK' ? qty : -qty;
    adjustStock(medicineId, delta, adjustReason);
    setSelectedMedicine(null);
  };

  const openActionModal = (med: any, mode: 'RESTOCK' | 'ISSUE') => {
    setSelectedMedicine(med);
    setActionMode(mode);
    setAdjustAmount(mode === 'RESTOCK' ? 10 : 5);
    setAdjustReason(mode === 'RESTOCK' ? 'Operational restock entry' : 'Dispensed to clinical department');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-500/10 border border-secondary-500/30 text-secondary-400 text-xs font-bold uppercase tracking-wider">
              Limited Operational Access
            </span>
            <span className="text-xs text-slate-400">Milestone 2 Staff Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Staff Inventory Dashboard</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Welcome back, <strong className="text-white font-extrabold">{user?.name || 'Staff Member'}</strong>. Search medicine items, verify current stock quantities, and record permitted inventory updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
            <Clock className="w-4 h-4 text-primary-400" />
            <span>Shift Status: Active Duty</span>
          </div>
        </div>
      </div>

      {/* Recommended Milestone 2 Staff Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Medicines Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Medicines</span>
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{totalMedicines}</span>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-success-400" /> Catalog items indexed
            </p>
          </div>
        </motion.div>

        {/* Available Stock Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Stock</span>
            <div className="p-2.5 rounded-xl bg-success-500/10 text-success-400 border border-success-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{totalAvailableStock.toLocaleString()}</span>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-success-400" /> Units across all categories
            </p>
          </div>
        </motion.div>

        {/* Low Stock Warning Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alert</span>
            <div className="p-2.5 rounded-xl bg-warning-500/10 text-warning-400 border border-warning-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{lowStockCount}</span>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {lowStockCount > 0 ? (
                <span className="text-warning-400 font-semibold">Items below minimum threshold</span>
              ) : (
                <span className="text-success-400 font-semibold">All items well stocked</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* LIVE NOTIFICATIONS & SYSTEM ALERTS SECTION */}
      <DashboardNotificationWidget />

      {/* Main Section: Medicine Search/List & Recent Permitted Inventory Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search & Permitted List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary-400" /> Medicine Search & Inventory View
                </h2>
                <p className="text-xs text-slate-400">Filter permitted inventory items and check real-time stock levels.</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                Showing {filteredMedicines.length} of {medicines.length}
              </span>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Search by name, generic, batch, supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-primary-500"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      Category: {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier Dropdown */}
              <div>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-primary-500"
                >
                  {suppliersList.map((sup) => (
                    <option key={sup} value={sup}>
                      Supplier: {sup}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock Status Bar */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stock Status:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStockFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      stockFilter === st
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicines List Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Medicine</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Stock Level</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No medicine items found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMedicines.map((med) => {
                      const isLow = med.stock <= med.minStockThreshold;
                      const isOut = med.stock === 0;
                      const medPrice = typeof med.price === 'number' ? med.price : 0;

                      return (
                        <tr key={med.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150'}
                                alt={med.name}
                                className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                              />
                              <div>
                                <p className="font-bold text-white text-xs">{med.name}</p>
                                <p className="text-[10px] text-slate-400">{med.genericName || 'Rx Medicine'} • Batch: {med.batchNumber || 'B-100'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                              {med.category}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-white">
                            {med.stock} <span className="text-[10px] font-normal text-slate-400">{med.unit || 'units'}</span>
                          </td>
                          <td className="p-3 text-center">
                            {isOut ? (
                              <Badge variant="danger">Out of Stock</Badge>
                            ) : isLow ? (
                              <Badge variant="warning">Low Stock</Badge>
                            ) : (
                              <Badge variant="success">In Stock</Badge>
                            )}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-200">
                            ${medPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openActionModal(med, 'RESTOCK')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors text-[11px] font-bold"
                              >
                                Restock
                              </button>
                              <button
                                onClick={() => openActionModal(med, 'ISSUE')}
                                className="px-2.5 py-1 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors text-[11px] font-bold"
                              >
                                Issue
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Permitted Inventory Activity Feed (1 Col) */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-secondary-400" /> Recent Permitted Activity
              </h2>
              <p className="text-xs text-slate-400">Log of recent stock adjustments and operations.</p>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => {
                const isStockIn = log.type === 'Stock In';
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg mt-0.5 ${
                          isStockIn
                            ? 'bg-success-500/10 text-success-400 border border-success-500/20'
                            : 'bg-warning-500/10 text-warning-400 border border-warning-500/20'
                        }`}
                      >
                        {isStockIn ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{log.medicineName}</p>
                        <p className="text-[10px] text-slate-400">{log.reason || 'Inventory action recorded'}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {log.timestamp.split('T')[0] || log.timestamp} • {log.performedBy}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                        isStockIn ? 'bg-success-950 text-success-400' : 'bg-warning-950 text-warning-400'
                      }`}
                    >
                      {isStockIn ? '+' : '-'}{log.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Restock / Issue Action Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {actionMode === 'RESTOCK' ? 'Record Permitted Stock Restock' : 'Issue Medicine (Stock Out)'}
              </h3>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <img
                  src={selectedMedicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150'}
                  alt={selectedMedicine.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-white">{selectedMedicine.name}</p>
                  <p className="text-xs text-slate-400">Current Stock: <span className="text-white font-bold">{selectedMedicine.stock}</span> units</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActionMode('RESTOCK')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    actionMode === 'RESTOCK'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  + Restock (Add Stock)
                </button>
                <button
                  type="button"
                  onClick={() => setActionMode('ISSUE')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    actionMode === 'ISSUE'
                      ? 'bg-amber-950 border-amber-500 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  - Issue (Subtract Stock)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Quantity ({actionMode === 'RESTOCK' ? 'to Add' : 'to Issue'})
                </label>
                <input
                  type="number"
                  min="1"
                  max={actionMode === 'ISSUE' ? selectedMedicine.stock : 99999}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-primary-500"
                />
                {actionMode === 'ISSUE' && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    Maximum issueable quantity: {selectedMedicine.stock} units
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={() => handleStockAdjustment(selectedMedicine.id, actionMode)}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all ${
                  actionMode === 'RESTOCK' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Confirm {actionMode === 'RESTOCK' ? 'Restock' : 'Issue'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;

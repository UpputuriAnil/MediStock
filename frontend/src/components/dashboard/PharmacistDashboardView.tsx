import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Boxes,
  AlertTriangle,
  Clock,
  ShoppingBag,
  Truck,
  Plus,
  ArrowRight,
  Search,
  Filter,
  Activity,
  DollarSign,
  TrendingUp,
  RefreshCw,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AddEditMedicineModal } from '../medicine/AddEditMedicineModal';
import { DashboardNotificationWidget } from './DashboardNotificationWidget';
import { formatCurrency, getDaysRemaining } from '../../utils/formatters';

export const PharmacistDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { medicines, suppliers, orders, stockLogs } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // ==========================================
  // MILESTONE 2: INVENTORY SUMMARY METRICS
  // ==========================================
  const totalMedicines = medicines.length;
  const currentStock = useMemo(() => medicines.reduce((sum, m) => sum + m.stock, 0), [medicines]);
  const lowStockItems = useMemo(() => medicines.filter((m) => m.stock <= m.minStockThreshold), [medicines]);
  const outOfStockMedicines = useMemo(() => medicines.filter((m) => m.stock === 0), [medicines]);

  // ==========================================
  // MILESTONE 2: PURCHASE SUMMARY METRICS
  // ==========================================
  const currentDate = new Date();
  const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const purchasesThisMonth = useMemo(() => {
    return orders.filter((o) => {
      if (!o.orderedDate) return false;
      return o.orderedDate.startsWith(currentMonthYear) || true; // Fallback to all mock orders if dates are varied
    });
  }, [orders, currentMonthYear]);

  const purchasesThisMonthCount = purchasesThisMonth.length;
  const spendThisMonth = useMemo(() => purchasesThisMonth.reduce((sum, o) => sum + o.totalAmount, 0), [purchasesThisMonth]);
  const pendingPurchasesCount = useMemo(() => orders.filter((o) => o.status === 'Pending' || o.status === 'Approved' || o.status === 'Shipped').length, [orders]);

  // ==========================================
  // MILESTONE 2: OPERATIONAL SECTIONS
  // ==========================================

  // 1. Medicine Search & Filtered List
  const categories = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category));
    return ['all', ...Array.from(set)];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || m.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [medicines, searchQuery, selectedCategory]);

  // 2. Recent Inventory Activity Audit Trail
  const recentActivities = useMemo(() => stockLogs.slice(0, 6), [stockLogs]);

  // 3. Expiring & Expired Medicines (Milestone 3 optional display)
  const nearExpiryMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const days = getDaysRemaining(m.expiryDate);
      return days >= 0 && days <= 90;
    });
  }, [medicines]);

  const expiredMedicines = useMemo(() => medicines.filter((m) => getDaysRemaining(m.expiryDate) < 0), [medicines]);

  // 4. Supplier Insights
  const recentSuppliers = useMemo(() => suppliers.slice(0, 5), [suppliers]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" className="font-extrabold uppercase tracking-wider">
              Pharmacist Role Workstation
            </Badge>
            <span className="text-xs text-slate-400 font-medium">• Enterprise Inventory Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Pharmacy & Dispensary Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Welcome back, <strong className="text-white font-extrabold">{user?.name || 'Dr. Sarah Jenkins'}</strong>. Monitor inventory summary metrics, purchase spend, track stock adjustments, search medicine items, and review supplier insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/purchase-orders')}
            className="flex items-center gap-2 text-xs"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            Purchases & Orders
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RECOMMENDED MILESTONE 2 PHARMACIST DASHBOARD SUMMARY CARDS */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          Milestone 2 Performance Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Inventory Summary: Total Medicines */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Medicines</span>
              <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
                <Pill className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{totalMedicines}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Active Catalog SKUs</span>
            </div>
          </div>

          {/* Inventory Summary: Current Stock */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Stock</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-500">{currentStock.toLocaleString()}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Total Units Available</span>
            </div>
          </div>

          {/* Inventory Summary: Low Stock Items */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Low Stock Items</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-amber-500">{lowStockItems.length}</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 block mt-0.5">At or Below Reorder Level</span>
            </div>
          </div>

          {/* Purchase Summary: Purchases This Month */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purchases This Month</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-blue-500">{purchasesThisMonthCount}</span>
              <span className="text-xs text-slate-500 block mt-0.5">{pendingPurchasesCount} Pending Deliveries</span>
            </div>
          </div>

          {/* Purchase Summary: Spend This Month */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spend This Month</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-purple-500">{formatCurrency(spendThisMonth)}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Procurement Expenditure</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* OPERATIONAL SECTION: MEDICINE SEARCH & PURCHASE INFO     */}
      {/* ========================================================= */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-primary-500" />
              Operational Section: Medicine Search & Inventory Lookup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filter by name, category, or manufacturer to quickly check quantities, suppliers, and reorder levels.
            </p>
          </div>

          <Badge variant="primary" size="sm">
            Showing {filteredMedicines.length} of {medicines.length} Medicines
          </Badge>
        </div>

        {/* Search & Filter Bar Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicine name, generic name, category, batch or manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Medicine Results Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-900/90 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Medicine Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Available Stock</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filteredMedicines.slice(0, 5).map((med) => (
                <tr key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{med.name}</div>
                    <div className="text-[11px] text-slate-400">{med.genericName} • Batch: {med.batchNumber}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" size="sm">{med.category}</Badge>
                  </td>
                  <td className="p-3 font-mono font-bold">
                    <span className={med.stock <= med.minStockThreshold ? 'text-amber-500' : 'text-slate-900 dark:text-white'}>
                      {med.stock} {med.unit}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(med.price || (med as any).unitPrice || 0)}
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{med.supplier}</td>
                  <td className="p-3">
                    <Badge
                      variant={med.stock === 0 ? 'danger' : med.stock <= med.minStockThreshold ? 'warning' : 'success'}
                      size="sm"
                    >
                      {med.stock === 0 ? 'Out of Stock' : med.stock <= med.minStockThreshold ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate('/medicines')}
                      className="text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/medicines')}
            className="text-xs font-extrabold text-primary-500 hover:underline flex items-center gap-1"
          >
            View Full Inventory Catalog ({medicines.length} items) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* OPERATIONAL SECTIONS GRID                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPERATIONAL SECTION: RECENT INVENTORY ACTIVITY LOG */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Recent Inventory Activity (Stock Changes)
            </h3>
            <button
              onClick={() => navigate('/stock-logs')}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              View Log →
            </button>
          </div>

          <div className="space-y-3">
            {recentActivities.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{log.medicineName}</p>
                    <Badge
                      variant={log.type === 'Stock In' ? 'success' : log.type === 'Stock Out' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {log.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {log.reason} • By <span className="font-semibold text-slate-300">{log.performedBy}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                    {log.type === 'Stock Out' ? '-' : '+'}{log.quantity} units
                  </span>
                  <span className="text-[10px] text-slate-500 block">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPERATIONAL SECTION: SUPPLY INSIGHT */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              Supply Insights & Active Vendors
            </h3>
            <Badge variant="success" size="sm">{suppliers.length} Registered Suppliers</Badge>
          </div>

          <div className="space-y-3">
            {recentSuppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{sup.name}</p>
                    <Badge variant={sup.status === 'Preferred' ? 'success' : 'primary'} size="sm">
                      {sup.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Contact: {sup.contactPerson} ({sup.email})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">Rating: {sup.rating} ★</span>
                  <span className="text-[10px] text-slate-500">{sup.activeOrders} Active POs</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/suppliers')}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Manage Suppliers Directory →
          </button>
        </div>

        {/* LIVE NOTIFICATIONS & SYSTEM ALERTS SECTION */}
        <DashboardNotificationWidget />

        {/* OPERATIONAL SECTION: LOW-STOCK REORDER ITEMS */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Replenishment Alerts
            </h3>
            <Badge variant="warning">{lowStockItems.length} Reorders Needed</Badge>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Stock: {item.stock} {item.unit} (Min Threshold: {item.minStockThreshold} {item.unit})
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/purchase-orders')}
                  className="text-[11px] py-1 px-3"
                >
                  Create PO
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* OPERATIONAL SECTION: EXPIRING MEDICINES (MILESTONE 3 FUNCTIONALITY) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Expiring & Expired Medicines (FEFO Audit)
            </h3>
            <Badge variant="danger">{expiredMedicines.length + nearExpiryMedicines.length} Alerts</Badge>
          </div>

          <div className="space-y-2.5">
            {[...expiredMedicines, ...nearExpiryMedicines].slice(0, 4).map((m) => {
              const days = getDaysRemaining(m.expiryDate);
              const isExpired = days < 0;
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</p>
                    <p className="text-[11px] text-slate-400">Batch: {m.batchNumber} • Expiry: {m.expiryDate}</p>
                  </div>
                  <Badge variant={isExpired ? 'danger' : 'warning'} size="sm">
                    {isExpired ? 'EXPIRED' : `${days} Days Left`}
                  </Badge>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/expiry-tracking')}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Full Expiry Audit List →
          </button>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        medicineToEdit={null}
      />
    </div>
  );
};

export default PharmacistDashboardView;

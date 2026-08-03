import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  AlertTriangle,
  Clock,
  Truck,
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Building2,
  Calendar,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from './StatCard';
import { InventoryChart } from './InventoryChart';
import { CategoryChart } from './CategoryChart';
import { AddEditMedicineModal } from '../medicine/AddEditMedicineModal';
import { useInventory } from '../../context/InventoryContext';
import { Badge } from '../common/Badge';

export const PharmacistDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { medicines, suppliers } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute Pharmacist metrics
  const totalMedicines = medicines.length;
  const lowStockItems = medicines.filter((m) => m.status === 'Low Stock' || m.status === 'Out of Stock');
  const expiringMedicines = medicines.filter((m) => m.status === 'Near Expiry' || m.status === 'Expired');
  const activeSuppliers = suppliers.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Pharmacist Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Chief Pharmacist Workstation
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Pharmacy & Stock Dispensary Overview
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed">
              Monitor batch expirations, track real-time stock deficits, review supplier delivery insights, and authorize stock replenishments.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              + Add New Medicine
            </button>
            <button
              onClick={() => navigate('/purchase-orders')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Requisition Order
            </button>
          </div>
        </div>
      </div>

      {/* 5 Pharmacist KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="1. Inventory Overview"
          value={totalMedicines}
          change="7 Categories"
          subtitle="Total Active SKUs"
          icon={Pill}
          iconBgColor="bg-teal-50 dark:bg-teal-950/60"
          iconTextColor="text-teal-600 dark:text-teal-400"
          onClick={() => navigate('/medicines')}
        />
        <StatCard
          title="2. Low-Stock Items"
          value={lowStockItems.length}
          change="Action Required"
          isPositive={false}
          subtitle="Below Reorder Level"
          icon={AlertTriangle}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconTextColor="text-amber-600 dark:text-amber-400"
          onClick={() => navigate('/medicines')}
        />
        <StatCard
          title="3. Expiring Medicines"
          value={expiringMedicines.length}
          change="30 Days Window"
          isPositive={false}
          subtitle="Batch FEFO Warnings"
          icon={Clock}
          iconBgColor="bg-red-50 dark:bg-red-950/60"
          iconTextColor="text-red-600 dark:text-red-400"
          onClick={() => navigate('/expiry-tracking')}
        />
        <StatCard
          title="4. Purchase Summary"
          value="12 Orders"
          change="$48.2k Total"
          subtitle="Active Procurement"
          icon={ShoppingBag}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
          iconTextColor="text-blue-600 dark:text-blue-400"
          onClick={() => navigate('/purchase-orders')}
        />
        <StatCard
          title="5. Supplier Insights"
          value={suppliers.length}
          change="98% On-time"
          subtitle="Verified Vendors"
          icon={Truck}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => navigate('/suppliers')}
        />
      </div>

      {/* Main Grid: Pharmacist Section 1 & Section 2 & Section 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Section 1 (Inventory Overview & Charts) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Section 1: Inventory Stock Overview
                </h3>
                <p className="text-xs text-slate-500">Monthly stock levels vs dispensing trends</p>
              </div>
              <button
                onClick={() => navigate('/medicines')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Full Inventory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <InventoryChart />
          </div>

          {/* Section 2: Low-Stock Items Table */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Section 2: Low-Stock Critical Items
                </h3>
                <p className="text-xs text-slate-500">Medications reaching minimum threshold</p>
              </div>
              <Badge variant="warning">{lowStockItems.length} SKUs Alert</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current Qty</th>
                    <th className="p-3">Reorder Level</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                  {lowStockItems.slice(0, 4).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="p-3 text-slate-500">{m.category}</td>
                      <td className="p-3 font-bold text-amber-500">{m.stock} {m.unit}</td>
                      <td className="p-3 text-slate-400">{m.reorderLevel} {m.unit}</td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate('/purchase-orders')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                        >
                          Reorder Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Section 3 (Expiring Medicines) & Section 4 & Section 5 */}
        <div className="space-y-6">
          {/* Section 3: Expiring Medicines */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                Section 3: Expiring Medicines
              </h3>
              <button
                onClick={() => navigate('/expiry-tracking')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View FEFO List
              </button>
            </div>

            <div className="space-y-3">
              {expiringMedicines.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-red-200/50 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                    <span>{m.name}</span>
                    <Badge variant="danger" size="sm">Expires: {m.expiryDate}</Badge>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Batch #{m.batchNumber} • Location: Main Shelf {m.location || 'A1'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Purchase Summary */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                Section 4: Purchase Summary
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-semibold">
                <span className="text-slate-500">Pending Orders</span>
                <span className="font-bold text-blue-500">4 Orders ($18,400)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-semibold">
                <span className="text-slate-500">Delivered This Week</span>
                <span className="font-bold text-emerald-500">8 Orders ($29,800)</span>
              </div>
            </div>
          </div>

          {/* Section 5: Supplier Insights */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-500" />
                Section 5: Supplier Insights
              </h3>
            </div>
            <div className="space-y-3">
              {activeSuppliers.map((sup) => (
                <div key={sup.id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{sup.name}</p>
                    <p className="text-[10px] text-slate-400">{sup.contactPerson} • {sup.city}</p>
                  </div>
                  <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                    ⭐ {sup.rating || '4.8'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

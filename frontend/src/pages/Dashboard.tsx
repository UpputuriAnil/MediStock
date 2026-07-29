import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, AlertTriangle, Clock, Truck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/dashboard/HeroSection';
import { StatCard } from '../components/dashboard/StatCard';
import { InventoryChart } from '../components/dashboard/InventoryChart';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { QuickActions } from '../components/dashboard/QuickActions';
import { AddEditMedicineModal } from '../components/medicine/AddEditMedicineModal';
import { useInventory } from '../context/InventoryContext';
import { useNotifications } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { medicines, suppliers } = useInventory();
  const { notifications } = useNotifications();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute stat card metrics
  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter((m) => m.status === 'Low Stock' || m.status === 'Out of Stock').length;
  const nearExpiryCount = medicines.filter((m) => m.status === 'Near Expiry' || m.status === 'Expired').length;
  const activeSuppliersCount = suppliers.length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection
        onAddMedicine={() => setIsAddModalOpen(true)}
        onNewOrder={() => navigate('/purchase-orders')}
      />

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Medicines"
          value={totalMedicines}
          change="+12.4%"
          subtitle="Across 7 Categories"
          icon={Pill}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
          iconTextColor="text-blue-600 dark:text-blue-400"
          onClick={() => navigate('/medicines')}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          change="+2 items"
          isPositive={false}
          subtitle="Requires Reorder"
          icon={AlertTriangle}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconTextColor="text-amber-600 dark:text-amber-400"
          onClick={() => navigate('/medicines')}
        />
        <StatCard
          title="Near Expiry Warnings"
          value={nearExpiryCount}
          change="30 Days Threshold"
          isPositive={false}
          subtitle="Critical Attention"
          icon={Clock}
          iconBgColor="bg-red-50 dark:bg-red-950/60"
          iconTextColor="text-red-600 dark:text-red-400"
          onClick={() => navigate('/expiry-tracking')}
        />
        <StatCard
          title="Active Suppliers"
          value={activeSuppliersCount}
          change="98.4% Score"
          subtitle="Preferred Vendors"
          icon={Truck}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => navigate('/suppliers')}
        />
      </div>

      {/* Charts Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryChart />
        </div>
        <div>
          <CategoryChart />
        </div>
      </div>

      {/* Activities Timeline, Quick Actions, and Latest Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActivityTimeline />
        </div>
        <div className="space-y-6">
          <QuickActions
            onAddMedicine={() => setIsAddModalOpen(true)}
            onAddSupplier={() => navigate('/suppliers')}
          />

          {/* Latest Notifications Widget */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Latest Notifications
              </h3>
              <button
                onClick={() => navigate('/notifications')}
                className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>{n.title}</span>
                    <Badge variant={n.type === 'alert' ? 'danger' : 'warning'} size="sm">
                      {n.category}
                    </Badge>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

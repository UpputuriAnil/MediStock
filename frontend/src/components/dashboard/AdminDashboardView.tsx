import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Pill,
  Tags,
  Truck,
  ShoppingBag,
  Boxes,
  AlertTriangle,
  Clock,
  ShieldAlert,
  BarChart3,
  Activity,
  PieChart,
  TrendingUp,
  Server,
  Bell,
  CheckCircle2,
  UserCheck,
  Plus,
  FileText,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { useNotifications } from '../../context/NotificationContext';
import { InventoryChart } from './InventoryChart';
import { CategoryChart } from './CategoryChart';
import { DashboardNotificationWidget } from './DashboardNotificationWidget';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, getDaysRemaining } from '../../utils/formatters';

import { useAuth } from '../../context/AuthContext';

export const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { medicines, categories, suppliers, orders, stockLogs } = useInventory();
  const { notifications } = useNotifications();

  // Metrics calculation
  const totalMedicines = medicines.length;
  const totalStock = medicines.reduce((sum, m) => sum + m.stock, 0);
  const lowStockCount = medicines.filter((m) => m.stock > 0 && m.stock <= m.minStockThreshold).length;
  const outOfStockCount = medicines.filter((m) => m.stock === 0).length;
  const nearExpiryCount = medicines.filter((m) => {
    const days = getDaysRemaining(m.expiryDate);
    return days >= 0 && days <= 90;
  }).length;
  const expiredCount = medicines.filter((m) => getDaysRemaining(m.expiryDate) < 0).length;

  const totalUsers = 48;
  const activeUsers = 42;

  const recentUserActivities = [
    { id: 1, user: 'John Doe (Pharmacist)', action: 'Dispensary Stock-out of 500mg Amoxicillin', timestamp: '2 mins ago' },
    { id: 2, user: `${user?.name || 'Admin'} (Admin)`, action: 'Updated System Role Permissions', timestamp: '15 mins ago' },
    { id: 3, user: 'Dr. Sarah Jenkins (Pharmacist)', action: 'Created Purchase Order PO-8803', timestamp: '1 hour ago' },
    { id: 4, user: 'Marcus Vance (Admin)', action: 'Added Supplier BioPharma Global Inc.', timestamp: '3 hours ago' },
  ];

  const recentSystemActivities = [
    { id: 1, title: 'Database Backup Completed', message: 'Automated nightly MySQL snapshot verified.', time: '10 mins ago', type: 'info' },
    { id: 2, title: 'JWT Token Secret Rotation', message: 'Security keys refreshed successfully.', time: '1 hour ago', type: 'success' },
    { id: 3, title: 'API Gate Performance', message: 'Sub-10ms latency maintained over 100k requests.', time: '2 hours ago', type: 'info' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Title & Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Admin Governance & Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <strong className="text-primary-600 dark:text-primary-400 font-extrabold">{user?.name || 'System Admin'}</strong>. Full operational governance, real-time KPI metrics, audit logs, and user access controls.
          </p>
        </div>
      </div>



      {/* SECTION 1: Inventory Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Boxes className="w-4 h-4 text-primary-500" />
          1. Inventory Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Medicines</span>
            <span className="text-2xl font-black text-primary-600 dark:text-primary-400 block mt-1">{totalMedicines}</span>
            <span className="text-[10px] font-semibold text-slate-500">Active SKUs</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Stock</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{totalStock.toLocaleString()}</span>
            <span className="text-[10px] font-semibold text-slate-500">Physical Units</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low-Stock</span>
            <span className="text-2xl font-black text-amber-500 block mt-1">{lowStockCount}</span>
            <span className="text-[10px] font-semibold text-amber-500">Below Minimum</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Out-of-Stock</span>
            <span className="text-2xl font-black text-danger-500 block mt-1">{outOfStockCount}</span>
            <span className="text-[10px] font-semibold text-danger-500">Immediate Reorder</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Near-Expiry</span>
            <span className="text-2xl font-black text-orange-500 block mt-1">{nearExpiryCount}</span>
            <span className="text-[10px] font-semibold text-orange-500">&lt;90 Days</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expired</span>
            <span className="text-2xl font-black text-red-600 block mt-1">{expiredCount}</span>
            <span className="text-[10px] font-semibold text-red-600">Quarantined</span>
          </div>
        </div>
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 2: Inventory Analytics */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-secondary-500" />
              2. Inventory Analytics
            </h3>
            <Badge variant="secondary">Trends & Category Distribution</Badge>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2">Stock Trends & Inventory Movement Flow</p>
              <InventoryChart />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 mb-2">Medicine Category Distribution</p>
              <CategoryChart />
            </div>
          </div>
        </div>

        {/* SECTION 3: User Activity */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-500" />
              3. User Activity
            </h3>
            <Badge variant="primary">Governance Audit</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total System Users</span>
              <span className="text-2xl font-black text-purple-400 block mt-1">{totalUsers}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Users</span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">{activeUsers}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-400">Recent User Operations Activity</p>
            <div className="space-y-2">
              {recentUserActivities.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{act.user}</p>
                    <p className="text-[11px] text-slate-400">{act.action}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Supplier Analytics */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              4. Supplier Analytics
            </h3>
            <Badge variant="success">Total: {suppliers.length}</Badge>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400">Supplier Performance Leaderboard & Recent Activity</p>
            <div className="space-y-2">
              {suppliers.slice(0, 4).map((sup) => (
                <div key={sup.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{sup.name}</p>
                    <p className="text-[11px] text-slate-400">{sup.category} • {sup.activeOrders} Active POs</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-500 block">{sup.performanceScore}% Score</span>
                    <Badge variant={sup.status === 'Preferred' ? 'success' : 'primary'} size="sm">
                      {sup.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5: Purchase Analytics */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              5. Purchase Analytics
            </h3>
            <Badge variant="primary">Total POs: {orders.length}</Badge>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400">Recent Purchases & Procurement Trends</p>
            <div className="space-y-2">
              {orders.slice(0, 4).map((ord) => (
                <div key={ord.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{ord.orderNumber} ({ord.supplierName})</p>
                    <p className="text-[11px] text-slate-400">Ordered: {ord.orderedDate} by {ord.createdByName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">{formatCurrency(ord.totalAmount)}</span>
                    <Badge variant={ord.status === 'Delivered' ? 'success' : ord.status === 'Shipped' ? 'secondary' : 'warning'} size="sm">
                      {ord.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Stock Movement Reports & SECTION 7: System Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 6: Stock Movement Reports */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            6. Stock Movement Reports (In, Out & Adjustments)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Medicine</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {(stockLogs || []).slice(0, 5).map((log) => {
                  const logTypeStr = String(log?.type || '');
                  return (
                    <tr key={log.id}>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">{log.medicineName}</td>
                      <td className="p-2.5">
                        <Badge variant={logTypeStr.includes('In') || logTypeStr.includes('Received') ? 'success' : 'warning'} size="sm">
                          {logTypeStr}
                        </Badge>
                      </td>
                      <td className="p-2.5 font-mono font-bold">{log.quantity}</td>
                      <td className="p-2.5 text-slate-400">{log.performedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* LIVE NOTIFICATIONS & SYSTEM ALERTS SECTION */}
        <DashboardNotificationWidget />

        {/* SECTION 7: System Monitoring */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-danger-500" />
              7. System Monitoring & Important Alerts
            </h3>
            <Badge variant="success" dot>System Healthy</Badge>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400">Recent System Activity & Notifications</p>
            <div className="space-y-2">
              {recentSystemActivities.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</p>
                    <p className="text-[11px] text-slate-400">{act.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{act.time}</span>
                </div>
              ))}
              {notifications.slice(0, 2).map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-danger-950/20 border border-danger-900/40 text-danger-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">{n.title}</p>
                    <p className="text-[11px] text-danger-300">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-danger-400 shrink-0">{n.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;

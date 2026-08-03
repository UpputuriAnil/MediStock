import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  PieChart,
  Activity,
  Server,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Database,
  Cpu,
  Lock,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from './StatCard';
import { InventoryChart } from './InventoryChart';
import { CategoryChart } from './CategoryChart';
import { ActivityTimeline } from './ActivityTimeline';
import { Badge } from '../common/Badge';

export const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();

  const userActivityLogs = [
    { id: 1, user: 'John Doe (Pharmacist)', action: 'Dispensary Stock-out of 500mg Amoxicillin', timestamp: '2 mins ago', status: 'Approved' },
    { id: 2, user: 'Jane Smith (Staff)', action: 'Catalog Lookup for Paracetamol', timestamp: '14 mins ago', status: 'Logged' },
    { id: 3, user: 'System Admin', action: 'Assigned ROLE_PHARMACIST to user #402', timestamp: '1 hour ago', status: 'Completed' },
    { id: 4, user: 'PharmaCorp API', action: 'Automated PO Status Sync (PO-902)', timestamp: '3 hours ago', status: 'Synced' },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-secondary-950 p-6 md:p-8 text-white shadow-2xl border border-primary-800/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> System Administrator Control Hub
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Enterprise Governance & Security Analytics
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Full system oversight, RBAC role management, audit trail inspection, supplier performance analytics, and infrastructure health monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/users')}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Manage System Users
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
            >
              <Server className="w-4 h-4" /> System Settings
            </button>
          </div>
        </div>
      </div>

      {/* 5 Admin KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="1. Inventory Analytics"
          value="$248,500"
          change="+14.2%"
          subtitle="Asset Valuation"
          icon={BarChart3}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
          iconTextColor="text-blue-600 dark:text-blue-400"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="2. User Activity"
          value="48 Active"
          change="3 Roles"
          subtitle="System Sessions"
          icon={Users}
          iconBgColor="bg-purple-50 dark:bg-purple-950/60"
          iconTextColor="text-purple-600 dark:text-purple-400"
          onClick={() => navigate('/users')}
        />
        <StatCard
          title="3. Supplier Analytics"
          value="18 Vendors"
          change="99.4% Rating"
          subtitle="Supply Chain Health"
          icon={PieChart}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => navigate('/suppliers')}
        />
        <StatCard
          title="4. Stock Movement"
          value="1,420 Txns"
          change="Audit Logged"
          subtitle="Monthly Velocity"
          icon={Activity}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconTextColor="text-amber-600 dark:text-amber-400"
          onClick={() => navigate('/stock-logs')}
        />
        <StatCard
          title="5. System Monitoring"
          value="99.99%"
          change="0 Latency"
          subtitle="Database & API Status"
          icon={Server}
          iconBgColor="bg-teal-50 dark:bg-teal-950/60"
          iconTextColor="text-teal-600 dark:text-teal-400"
          onClick={() => navigate('/settings')}
        />
      </div>

      {/* Main Grid: Admin Section 1 & Section 2 & Section 3 & Section 4 & Section 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Section 1 (Inventory Analytics) & Section 4 (Stock Movement Reports) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Inventory Analytics */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Section 1: Inventory Valuation & Demand Analytics
                </h3>
                <p className="text-xs text-slate-500">Comprehensive SKU distribution and financial asset valuation</p>
              </div>
              <button
                onClick={() => navigate('/reports')}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <InventoryChart />
          </div>

          {/* Section 4: Stock Movement Reports */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Section 4: Stock Movement & Audit Reports
                </h3>
                <p className="text-xs text-slate-500">Real-time non-repudiable transaction log feed</p>
              </div>
              <button
                onClick={() => navigate('/stock-logs')}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View All Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Audit Action</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                  {userActivityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{log.user}</td>
                      <td className="p-3 text-slate-500">{log.action}</td>
                      <td className="p-3 text-slate-400">{log.timestamp}</td>
                      <td className="p-3">
                        <Badge variant="success" size="sm">{log.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Section 2 (User Activity), Section 3 (Supplier Analytics), Section 5 (System Monitoring) */}
        <div className="space-y-6">
          {/* Section 2: User Activity */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Section 2: User Activity & RBAC
              </h3>
              <button
                onClick={() => navigate('/users')}
                className="text-xs font-bold text-primary-600 hover:underline"
              >
                Manage Users
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-semibold">
                <span className="text-slate-500">System Administrators</span>
                <span className="font-bold text-purple-500">3 Users (Full Control)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-semibold">
                <span className="text-slate-500">Chief Pharmacists</span>
                <span className="font-bold text-emerald-500">12 Users (Dispensary)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-semibold">
                <span className="text-slate-500">Clinical Staff</span>
                <span className="font-bold text-blue-500">33 Users (Read-only)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Supplier Analytics */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                Section 3: Supplier Analytics
              </h3>
            </div>
            <CategoryChart />
          </div>

          {/* Section 5: System Monitoring */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-500" />
                Section 5: System Infrastructure Monitoring
              </h3>
              <Badge variant="success" dot>Healthy</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Database className="w-4 h-4 text-primary-500" /> MySQL Database
                </span>
                <span className="font-bold text-emerald-500">Connected (3306)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Cpu className="w-4 h-4 text-secondary-500" /> Spring Boot API
                </span>
                <span className="font-bold text-emerald-500">Online (Port 8080)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-purple-500" /> Spring Security JWT
                </span>
                <span className="font-bold text-emerald-500">RS256 / HS256 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

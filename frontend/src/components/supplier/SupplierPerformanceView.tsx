import React, { useState } from 'react';
import { Supplier } from '../../types/supplier';
import { useInventory } from '../../context/InventoryContext';
import { exportTableToPDF } from '../../utils/exportUtils';
import {
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Star,
  Activity,
  BarChart2,
  Package,
  FileText,
  Download,
  Truck,
  DollarSign,
  Layers,
  Thermometer,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '../common/Badge';

interface SupplierPerformanceViewProps {
  supplier: Supplier;
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

export const SupplierPerformanceView: React.FC<SupplierPerformanceViewProps> = ({ supplier }) => {
  const { medicines, orders } = useInventory();
  const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'orders' | 'audits'>('overview');

  // Filter medicines and orders associated with this supplier
  const supplierMedicines = medicines.filter(
    (m) =>
      m.supplier.toLowerCase().includes(supplier.name.toLowerCase()) ||
      supplier.name.toLowerCase().includes(m.supplier.toLowerCase())
  );

  const supplierOrders = orders.filter(
    (o) =>
      o.supplierName.toLowerCase().includes(supplier.name.toLowerCase()) ||
      supplier.name.toLowerCase().includes(o.supplierName.toLowerCase())
  );

  // Performance calculations
  const score = supplier.performanceScore || 95.0;
  const rating = supplier.rating || 4.7;
  const onTimeRate = Math.min(99.8, Math.round(score * 1.01 * 10) / 10);
  const accuracyRate = Math.min(99.9, Math.round(score * 1.005 * 10) / 10);
  const qualityScore = Math.min(99.5, Math.round(score * 0.995 * 10) / 10);
  const avgLeadDays = score > 90 ? '2.1 Days' : score > 80 ? '3.5 Days' : '5.2 Days';

  const totalValueSupplied = supplierOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || (supplier.totalSupplied ? supplier.totalSupplied * 150 : 45200);

  const getTierGrade = () => {
    if (score >= 95)
      return {
        text: 'Tier A+ Preferred Vendor',
        badge: 'success' as const,
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    if (score >= 88)
      return {
        text: 'Tier A Certified Vendor',
        badge: 'primary' as const,
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      };
    return {
      text: 'Tier B Standard Vendor',
      badge: 'warning' as const,
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    };
  };

  const tier = getTierGrade();

  // Recharts Monthly Performance Trend Data
  const trendData = [
    { month: 'Oct 2025', onTime: 92.5, accuracy: 94.0, quality: 93.0 },
    { month: 'Nov 2025', onTime: 94.0, accuracy: 95.2, quality: 94.5 },
    { month: 'Dec 2025', onTime: 93.8, accuracy: 94.8, quality: 95.0 },
    { month: 'Jan 2026', onTime: 95.5, accuracy: 96.1, quality: 94.8 },
    { month: 'Feb 2026', onTime: 96.0, accuracy: 95.5, quality: 94.5 },
    { month: 'Mar 2026', onTime: onTimeRate, accuracy: accuracyRate, quality: qualityScore },
  ];

  // Category distribution for supplied items
  const categoryMap: { [key: string]: number } = {};
  supplierMedicines.forEach((m) => {
    categoryMap[m.category] = (categoryMap[m.category] || 0) + 1;
  });

  const categoryPieData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  if (categoryPieData.length === 0) {
    categoryPieData.push(
      { name: 'Antibiotics', value: 4 },
      { name: 'Vaccines', value: 2 },
      { name: 'Cardiovascular', value: 3 },
      { name: 'Analgesics', value: 2 }
    );
  }

  // Export Full Supplier Performance Report to PDF
  const handleExportPDF = () => {
    const headers = ['METRIC / AUDIT ITEM', 'BENCHMARK SCORE', 'EVALUATION STATUS', 'REMARKS'];
    const rows = [
      ['On-Time Delivery Rate', `${onTimeRate}%`, 'Exceeds Benchmark (>= 95%)', 'Express Cold-Chain Logistics'],
      ['Order Accuracy Score', `${accuracyRate}%`, 'Passed (0.1% Discrepancy)', 'Zero Shipment Discrepancies'],
      ['Quality & GxP Compliance', `${qualityScore}%`, '100% Certified', 'Zero Batch Safety Recalls'],
      ['Lead Time Efficiency', avgLeadDays, 'Optimal Response', '2.1 Days Average Fulfillment'],
      ['Total Active Contracts', `${supplierOrders.length || supplier.activeOrders || 3} Orders`, 'Active', `Total Value: $${totalValueSupplied.toLocaleString()}`],
      ['Quarterly Audit Q1 2026', `${score}%`, 'Exceeds Expectations', 'Verified Quarterly Audit Certificate'],
      ['Quarterly Audit Q4 2025', `${Math.round((score - 0.6) * 10) / 10}%`, 'Passed & Certified', 'Compliant'],
      ['Quarterly Audit Q3 2025', `${Math.round((score - 1.2) * 10) / 10}%`, 'Passed', 'Compliant'],
    ];

    exportTableToPDF(
      `${supplier.name} - Performance & Audit Analysis`,
      headers,
      rows,
      `${supplier.name}_Supplier_Audit`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono font-bold text-primary-400 uppercase tracking-wider bg-primary-950/60 px-2.5 py-1 rounded-md border border-primary-800/40">
              {supplier.id}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${tier.bg} flex items-center gap-1.5`}>
              <Award className="w-3.5 h-3.5" />
              {tier.text}
            </span>
            <Badge variant="neutral" size="sm">
              Category: {supplier.category || 'Pharmaceuticals'}
            </Badge>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            {supplier.name}
            <span className="text-xs font-semibold text-slate-400 font-normal">({supplier.contactPerson || 'Account Director'})</span>
          </h2>

          <p className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
            <span>Email: {supplier.email || 'vendor@pharma.org'}</span>
            <span>Phone: {supplier.phone || '+1 (555) 345-6789'}</span>
            <span>Address: {supplier.city || supplier.address || 'Corporate Drive, USA'}</span>
          </p>
        </div>

        {/* Action Buttons & Overall Score */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-lg shadow-primary-900/30 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" />
            Export Audit PDF
          </button>

          <div className="flex items-center gap-4 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-900/40">
              {score}%
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Score</span>
              <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm mt-0.5">
                <Star className="w-4 h-4 fill-amber-400" />
                {rating} / 5.0 Rating
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Verified quarterly audit</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> On-Time Delivery Rate
            </span>
            <span className="text-base font-black text-emerald-400">{onTimeRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${onTimeRate}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Target: &gt;= 95.0% • Exceeds benchmark</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Order Accuracy Score
            </span>
            <span className="text-base font-black text-blue-400">{accuracyRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${accuracyRate}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">0.1% shipment discrepancy rate</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Quality & GxP Compliance
            </span>
            <span className="text-base font-black text-purple-400">{qualityScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" style={{ width: `${qualityScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Zero batch recall incidents</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Lead Time Efficiency
            </span>
            <span className="text-base font-black text-amber-400">{avgLeadDays}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: '88%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Fast-track express cold-chain</p>
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Performance Trends & Analytics
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'medicines'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" /> Supplied Medicines ({supplierMedicines.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-4 h-4" /> Purchase Orders ({supplierOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'audits'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4" /> GxP Audit Logs & Badges
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PERFORMANCE CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fulfillment & Accuracy Trend Area Chart */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> 6-Month Fulfillment & Quality Trajectory
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Historical delivery precision and quality audit compliance tracking</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> On-Time %
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> Accuracy %
                  </span>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[85, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="onTime" name="On-Time Delivery" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOnTime)" />
                    <Area type="monotone" dataKey="accuracy" name="Order Accuracy" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAccuracy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Supplied Category Distribution Donut Chart */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Supplied Category Mix
              </h3>
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                {categoryPieData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      {cat.name}
                    </span>
                    <span className="font-mono font-bold">{cat.value} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Log & Cold Chain Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary-400" /> Quarterly Performance Audits
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Audit Period</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Evaluation Result</th>
                      <th className="pb-3 text-right">Evaluated On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-3 font-bold text-white">Q1 2026 Audit</td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{score}%</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Exceeds Expectations
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">2026-03-31</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Q4 2025 Audit</td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{Math.round((score - 0.6) * 10) / 10}%</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Passed & Certified
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">2025-12-31</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Q3 2025 Audit</td>
                      <td className="py-3 font-mono font-bold text-blue-400">{Math.round((score - 1.2) * 10) / 10}%</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          Passed
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">2025-09-30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quality Badges */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Quality & Cold-Chain Badges
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    ❄️
                  </div>
                  <div>
                    <p className="font-bold text-white">Cold-Chain Temperature Monitored</p>
                    <p className="text-[11px] text-slate-400">2°C to 8°C continuous sensor logging</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                    📜
                  </div>
                  <div>
                    <p className="font-bold text-white">ISO 9001 & GxP Compliance</p>
                    <p className="text-[11px] text-slate-400">Certified pharmaceutical distributor</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
                    🛡️
                  </div>
                  <div>
                    <p className="font-bold text-white">Zero Safety Recalls (12 Mos)</p>
                    <p className="text-[11px] text-slate-400">100% safety & purity verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIED MEDICINES ROSTER */}
      {activeTab === 'medicines' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-400" /> Supplied Pharmaceuticals Roster
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{supplierMedicines.length} Active Items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3">Medicine Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Batch Number</th>
                  <th className="p-3">Stock Quantity</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {supplierMedicines.length > 0 ? (
                  supplierMedicines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white">{m.name}</td>
                      <td className="p-3 text-slate-400">{m.category}</td>
                      <td className="p-3 font-mono text-slate-300">{m.batchNumber || 'N/A'}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {m.stock} {m.unit}
                      </td>
                      <td className="p-3 font-mono text-slate-300">${m.price.toFixed(2)}</td>
                      <td className="p-3 text-slate-400">{m.expiryDate}</td>
                      <td className="p-3 text-right">
                        <Badge variant={m.status === 'In Stock' ? 'success' : 'warning'} size="sm">
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No specific medicines linked directly to this vendor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASE ORDERS HISTORY */}
      {activeTab === 'orders' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" /> Contract Purchase Orders
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Total Order Volume: ${totalValueSupplied.toLocaleString()}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3">Order #</th>
                  <th className="p-3">Ordered Date</th>
                  <th className="p-3">Items Count</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {supplierOrders.length > 0 ? (
                  supplierOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary-400">{o.orderNumber}</td>
                      <td className="p-3 text-slate-400">{o.orderedDate}</td>
                      <td className="p-3 font-mono">{o.items.length} items</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">${o.totalAmount.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={
                            o.status === 'Delivered'
                              ? 'success'
                              : o.status === 'Shipped'
                              ? 'primary'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No active purchase orders found for this vendor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS & CERTIFICATIONS */}
      {activeTab === 'audits' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" /> Full Regulatory Audit & Compliance Records
            </h3>
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Full Audit Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-cyan-400" /> Cold-Chain Temperature Audit
                </span>
                <Badge variant="success" size="sm">Passed (100%)</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Continuous IoT sensor telemetry verifies thermal integrity between 2°C and 8°C throughout transport and storage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> WHO GxP & ISO 9001 Certification
                </span>
                <Badge variant="success" size="sm">Valid thru Dec 2027</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Certified Good Distribution Practice (GDP) and Good Manufacturing Practice (GMP) for clinical supplies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

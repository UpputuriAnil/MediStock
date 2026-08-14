import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, Calendar, TrendingUp, DollarSign, PackageCheck, AlertOctagon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '../components/common/Button';
import { exportToCSV, exportMedicinesToPDF } from '../utils/exportUtils';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../utils/formatters';
import { MOCK_MONTHLY_ANALYTICS } from '../services/mockData';

export const Reports: React.FC = () => {
  const { medicines, suppliers } = useInventory();
  const [dateRange, setDateRange] = useState('YTD 2026');

  const totalInventoryValue = medicines.reduce((acc, m) => acc + m.price * m.stock, 0);
  const totalStockUnits = medicines.reduce((acc, m) => acc + m.stock, 0);

  const analyticsDataMap: Record<string, any[]> = {
    'YTD 2026': [
      { month: 'Jan 26', orders: 45000 },
      { month: 'Feb 26', orders: 52000 },
      { month: 'Mar 26', orders: 61000 },
      { month: 'Apr 26', orders: 48000 },
      { month: 'May 26', orders: 74000 },
      { month: 'Jun 26', orders: 68000 },
      { month: 'Jul 26', orders: 82000 },
      { month: 'Aug 26', orders: 89000 },
    ],
    'Q2 2026': [
      { month: 'Apr 26', orders: 48000 },
      { month: 'May 26', orders: 74000 },
      { month: 'Jun 26', orders: 68000 },
    ],
    '2025': [
      { month: 'Q1 2025', orders: 155000 },
      { month: 'Q2 2025', orders: 178000 },
      { month: 'Q3 2025', orders: 192000 },
      { month: 'Q4 2025', orders: 195000 },
    ],
    '2024': [
      { month: 'Q1 2024', orders: 110000 },
      { month: 'Q2 2024', orders: 125000 },
      { month: 'Q3 2024', orders: 132000 },
      { month: 'Q4 2024', orders: 143000 },
    ],
    '2023': [
      { month: 'Q1 2023', orders: 85000 },
      { month: 'Q2 2023', orders: 92000 },
      { month: 'Q3 2023', orders: 98000 },
      { month: 'Q4 2023', orders: 105000 },
    ],
    'All Time': [
      { month: '2023 (3 Yrs Ago)', orders: 380000 },
      { month: '2024 (2 Yrs Ago)', orders: 510000 },
      { month: '2025 (1 Yr Ago)', orders: 720000 },
      { month: '2026 (Current YTD)', orders: 519000 },
    ],
  };

  const currentChartData = analyticsDataMap[dateRange] || analyticsDataMap['YTD 2026'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Financial valuation metrics, inventory throughput, and regulatory reporting exports
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => exportToCSV('Inventory_Executive_Report', medicines)}
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Excel
          </Button>

          <Button
            onClick={() => exportMedicinesToPDF('MediStock Executive Summary Report', medicines)}
            variant="primary"
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Asset Valuation</span>
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalInventoryValue)}
          </h3>
          <p className="text-xs text-success-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +8.4% vs Previous Quarter
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Units in Stock</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {totalStockUnits.toLocaleString()} Units
          </h3>
          <p className="text-xs text-slate-400 mt-2">Across 8 Storage Rooms</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vendor Reliability Score</span>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            97.8% Compliance
          </h3>
          <p className="text-xs text-slate-400 mt-2">{suppliers.length} Verified Distributors</p>
        </div>
      </div>

      {/* Financial Valuation Chart */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Procurement Spend ($)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Purchasing expenditure trends for {dateRange}</p>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-primary-500 transition-colors"
          >
            <option value="YTD 2026">YTD 2026</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="2025">2025 (Full Year)</option>
            <option value="2024">2024 (Full Year)</option>
            <option value="2023">2023 (Full Year)</option>
            <option value="All Time">All Time (3-Year Historical)</option>
          </select>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="orders" fill="#2563EB" radius={[8, 8, 0, 0]} name="Orders Spend ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, Calendar, TrendingUp, DollarSign, PackageCheck, AlertOctagon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '../components/common/Button';
import { exportToCSV, exportToPDFSimulation } from '../utils/exportUtils';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../utils/formatters';
import { MOCK_MONTHLY_ANALYTICS } from '../services/mockData';

export const Reports: React.FC = () => {
  const { medicines, suppliers } = useInventory();
  const [dateRange, setDateRange] = useState('This Month');

  const totalInventoryValue = medicines.reduce((acc, m) => acc + m.price * m.stock, 0);
  const totalStockUnits = medicines.reduce((acc, m) => acc + m.stock, 0);

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
            onClick={() => exportToPDFSimulation('MediStock Monthly Executive Summary', medicines.length)}
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
            <p className="text-xs text-slate-400 mt-0.5">Purchasing expenditure trends for 2026</p>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="This Month">YTD 2026</option>
            <option value="Last Month">Q2 2026</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

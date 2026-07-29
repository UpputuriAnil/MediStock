import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { MOCK_MONTHLY_ANALYTICS } from '../../services/mockData';
import { useTheme } from '../../context/ThemeContext';

export const InventoryChart: React.FC = () => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E293B' : '#F1F5F9';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Monthly Stock Flow & Orders
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparison of stock inflow, outflow, and purchase orders over 7 months
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              chartType === 'area'
                ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Area Flow
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              chartType === 'bar'
                ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bar Comparison
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={MOCK_MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="stockIn" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" name="Stock In" />
              <Area type="monotone" dataKey="stockOut" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" name="Stock Out" />
            </AreaChart>
          ) : (
            <BarChart data={MOCK_MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="stockIn" fill="#2563EB" radius={[6, 6, 0, 0]} name="Stock In" />
              <Bar dataKey="stockOut" fill="#0EA5E9" radius={[6, 6, 0, 0]} name="Stock Out" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary-600 inline-block" />
          <span className="text-slate-600 dark:text-slate-300">Stock Inbound (Units)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-secondary-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-300">Stock Outbound (Units)</span>
        </div>
      </div>
    </div>
  );
};

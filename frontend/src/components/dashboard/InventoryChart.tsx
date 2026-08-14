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
  const [timeframe, setTimeframe] = useState<string>('YTD 2026');
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E293B' : '#F1F5F9';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  const timeframeDataMap: Record<string, any[]> = {
    'YTD 2026': [
      { month: 'Jan 26', stockIn: 1200, stockOut: 980 },
      { month: 'Feb 26', stockIn: 1500, stockOut: 1100 },
      { month: 'Mar 26', stockIn: 1800, stockOut: 1400 },
      { month: 'Apr 26', stockIn: 1400, stockOut: 1250 },
      { month: 'May 26', stockIn: 2100, stockOut: 1750 },
      { month: 'Jun 26', stockIn: 1900, stockOut: 1600 },
      { month: 'Jul 26', stockIn: 2300, stockOut: 1900 },
      { month: 'Aug 26', stockIn: 2500, stockOut: 2050 },
    ],
    'Q2 2026': [
      { month: 'Apr 26', stockIn: 1400, stockOut: 1250 },
      { month: 'May 26', stockIn: 2100, stockOut: 1750 },
      { month: 'Jun 26', stockIn: 1900, stockOut: 1600 },
    ],
    '2025': [
      { month: 'Q1 25', stockIn: 5400, stockOut: 4800 },
      { month: 'Q2 25', stockIn: 6100, stockOut: 5200 },
      { month: 'Q3 25', stockIn: 6800, stockOut: 5900 },
      { month: 'Q4 25', stockIn: 7200, stockOut: 6400 },
    ],
    '2024': [
      { month: 'Q1 24', stockIn: 4100, stockOut: 3600 },
      { month: 'Q2 24', stockIn: 4500, stockOut: 3900 },
      { month: 'Q3 24', stockIn: 4800, stockOut: 4100 },
      { month: 'Q4 24', stockIn: 5100, stockOut: 4500 },
    ],
    '2023': [
      { month: 'Q1 23', stockIn: 3100, stockOut: 2600 },
      { month: 'Q2 23', stockIn: 3400, stockOut: 2900 },
      { month: 'Q3 23', stockIn: 3700, stockOut: 3100 },
      { month: 'Q4 23', stockIn: 3800, stockOut: 3300 },
    ],
    'All Time': [
      { month: '2023 (3 Yrs Ago)', stockIn: 14000, stockOut: 11500 },
      { month: '2024 (2 Yrs Ago)', stockIn: 18500, stockOut: 15200 },
      { month: '2025 (1 Yr Ago)', stockIn: 25500, stockOut: 22300 },
      { month: '2026 (Current YTD)', stockIn: 15700, stockOut: 12030 },
    ],
  };

  const chartData = timeframeDataMap[timeframe] || timeframeDataMap['YTD 2026'];

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Monthly Stock Flow & Orders
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparison of stock inflow, outflow, and purchase orders ({timeframe})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-primary-500 transition-colors"
          >
            <option value="YTD 2026">YTD 2026</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="2025">2025 (Full Year)</option>
            <option value="2024">2024 (Full Year)</option>
            <option value="2023">2023 (Full Year)</option>
            <option value="All Time">All Time (3-Year Historical)</option>
          </select>

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
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

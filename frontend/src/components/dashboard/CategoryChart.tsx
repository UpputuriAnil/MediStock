import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useInventory } from '../../context/InventoryContext';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#2563EB', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const CategoryChart: React.FC = () => {
  const { categories } = useInventory();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const data = categories.map((cat, idx) => ({
    name: cat.name,
    value: cat.itemCount,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Medicine Categories Breakdown
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Distribution of stored items by therapeutic category
        </p>
      </div>

      <div className="h-56 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#0F172A' : '#FFFFFF'} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Label inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {categories.reduce((acc, c) => acc + c.itemCount, 0)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Total Items
          </span>
        </div>
      </div>

      <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 max-h-32 overflow-y-auto">
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{item.name}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-2">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

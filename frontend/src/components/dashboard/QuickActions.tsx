import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill, FileSpreadsheet, Truck, Clock, BarChart, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  onAddMedicine: () => void;
  onAddSupplier: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddMedicine,
  onAddSupplier,
}) => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Add Medicine', icon: Pill, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', onClick: onAddMedicine },
    { label: 'New Supplier', icon: Truck, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', onClick: onAddSupplier },
    { label: 'Expiry Check', icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', onClick: () => navigate('/expiry-tracking') },
    { label: 'Reports', icon: BarChart, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', onClick: () => navigate('/reports') },
    { label: 'Stock Logs', icon: FileSpreadsheet, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', onClick: () => navigate('/stock-logs') },
    { label: 'Invite Staff', icon: UserPlus, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', onClick: () => navigate('/users') },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
        Quick System Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((act) => (
          <motion.button
            key={act.label}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={act.onClick}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 shadow-xs hover:shadow-md transition-all text-center group cursor-pointer"
          >
            <div className={`p-3 rounded-xl mb-2 transition-transform group-hover:scale-110 ${act.color}`}>
              <act.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {act.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

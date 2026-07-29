import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface HeroSectionProps {
  onAddMedicine: () => void;
  onNewOrder: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onAddMedicine, onNewOrder }) => {
  const { user } = useAuth();
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 border border-slate-200/60 dark:border-slate-800 shadow-soft glass-card glass-hero-gradient dark:glass-hero-gradient-dark"
    >
      {/* Decorative ambient blurred blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          {/* Today Date Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900 text-xs font-bold text-primary-600 dark:text-primary-400 mb-3 shadow-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayDate}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.name || 'Dr. Sarah'}</span> 👋
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            MediStock active status: <span className="text-success-600 font-bold">99.8% System Uptime</span>. 3 low stock alerts require your approval today.
          </p>

          {/* Quick summary chips */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
              <TrendingUp className="w-4 h-4 text-success-500" />
              <span>+14.2% Monthly Inflow</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
              <AlertCircle className="w-4 h-4 text-warning-500" />
              <span>2 Expiry Warnings</span>
            </div>
          </div>
        </div>

        {/* Quick Hero Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Button
            onClick={onAddMedicine}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            className="flex-1 md:flex-none shadow-glow-primary"
          >
            Add Medicine
          </Button>
          <Button
            onClick={onNewOrder}
            variant="outline"
            leftIcon={<Sparkles className="w-4 h-4 text-secondary-500" />}
            className="flex-1 md:flex-none"
          >
            New Purchase Order
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

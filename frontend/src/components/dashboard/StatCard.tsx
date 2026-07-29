import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  iconBgColor = 'bg-primary-50 dark:bg-primary-950/60',
  iconTextColor = 'text-primary-600 dark:text-primary-400',
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        'glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-200/70 dark:border-slate-800 transition-all duration-300',
        onClick && 'cursor-pointer hover:border-primary-500/50'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            {value}
          </h3>
        </div>

        <div className={cn('p-3 rounded-2xl shadow-xs', iconBgColor, iconTextColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {change && (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-xs font-bold',
              isPositive ? 'text-success-600 dark:text-success-400' : 'text-danger-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}

        {subtitle && (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};

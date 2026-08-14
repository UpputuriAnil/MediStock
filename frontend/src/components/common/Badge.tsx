import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className,
}) => {
  const styles = {
    primary: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/30 font-bold',
    secondary: 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30 font-bold',
    success: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30 font-extrabold',
    danger: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/30 font-extrabold',
    warning: 'bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30 font-extrabold',
    neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-bold',
  };

  const dots = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-emerald-500',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    neutral: 'bg-slate-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-tight transition-colors',
        styles[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dots[variant])} />}
      {children}
    </span>
  );
};

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
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border-primary-200 dark:border-primary-800',
    secondary: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-950/60 dark:text-secondary-300 border-secondary-200 dark:border-secondary-800',
    success: 'bg-success-50 text-success-700 dark:bg-success-950/60 dark:text-success-300 border-success-200 dark:border-success-800',
    danger: 'bg-danger-50 text-danger-700 dark:bg-danger-950/60 dark:text-danger-300 border-danger-200 dark:border-danger-800',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-950/60 dark:text-warning-300 border-warning-200 dark:border-warning-800',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const dots = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    danger: 'bg-danger-500',
    warning: 'bg-warning-500',
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

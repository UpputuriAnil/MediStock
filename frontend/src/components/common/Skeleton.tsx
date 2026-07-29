import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'rounded-xl skeleton-shimmer bg-slate-200 dark:bg-slate-800/80',
        className
      )}
    />
  );
};

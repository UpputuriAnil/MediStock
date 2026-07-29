import React from 'react';
import { Clock, ArrowDownRight, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Badge } from '../common/Badge';

export const ActivityTimeline: React.FC = () => {
  const { stockLogs } = useInventory();

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Stock In':
        return <Badge variant="success"><ArrowDownRight className="w-3 h-3 mr-0.5 inline" />Stock In</Badge>;
      case 'Stock Out':
        return <Badge variant="primary"><ArrowUpRight className="w-3 h-3 mr-0.5 inline" />Stock Out</Badge>;
      case 'Disposed':
        return <Badge variant="danger"><AlertCircle className="w-3 h-3 mr-0.5 inline" />Disposed</Badge>;
      default:
        return <Badge variant="warning"><RefreshCw className="w-3 h-3 mr-0.5 inline" />Adjustment</Badge>;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Activities Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit feed of inventory stock changes and user actions
          </p>
        </div>
        <Clock className="w-5 h-5 text-slate-400" />
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {stockLogs.slice(0, 5).map((log) => (
          <div key={log.id} className="relative group">
            {/* Dot node */}
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary-600 ring-4 ring-white dark:ring-slate-900" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {log.medicineName}
                </span>
                {getTypeBadge(log.type)}
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {log.timestamp}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {log.reason}
            </p>

            <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
              <span>Qty: <strong className="text-slate-700 dark:text-slate-300">{log.quantity}</strong></span>
              <span>•</span>
              <span>By: <strong className="text-primary-600 dark:text-primary-400">{log.performedBy}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

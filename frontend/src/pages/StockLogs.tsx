import React, { useState } from 'react';
import { History, Search, Filter, ArrowDownRight, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Badge } from '../components/common/Badge';

export const StockLogs: React.FC = () => {
  const { stockLogs } = useInventory();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredLogs = stockLogs.filter((log) => {
    const matchesSearch =
      log.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      log.reason.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'All' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Stock In':
        return <Badge variant="success" dot><ArrowDownRight className="w-3 h-3 mr-0.5 inline" />Stock In</Badge>;
      case 'Stock Out':
        return <Badge variant="primary" dot><ArrowUpRight className="w-3 h-3 mr-0.5 inline" />Stock Out</Badge>;
      case 'Disposed':
        return <Badge variant="danger" dot><AlertCircle className="w-3 h-3 mr-0.5 inline" />Disposed</Badge>;
      default:
        return <Badge variant="warning" dot><RefreshCw className="w-3 h-3 mr-0.5 inline" />Adjustment</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Inventory Audit & Stock Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete immutable ledger of stock additions, clinical disbursements, disposal write-offs, and adjustments
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log by medicine, staff, or reason..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="All">All Movements</option>
            <option value="Stock In">Stock In (+)</option>
            <option value="Stock Out">Stock Out (-)</option>
            <option value="Adjustment">Adjustments</option>
            <option value="Disposed">Disposed Write-offs</option>
          </select>
        </div>
      </div>

      {/* Stock Logs Table */}
      <div className="glass-card rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Log ID</th>
                <th className="p-4">Medicine Item</th>
                <th className="p-4">Action Type</th>
                <th className="p-4">Quantity Change</th>
                <th className="p-4">Previous Stock</th>
                <th className="p-4">New Stock</th>
                <th className="p-4">Performed By</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Clinical Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-slate-400 font-bold">{log.id}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{log.medicineName}</td>
                  <td className="p-4">{getTypeBadge(log.type)}</td>
                  <td className="p-4 font-extrabold">
                    {log.type === 'Stock In' ? (
                      <span className="text-success-600 dark:text-success-400">+{log.quantity}</span>
                    ) : log.type === 'Stock Out' || log.type === 'Disposed' ? (
                      <span className="text-danger-500">-{log.quantity}</span>
                    ) : (
                      <span className="text-warning-600">±{log.quantity}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">{log.previousStock}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{log.newStock}</td>
                  <td className="p-4 font-semibold text-primary-600 dark:text-primary-400">{log.performedBy}</td>
                  <td className="p-4 text-slate-400 font-mono">{log.timestamp}</td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

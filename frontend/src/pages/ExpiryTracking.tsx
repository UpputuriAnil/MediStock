import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar as CalendarIcon, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Badge } from '../components/common/Badge';
import { getExpiryStatus, getDaysRemaining } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const ExpiryTracking: React.FC = () => {
  const { medicines } = useInventory();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar'>('timeline');

  // Filter items into Near Expiry (< 90 days) and Expired
  const nearExpiryMeds = medicines.filter((m) => {
    const days = getDaysRemaining(m.expiryDate);
    return days >= 0 && days <= 90;
  });

  const expiredMeds = medicines.filter((m) => {
    const days = getDaysRemaining(m.expiryDate);
    return days < 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expiration & Batch Risk Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cold-chain and room-temperature pharmaceutical expiration timelines with automated warnings
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${activeTab === 'timeline'
                ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Clock className="w-3.5 h-3.5" /> Timeline View
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar View
          </button>
        </div>
      </div>

      {/* KPI Alert Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Near Expiry Warning ({nearExpiryMeds.length} Batches)
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Expiring within the next 90 days
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500 text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Expired Write-offs ({expiredMeds.length} Batches)
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Quarantined for disposal
              </p>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'timeline' ? (
        <div className="space-y-6">
          {/* Near Expiry Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Near Expiry Medicines Countdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearExpiryMeds.map((med) => {
                const days = getDaysRemaining(med.expiryDate);
                const statusInfo = getExpiryStatus(med.expiryDate);

                return (
                  <motion.div
                    key={med.id}
                    whileHover={{ y: -3 }}
                    className="glass-card rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={days <= 30 ? 'danger' : 'warning'} dot>
                          {statusInfo.label}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400">
                          Batch: {med.batchNumber}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {med.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">{med.category}</p>

                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Stock Count</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{med.stock} {med.unit}s</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Location: {med.location}</span>
                      <button
                        onClick={() => navigate('/medicines')}
                        className="font-bold text-primary-600 hover:underline flex items-center gap-1"
                      >
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Expired List */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Quarantined Expired Stock
            </h3>
            <div className="glass-card rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4">Medicine Item</th>
                    <th className="p-4">Batch Number</th>
                    <th className="p-4">Stock Qty</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status Pill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {expiredMeds.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="p-4 font-mono text-slate-400">{m.batchNumber}</td>
                      <td className="p-4 font-bold text-danger-500">{m.stock} {m.unit}s</td>
                      <td className="p-4 text-slate-500 font-semibold">{m.expiryDate}</td>
                      <td className="p-4 text-slate-400">{m.location}</td>
                      <td className="p-4"><Badge variant="danger">Expired</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Calendar Grid View Simulation */
        <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            July / August 2026 Batch Expiry Calendar
          </h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const hasAlert = day === 15 || day === 20;
              return (
                <div
                  key={day}
                  className={`h-20 rounded-xl border p-2 flex flex-col justify-between text-xs font-semibold ${hasAlert
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <span className="text-[11px] font-bold">{day}</span>
                  {hasAlert && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold truncate">
                      {day === 15 ? 'Insulin Exp' : 'Comirnaty'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

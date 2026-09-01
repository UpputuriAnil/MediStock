import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Filter, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';

export const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const { user } = useAuth();
  const { isAdmin, isPharmacist, isStaff, isSupplier } = useRole();

  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Unread') return !n.read;
    return n.category === categoryFilter;
  });

  const getRoleHeaderSubtitle = () => {
    if (isSupplier) {
      return 'Supplier Portal Notifications • Relevant purchase order requisitions, shipment dispatch requests, delivery acknowledgments, and fulfillment updates.';
    }
    if (isStaff) {
      return 'Staff Operational Alerts • Low stock warnings, restock logs, batch expiration notices, and shift task assignments.';
    }
    if (isAdmin) {
      return 'Enterprise Audit & Governance • Security compliance logs, user role audit alerts, network out-of-stock notices, and vendor registrations.';
    }
    return 'Pharmacy Operations Notifications • Real-time critical stock alerts, batch expiry warnings, purchase order status updates, and audit logs.';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isSupplier ? 'Supplier Notifications' : 'Notification Center'}
            </h1>
            {unreadCount > 0 ? (
              <Badge variant="danger">{unreadCount} Unread</Badge>
            ) : (
              <Badge variant="success">All Caught Up</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {getRoleHeaderSubtitle()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark All Read
          </Button>
          <Button
            onClick={clearAll}
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-danger-500" />}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
        {['All', 'Unread', 'Stock', 'Expiry', 'Order', 'System'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications Animated List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center text-slate-400 glass-card rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm">No notifications found in this category.</p>
            </motion.div>
          ) : (
            filtered.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  n.read
                    ? 'glass-card border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-primary-300 dark:border-primary-800 shadow-md ring-1 ring-primary-500/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl text-white shrink-0 mt-0.5 ${
                      n.type === 'alert'
                        ? 'bg-danger-500'
                        : n.type === 'warning'
                        ? 'bg-warning-500'
                        : n.type === 'success'
                        ? 'bg-success-500'
                        : 'bg-primary-500'
                    }`}
                  >
                    {n.type === 'alert' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : n.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                      <Badge variant="neutral" size="sm">{n.category}</Badge>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">{n.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.read ? (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/80 dark:hover:bg-primary-900 text-primary-600 dark:text-primary-300 text-xs font-bold transition-all border border-primary-200 dark:border-primary-700/60 flex items-center gap-1.5 shadow-xs"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-primary-500" />
                      <span>Mark as read</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-emerald-500" /> Read
                    </span>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

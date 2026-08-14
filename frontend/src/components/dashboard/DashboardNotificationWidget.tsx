import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

export const DashboardNotificationWidget: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotifications();
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Notification & Live Operational Alerts
            </h3>
            <p className="text-[11px] text-slate-400">Real-time inventory, stock, and expiry notifications</p>
          </div>
        </div>
        {unreadCount > 0 ? (
          <Badge variant="danger">{unreadCount} Unread</Badge>
        ) : (
          <Badge variant="success">All Caught Up</Badge>
        )}
      </div>

      <div className="space-y-2.5">
        {recentNotifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No active notifications.
          </div>
        ) : (
          recentNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => navigate('/notifications')}
              className={`p-3 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer ${
                n.read
                  ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/80 opacity-80'
                  : 'bg-white dark:bg-slate-900 border-primary-300 dark:border-primary-800/80 shadow-xs'
              }`}
            >
              <div
                className={`p-2 rounded-xl text-white shrink-0 mt-0.5 ${
                  n.type === 'alert'
                    ? 'bg-rose-500'
                    : n.type === 'warning'
                    ? 'bg-amber-500'
                    : n.type === 'success'
                    ? 'bg-emerald-500'
                    : 'bg-primary-500'
                }`}
              >
                {n.type === 'alert' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : n.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                  <Badge variant="neutral" size="sm">{n.category}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{n.message}</p>
                <span className="text-[10px] text-slate-400 block mt-1">{n.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => navigate('/notifications')}
        className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
      >
        View All Notifications & Alerts <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

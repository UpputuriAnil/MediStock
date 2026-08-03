import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Pill,
  Tags,
  Truck,
  ShoppingBag,
  History,
  Clock,
  Bell,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Cross,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const userRoleStr = (user?.role || (user as any)?.roles?.[0] || 'Pharmacist').toLowerCase();
  const isAdmin = userRoleStr.includes('admin');
  const isPharmacist = userRoleStr.includes('pharm');

  const allMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'pharmacist', 'staff'] },
    { name: 'Medicine Inventory', path: '/medicines', icon: Pill, roles: ['admin', 'pharmacist', 'staff'] },
    { name: 'Categories', path: '/categories', icon: Tags, roles: ['admin', 'pharmacist'] },
    { name: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['admin', 'pharmacist'] },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag, roles: ['admin', 'pharmacist'] },
    { name: 'Stock Logs', path: '/stock-logs', icon: History, roles: ['admin', 'pharmacist', 'staff'] },
    { name: 'Expiry Tracking', path: '/expiry-tracking', icon: Clock, roles: ['admin', 'pharmacist', 'staff'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount, roles: ['admin', 'pharmacist', 'staff'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'pharmacist'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (isAdmin) return true;
    if (isPharmacist) return item.roles.includes('pharmacist');
    return item.roles.includes('staff');
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#090D16] text-slate-300 border-r border-slate-800/80 transition-all duration-300 shadow-2xl select-none',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/40">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-glow-primary shrink-0">
              <Cross className="w-5 h-5 font-bold" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-extrabold text-base text-white tracking-tight leading-tight">
                  Medi<span className="text-secondary-400">Stock</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                  Enterprise v2.4
                </span>
              </motion.div>
            )}
          </NavLink>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                    isActive
                      ? 'sidebar-gradient-active text-white font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  )
                }
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-400'
                  )}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 tracking-wide">{item.name}</span>
                )}

                {item.badge && item.badge > 0 ? (
                  <span
                    className={cn(
                      'flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-danger-500 shrink-0',
                      isCollapsed && 'absolute top-2 right-2 px-1'
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}

                {/* Hover Tooltip for Collapsed Sidebar */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div
            className={cn(
              'flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/60',
              isCollapsed && 'justify-center p-1.5'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-500/30 shrink-0"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-100 truncate">{user?.name || 'Dr. Sarah'}</p>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-secondary-400" />
                    <p className="text-[10px] font-medium text-slate-400 truncate">{user?.role || 'Chief Pharmacist'}</p>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="rounded-lg p-1.5 text-slate-400 hover:text-danger-400 hover:bg-danger-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

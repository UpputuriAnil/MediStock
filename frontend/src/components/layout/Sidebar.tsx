import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Pill,
  Tags,
  Boxes,
  Truck,
  ShoppingBag,
  Clock,
  Bell,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  Cross,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useRole } from '../../hooks/useRole';
import { cn } from '../../utils/cn';
import { formatNameFromEmail } from '../../utils/formatters';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  name: string;
  path: string;
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { role, isAdmin, isStaff, isSupplier } = useRole();
  const location = useLocation();

  const displayName = user
    ? (user.name && !['Admin', 'Pharmacist', 'Staff', 'User', 'Staff Member'].includes(user.name)
        ? user.name
        : formatNameFromEmail(user.email))
    : 'Loading...';

  const displayRoleLabel = user
    ? (role ? role.toUpperCase() : 'USER')
    : 'LOADING...';

  const adminMenuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Users & Roles', path: '/users', icon: Users },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Inventory', path: '/stock-logs', icon: Boxes },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Purchases', path: '/purchase-orders', icon: ShoppingBag },
    { name: 'Expiry Tracking', path: '/expiry-tracking', icon: Clock },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'System Monitoring', path: '/system-monitoring', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const pharmacistMenuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/pharmacist-dashboard', icon: LayoutDashboard },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Inventory', path: '/stock-logs', icon: Boxes },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Purchases', path: '/purchase-orders', icon: ShoppingBag },
    { name: 'Expiry Tracking', path: '/expiry-tracking', icon: Clock },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Profile', path: '/settings', icon: UserIcon },
  ];

  const staffMenuItems: MenuItem[] = [
    { name: 'Staff Dashboard', path: '/staff-dashboard', icon: LayoutDashboard },
    { name: 'Medicines View', path: '/medicines', icon: Pill },
    { name: 'Stock Logs', path: '/stock-logs', icon: Boxes },
    { name: 'Expiry Tracking', path: '/expiry-tracking', icon: Clock },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const supplierMenuItems: MenuItem[] = [
    { name: 'Supplier Portal', path: '/supplier-dashboard', icon: LayoutDashboard },
    { name: 'Supplied Medicines', path: '/medicines', icon: Pill },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Vendor Profile', path: '/settings', icon: UserIcon },
  ];

  let menuItems = pharmacistMenuItems;
  if (isAdmin) menuItems = adminMenuItems;
  else if (isSupplier) menuItems = supplierMenuItems;
  else if (isStaff) menuItems = staffMenuItems;

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
        {/* Header Logo Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25 shrink-0">
              <Cross className="w-6 h-6 rotate-45" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-white tracking-tight leading-none truncate">
                  MediStock
                </h1>
                <span className="text-[10px] font-bold tracking-widest text-primary-400 uppercase">
                  Pharmacy Portal
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {/* Optional Badge */}
                {item.badge && item.badge > 0 ? (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-xs',
                      isCollapsed ? 'absolute top-2 right-2' : '',
                      isActive
                        ? 'bg-white text-primary-600'
                        : 'bg-danger-500/20 text-danger-400 border border-danger-500/30'
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
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
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                alt={displayName}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-500/30 shrink-0"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-secondary-400" />
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                      {displayRoleLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="rounded-lg p-1.5 text-slate-400 hover:text-danger-400 hover:bg-danger-950/40 transition-colors shrink-0"
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

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Lock,
  Moon,
  Sun,
  Laptop,
  Bell,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  LogOut,
  Download,
  CheckCircle2,
  AlertTriangle,
  Key,
  Shield,
  Palette,
  Sliders,
  Type,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import toast from 'react-hot-toast';
import { formatNameFromEmail } from '../utils/formatters';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'theme' | 'notifications' | 'security'>('profile');

  // --- Profile Form State ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  // Auto-fill & auto-repair profile data from active session / local registry
  useEffect(() => {
    const rawSavedUser = localStorage.getItem('medistock_user') || localStorage.getItem('user');
    let savedUserObj: any = null;
    try {
      if (rawSavedUser) savedUserObj = JSON.parse(rawSavedUser);
    } catch (e) {}

    const registry = JSON.parse(localStorage.getItem('medistock_user_registry') || '{}');
    const activeUser = user || savedUserObj || {};

    const lastRegName = localStorage.getItem('medistock_last_registered_name');
    const lastRegEmail = localStorage.getItem('medistock_last_registered_email');

    let activeEmail = (activeUser.email || lastRegEmail || '').toLowerCase();
    const regUser = activeEmail ? (registry[activeEmail] || {}) : {};

    // Resolve Full Name
    let resolvedName = activeUser.name;
    const isGenericRoleName = ['Admin', 'Pharmacist', 'Staff', 'Staff Member', 'User', 'Registered User'].includes(resolvedName || '');
    if (!resolvedName || isGenericRoleName) {
      resolvedName = regUser.name || lastRegName || formatNameFromEmail(activeEmail);
    }

    // Resolve Email
    let resolvedEmail = activeUser.email || regUser.email || lastRegEmail || '';

    // Resolve Phone
    const resolvedPhone = activeUser.phone || activeUser.phoneNumber || regUser.phone || '';

    const roleStr = String(activeUser.role || regUser.role || '').toLowerCase();

    // Resolve Department (Read-Only field)
    let resolvedDept = activeUser.department || regUser.department;
    if (!resolvedDept) {
      if (roleStr.includes('admin')) resolvedDept = 'IT & System Security';
      else if (roleStr.includes('staff')) resolvedDept = 'General Medical Staff';
      else resolvedDept = 'Central Pharmacy';
    }

    setName(resolvedName);
    setEmail(resolvedEmail);
    setPhone(resolvedPhone);
    setDepartment(resolvedDept);

    // Save repaired user to localStorage
    const repairedUser = {
      ...activeUser,
      id: activeUser.id || `usr_${Date.now()}`,
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      department: resolvedDept,
      role: activeUser.role || (roleStr.includes('admin') ? 'Admin' : roleStr.includes('staff') ? 'Staff' : 'Pharmacist'),
    };
    localStorage.setItem('medistock_user', JSON.stringify(repairedUser));
    localStorage.setItem('user', JSON.stringify(repairedUser));
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    toast.success('Profile preferences updated successfully.');
  };

  // --- Password State & Show/Hide Toggles ---
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Chrome on Windows 11', ip: '192.168.1.104', location: 'Hyderabad, India', current: true, time: 'Active now' },
    { id: 2, device: 'Safari on iPhone 14 Pro', ip: '49.207.210.45', location: 'Hyderabad, India', current: false, time: '2 hours ago' },
    { id: 3, device: 'Firefox on macOS Monterey', ip: '103.110.170.12', location: 'Bengaluru, India', current: false, time: 'Yesterday at 18:40' },
  ]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogoutOtherDevices = () => {
    setActiveSessions(activeSessions.filter((s) => s.current));
    toast.success('Terminated all active sessions on other devices.');
  };

  // --- Theme & Appearance State ---
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [sidebarCollapsedToggle, setSidebarCollapsedToggle] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [compactMode, setCompactMode] = useState(false);

  // --- Notification Toggles ---
  const [notificationsState, setNotificationsState] = useState({
    emailAlerts: true,
    smsAlerts: false,
    lowStockAlerts: true,
    expiryAlerts: true,
    purchaseApprovalAlerts: true,
    orderStatusUpdates: true,
    desktopNotifications: true,
  });

  const toggleNotif = (key: keyof typeof notificationsState) => {
    setNotificationsState((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification settings updated.');
  };

  // --- Audit Log State ---
  const auditLogs = [
    { id: 'LOG-8901', device: 'Windows PC (Chrome 122)', ip: '192.168.1.104', browser: 'Chrome', time: '2026-08-06 18:30:12', status: 'Success' },
    { id: 'LOG-8894', device: 'iPhone 14 Pro (Safari 17)', ip: '49.207.210.45', browser: 'Safari', time: '2026-08-06 16:15:44', status: 'Success' },
    { id: 'LOG-8820', device: 'Unknown Device (Edge 121)', ip: '103.110.170.12', browser: 'Edge', time: '2026-08-05 22:10:05', status: 'Failed Attempt' },
    { id: 'LOG-8761', device: 'macOS Workstation (Firefox)', ip: '182.73.19.88', browser: 'Firefox', time: '2026-08-04 11:20:00', status: 'Success' },
  ];

  const handleDownloadAuditLog = () => {
    const csvContent = "data:text/csv;charset=utf-8,Log ID,Device,IP Address,Browser,Timestamp,Status\n"
      + auditLogs.map(l => `${l.id},"${l.device}",${l.ip},${l.browser},${l.time},${l.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medistock_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit activity log exported as CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & Account Preferences
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, security credentials, application preferences, and notifications.
        </p>
      </div>

      {/* Main Settings Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Settings Vertical Menu */}
        <div className="glass-card rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md space-y-1.5 h-fit shadow-lg">
          {[
            { id: 'profile', label: 'User Profile', icon: UserIcon },
            { id: 'password', label: 'Password & Security', icon: Lock },
            { id: 'theme', label: 'Theme & Appearance', icon: Moon },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Audit Log & Security', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active Tab Content Card */}
        <div className="lg:col-span-3">
          {/* TAB 1: USER PROFILE SECTION */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xl space-y-6"
            >
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                User Profile Preferences
              </h2>

              {/* Editable Fields Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>

                  {/* Read Only Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Department / Unit</span>
                      <span className="text-[10px] text-amber-500 font-bold uppercase">(Read Only)</span>
                    </label>
                    <input
                      type="text"
                      value={department}
                      readOnly
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold px-6 shadow-lg shadow-blue-500/20"
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: PASSWORD & SECURITY */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xl space-y-6"
            >
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Password & Authentication Controls
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrPassword ? 'text' : 'password'}
                      value={currPassword}
                      onChange={(e) => setCurrPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrPassword(!showCurrPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="primary" size="sm" className="bg-[#3B82F6] hover:bg-blue-600 font-bold">
                  Change Password
                </Button>
              </form>

              {/* 2FA Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Add an extra layer of security requiring an SMS code or Authenticator token at sign-in.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      toast.success(`2FA Authentication ${!twoFactorEnabled ? 'Enabled' : 'Disabled'}.`);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      twoFactorEnabled ? 'bg-[#3B82F6]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Active Sessions List */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Account Sessions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Devices currently authorized and logged into your MediStock account.
                    </p>
                  </div>
                  <Button
                    onClick={handleLogoutOtherDevices}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-danger-600 border-danger-300 dark:border-danger-800 hover:bg-danger-50 dark:hover:bg-danger-950/40"
                    leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  >
                    Logout from Other Devices
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-[#3B82F6]" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {session.device}
                            {session.current && <Badge variant="success" size="sm">Current Session</Badge>}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            IP: {session.ip} • {session.location} • {session.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: THEME & APPEARANCE */}
          {activeTab === 'theme' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xl space-y-6"
            >
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Theme & UI Appearance Customization
              </h2>

              {/* Theme Mode Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Application Theme Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon },
                    { id: 'light', label: 'Light Mode', icon: Sun },
                    { id: 'system', label: 'System Theme', icon: Laptop },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = themeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setThemeMode(mode.id as any);
                          if ((mode.id === 'dark' && theme !== 'dark') || (mode.id === 'light' && theme !== 'light')) {
                            toggleTheme();
                          }
                        }}
                        className={`p-4 rounded-xl border font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6] shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Accent Color Palette
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { color: '#3B82F6', label: 'Royal Blue' },
                    { color: '#10B981', label: 'Emerald' },
                    { color: '#8B5CF6', label: 'Purple' },
                    { color: '#F59E0B', label: 'Amber' },
                  ].map((acc) => (
                    <button
                      key={acc.color}
                      onClick={() => {
                        setAccentColor(acc.color);
                        toast.success(`Accent color changed to ${acc.label}`);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        accentColor === acc.color ? 'ring-2 ring-offset-2 ring-[#3B82F6] scale-110' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: acc.color }}
                      title={acc.label}
                    />
                  ))}
                </div>
              </div>

              {/* Preferences Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-slate-900 dark:text-white">Sidebar Collapse Toggle</p>
                    <p className="text-[11px] font-normal text-slate-400">Keep left navigation mini by default</p>
                  </div>
                  <button
                    onClick={() => setSidebarCollapsedToggle(!sidebarCollapsedToggle)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${sidebarCollapsedToggle ? 'bg-[#3B82F6]' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${sidebarCollapsedToggle ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-slate-900 dark:text-white">Compact Mode Toggle</p>
                    <p className="text-[11px] font-normal text-slate-400">Reduce table row padding for density</p>
                  </div>
                  <button
                    onClick={() => setCompactMode(!compactMode)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${compactMode ? 'bg-[#3B82F6]' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${compactMode ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Font Size Scaling
                </label>
                <div className="flex items-center gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase transition-all ${
                        fontSize === sz ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-white space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#3B82F6]">Live Customization Preview</span>
                <p className="text-xs font-semibold">MediStock Enterprise V2.4 — Live Dashboard Interface Preview</p>
              </div>
            </motion.div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xl space-y-6"
            >
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Notification & Alert Channel Toggles
              </h2>

              <div className="space-y-3">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily summary digests and immediate stock risk emails.' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive direct SMS alerts for critical stock depletion.' },
                  { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Trigger notifications when items fall below reorder thresholds.' },
                  { key: 'expiryAlerts', label: 'Expiry Alerts', desc: 'Trigger notifications for batches expiring within 90 days.' },
                  { key: 'purchaseApprovalAlerts', label: 'Purchase Approval Notifications', desc: 'Notify when new purchase orders require role authorization.' },
                  { key: 'orderStatusUpdates', label: 'Order Status Updates', desc: 'Track requisition delivery progress updates.' },
                  { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show browser popups while logged into MediStock.' },
                ].map((item) => {
                  const isChecked = (notificationsState as any)[item.key] ?? true;
                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotif(item.key as any)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          isChecked ? 'bg-[#3B82F6]' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                            isChecked ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 5: AUDIT LOG & SECURITY */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Audit Log & Security Trail
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review recent login history, device footprints, IP addresses, and authorization attempts.
                  </p>
                </div>
                <Button
                  onClick={handleDownloadAuditLog}
                  variant="primary"
                  size="sm"
                  className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download Activity Log
                </Button>
              </div>

              {/* Login History Table */}
              <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/90 font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Log ID</th>
                      <th className="p-3">Device Name</th>
                      <th className="p-3">Browser</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Login Time</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{log.id}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{log.device}</td>
                        <td className="p-3 font-semibold text-slate-500">{log.browser}</td>
                        <td className="p-3 font-mono text-slate-400">{log.ip}</td>
                        <td className="p-3 text-slate-400">{log.time}</td>
                        <td className="p-3">
                          <Badge variant={log.status === 'Success' ? 'success' : 'danger'} size="sm">
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

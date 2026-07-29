import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Lock, Bell, Moon, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'theme' | 'notifications' | 'security'>('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');

  // Password state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [poAlerts, setPoAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone, department });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & Account Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, security credentials, dark mode themes, and alert channels
        </p>
      </div>

      {/* Main Settings Tabs Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="glass-card rounded-2xl p-2 border border-slate-200/70 dark:border-slate-800 space-y-1 h-fit">
          {[
            { id: 'profile', label: 'User Profile', icon: UserIcon },
            { id: 'password', label: 'Password & Security', icon: Lock },
            { id: 'theme', label: 'Theme & Appearance', icon: Moon },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Audit Log & Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white font-bold shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active Tab Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Information
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                    alt={user?.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary-500/40"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</h4>
                    <p className="text-xs text-slate-400">{user?.role} • {user?.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Contact"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    label="Department / Unit"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Account Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs font-semibold">
                <Input
                  label="Current Password"
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary">
                    Update Security Password
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appearance & Theme Mode
              </h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dark Mode Theme
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Toggle sleek dark navy high-contrast layout mode for low-light clinical environments
                  </p>
                </div>

                <Button variant="outline" onClick={toggleTheme}>
                  Switch to {theme === 'dark' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Notification Preferences
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Email Digest Alerts</p>
                    <p className="text-xs text-slate-400 font-normal">Receive daily summary reports on stock fluctuations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Batch Expiry Critical Warnings</p>
                    <p className="text-xs text-slate-400 font-normal">Notify immediately when batches enter 30-day expiry threshold</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={expiryAlerts}
                    onChange={(e) => setExpiryAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Sessions & Security Logs
              </h3>

              <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                  <span>Current Browser Session (Windows / Chrome)</span>
                  <span className="text-success-600 font-bold">Active Now</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between text-slate-400">
                  <span>Pharmacy Terminal T-4 (Boston, MA)</span>
                  <span>Logged out 2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

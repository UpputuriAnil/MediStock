import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, UserPlus, ShieldCheck, Mail, Phone, MoreVertical, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { MOCK_USERS } from '../services/mockData';
import { User, UserRole } from '../types/user';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Users: React.FC = () => {
  const { user } = useAuth();
  
  // State for user management (loaded from localStorage or initialized with MOCK_USERS)
  const [userListState, setUserListState] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('medistock_users_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return MOCK_USERS;
  });

  // Save to localStorage when userListState changes
  useEffect(() => {
    try {
      localStorage.setItem('medistock_users_list', JSON.stringify(userListState));
    } catch (e) {}
  }, [userListState]);

  // Modal & Action states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Invite Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Staff Pharmacist');
  const [department, setDepartment] = useState('Pharmacy Services');

  // Edit Form state
  const [editRole, setEditRole] = useState<UserRole>('Staff Pharmacist');
  const [editDepartment, setEditDepartment] = useState('');

  // Synchronize profile names with current user profile in localStorage if applicable
  const userList = React.useMemo(() => {
    return userListState.map((u) => {
      const uRole = (u.role || '').toLowerCase();
      let roleKey = '';
      if (uRole.includes('admin')) roleKey = 'admin';
      else if (uRole.includes('staff')) roleKey = 'staff';
      else if (uRole.includes('supplier')) roleKey = 'supplier';
      else roleKey = 'pharmacist';

      try {
        const raw = localStorage.getItem(`medistock_profile_${roleKey}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.name && (user?.email === u.email || parsed?.email === u.email || user?.id === u.id)) {
            return {
              ...u,
              name: parsed.name,
              email: parsed.email || u.email,
              phone: parsed.phone || u.phone,
              department: parsed.department || u.department,
            };
          }
        }
      } catch (e) {}
      return u;
    });
  }, [user, userListState]);

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      department,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Pending',
      lastActive: 'Invited just now',
    };
    setUserListState((prev) => [newUser, ...prev]);
    toast.success(`Invitation email sent to ${email}`);
    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
  };

  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUserListState((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? { ...u, role: editRole, department: editDepartment || u.department }
          : u
      )
    );
    toast.success(`Updated role & permissions for ${editingUser.name}`);
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;

    setUserListState((prev) => prev.filter((u) => u.id !== deletingUser.id));
    toast.error(`Removed ${deletingUser.name} and revoked access roles`);
    setDeletingUser(null);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') return <Badge variant="success">Active</Badge>;
    if (status === 'Pending') return <Badge variant="warning">Pending</Badge>;
    return <Badge variant="neutral">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Roster & Access Permissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage clinical staff permissions, role assignments, department privileges, and access logs
          </p>
        </div>

        <Button
          onClick={() => setIsInviteModalOpen(true)}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Invite Staff Member
        </Button>
      </div>

      {/* Users Data Table */}
      <div className="glass-card rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Access Role</th>
                <th className="p-4">Department Unit</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-200">
              {userList.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{u.role}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                    {u.department}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {u.lastActive}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(u.status)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Direct Edit Button */}
                      <button
                        onClick={() => {
                          setEditRole(u.role);
                          setEditDepartment(u.department);
                          setEditingUser(u);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit User Role & Department"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Direct Delete Button */}
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-2 rounded-xl text-rose-500/80 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete User & Revoke Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Overflow 3-Dots Menu */}
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveMenuUserId(activeMenuUserId === u.id ? null : u.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuUserId === u.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuUserId(null)}
                            />
                            <div
                              className={`absolute right-0 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-30 py-1 text-xs text-left ${
                                idx >= userList.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  setEditRole(u.role);
                                  setEditDepartment(u.department);
                                  setEditingUser(u);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-primary-500" />
                                Edit Role & Dept
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  setDeletingUser(u);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete User / Role
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Healthcare Staff"
        subtitle="Grant role-based access credentials to pharmacy staff or administrators"
      >
        <form onSubmit={handleInviteUser} className="space-y-4 text-xs font-semibold">
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Alexander Wright"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Hospital Work Email"
            type="email"
            placeholder="a.wright@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="Chief Pharmacist">Chief Pharmacist</option>
                <option value="Staff Pharmacist">Staff Pharmacist</option>
                <option value="Supplier">Supplier</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <Input
              label="Department"
              placeholder="e.g. ICU Pharmacy"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role & Permissions Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Edit Role & Access Permissions"
          subtitle={`Update permissions and role credentials for ${editingUser.name}`}
        >
          <form onSubmit={handleSaveEditRole} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Staff Member
              </label>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center gap-3">
                <img
                  src={editingUser.avatar}
                  alt={editingUser.name}
                  className="w-9 h-9 rounded-lg object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{editingUser.name}</p>
                  <p className="text-[11px] text-slate-400">{editingUser.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Assigned Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="Chief Pharmacist">Chief Pharmacist</option>
                  <option value="Staff Pharmacist">Staff Pharmacist</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <Input
                label="Department Unit"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <Modal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          title="Delete User & Revoke Access"
          subtitle="Permanently remove user role assignment from system roster"
        >
          <div className="space-y-4 text-xs font-medium">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Confirm Access Revocation</p>
                <p className="text-xs mt-1">
                  Are you sure you want to delete <strong className="underline">{deletingUser.name}</strong> ({deletingUser.email})? They will lose all permissions and access to the portal immediately.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDeleteUser} leftIcon={<Trash2 className="w-4 h-4" />}>
                Delete User & Revoke Role
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

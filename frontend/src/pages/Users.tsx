import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, UserPlus, ShieldCheck, Mail, Phone, MoreVertical, Edit3 } from 'lucide-react';
import { MOCK_USERS } from '../services/mockData';
import { User, UserRole } from '../types/user';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';

export const Users: React.FC = () => {
  const [userList, setUserList] = useState<User[]>(MOCK_USERS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Staff Pharmacist');
  const [department, setDepartment] = useState('Pharmacy Services');

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
    setUserList((prev) => [newUser, ...prev]);
    toast.success(`Invitation email sent to ${email}`);
    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional User Roster
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
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-500/20 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="primary" dot>
                      <ShieldCheck className="w-3 h-3 mr-1 inline" /> {u.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">{u.department}</td>
                  <td className="p-4 text-slate-400">{u.lastActive}</td>
                  <td className="p-4">
                    <Badge variant={u.status === 'Active' ? 'success' : 'warning'}>{u.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
                <option value="Inventory Manager">Inventory Manager</option>
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
    </div>
  );
};

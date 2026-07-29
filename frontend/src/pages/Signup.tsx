import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cross, Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff Pharmacist');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'bg-danger-500' };
      case 2:
        return { score, label: 'Fair', color: 'bg-warning-500' };
      case 3:
        return { score, label: 'Good', color: 'bg-secondary-500' };
      case 4:
        return { score, label: 'Strong', color: 'bg-success-500' };
      default:
        return { score: 0, label: 'Weak', color: 'bg-danger-500' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await signup(name, email, role);
    setIsLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#090D16] text-slate-100 font-sans selection:bg-primary-500 overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800/80 bg-slate-950">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-glow-primary">
            <Cross className="w-6 h-6 font-bold" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Medi<span className="text-secondary-400">Stock</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Enterprise Access Request
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-950/80 border border-secondary-800 text-xs font-bold text-secondary-400 mb-4 shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> Seamless Institutional Onboarding
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Empower Your Medical Staff with Unified Stock Control
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Join thousands of clinical pharmacists, logistics managers, and healthcare administrators managing pharmaceuticals with zero downtime.
            </p>
          </motion.div>

          <div className="space-y-3 pt-2">
            {[
              'Role-Based Access Control (RBAC)',
              'Automated Expiry & Low Stock Alerts',
              'Multi-Warehouse Logistics & PO Creation',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <div className="w-5 h-5 rounded-full bg-success-500/20 text-success-400 flex items-center justify-center shrink-0">
                  ✓
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-900 pt-6">
          <span>© 2026 MediStock Platform</span>
          <span>Security Level: Tier-4 ISO 27001</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-[#090D16]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10 border border-slate-800/80 bg-slate-900/90 shadow-2xl relative z-10"
        >
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Create Staff Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Register new credentials to join your healthcare facility's inventory portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              floatingLabel
              label="Full Name & Title"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              floatingLabel
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Institutional Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-xs font-semibold text-slate-200 outline-none focus:border-primary-500"
              >
                <option value="Chief Pharmacist">Chief Pharmacist</option>
                <option value="Staff Pharmacist">Staff Pharmacist</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>

            <div className="space-y-2">
              <Input
                floatingLabel
                label="Create Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Password Strength:</span>
                    <span className={strength.color.replace('bg-', 'text-')}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all ${
                          strength.score >= step ? strength.color : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-4"
            >
              Create Staff Account
            </Button>
          </form>

          <p className="text-center text-xs font-medium text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

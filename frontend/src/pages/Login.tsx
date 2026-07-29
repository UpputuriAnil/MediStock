import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cross, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button as CustomButton } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('sarah.jenkins@medistock.health');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Password reset instructions sent to ${forgotEmail || email}`);
    setIsForgotModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#090D16] text-slate-100 font-sans selection:bg-primary-500 overflow-hidden">
      {/* Left Panel - Modern Medical Illustration & Enterprise Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800/80 bg-slate-950">
        {/* Ambient blurred glow blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-glow-primary">
            <Cross className="w-6 h-6 font-bold" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Medi<span className="text-secondary-400">Stock</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Enterprise Inventory Platform
            </span>
          </div>
        </div>

        {/* Middle Glass Cards & Graphic Stack */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/80 border border-primary-800 text-xs font-bold text-primary-400 mb-4 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> HIPAA & GxP Compliance Ready
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Precision Intelligence for Hospital & Pharmacy Logistics
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Automate cold-chain monitoring, predictive stock forecasting, and automated supplier replenishment with sub-second audit velocity.
            </p>
          </motion.div>

          {/* Floating Live Metric Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-2 text-success-400 text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" /> 99.98% Accuracy
              </div>
              <p className="text-xl font-extrabold text-white">1.4M+ Vials</p>
              <p className="text-[11px] text-slate-500">Tracked across 42 networks</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-2 text-secondary-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> Real-time Audit
              </div>
              <p className="text-xl font-extrabold text-white">Zero Losses</p>
              <p className="text-[11px] text-slate-500">Automated write-off prevention</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-900 pt-6">
          <span>© 2026 MediStock Health Technologies</span>
          <span>v2.4.0 (Enterprise Build)</span>
        </div>
      </div>

      {/* Right Panel - Login Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-[#090D16]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10 border border-slate-800/80 bg-slate-900/90 shadow-2xl relative z-10"
        >
          {/* Logo preview for mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-600 text-white">
              <Cross className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-white">MediStock</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Sign In to MediStock
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your official credentials to access the central inventory dashboard.
            </p>
          </div>

          {/* Social / Google Login */}
          <button
            type="button"
            onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/80 text-xs font-bold text-slate-200 transition-all duration-200 mb-6 shadow-sm group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
              OR EMAIL LOGIN
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              floatingLabel
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              floatingLabel
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-primary-600 focus:ring-primary-500"
                />
                <span>Remember this device</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <CustomButton
              type="submit"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Sign In to Dashboard
            </CustomButton>
          </form>

          <p className="text-center text-xs font-medium text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 font-bold hover:underline">
              Request Access
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter your registered work email address. We will send password reset instructions to your inbox.
          </p>

          <Input
            label="Work Email Address"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            placeholder="sarah.jenkins@medistock.health"
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit">
              Send Instructions
            </CustomButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

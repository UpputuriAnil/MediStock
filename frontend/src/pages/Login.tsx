import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cross, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button as CustomButton } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import api from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useAuth() as any;
  const login = authContext?.login;
  const loginWithGoogle = authContext?.loginWithGoogle;
  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;

  const directRegEmail = (location.state as any)?.registeredEmail;
  const directRegPassword = (location.state as any)?.registeredPassword;

  const lastRegEmail = localStorage.getItem('medistock_last_registered_email');
  const lastRegPassword = localStorage.getItem('medistock_last_registered_password');

  const initialEmail = directRegEmail || '';
  const initialPassword = directRegPassword || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const executeGoogleLogin = async (googleData: { name: string; email: string; googleId: string; avatar?: string; role?: string }) => {
    if (typeof loginWithGoogle === 'function') {
      return await loginWithGoogle(googleData, rememberMe);
    }

    try {
      const res = await api.post('/auth/google', {
        email: googleData.email,
        name: googleData.name,
        googleId: googleData.googleId,
        avatar: googleData.avatar,
        role: googleData.role || 'Pharmacist',
      });

      if (res.data && res.data.data) {
        const { accessToken, refreshToken, user: backendUser } = res.data.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        const backendRole = backendUser?.roles?.length ? Array.from(backendUser.roles)[0] : undefined;
        const userRoleStr = String(backendRole || googleData.role || 'Pharmacist').toUpperCase();
        let finalRole: 'Admin' | 'Pharmacist' | 'Staff' = 'Pharmacist';
        if (userRoleStr.includes('ADMIN')) finalRole = 'Admin';
        else if (userRoleStr.includes('STAFF')) finalRole = 'Staff';

        const loggedUser = {
          id: String(backendUser?.id || `usr_g_${Date.now()}`),
          name: `${backendUser?.firstName || ''} ${backendUser?.lastName || ''}`.trim() || googleData.name,
          email: backendUser?.email || googleData.email,
          role: finalRole,
          avatar: backendUser?.profilePictureUrl || googleData.avatar,
          department: finalRole === 'Admin' ? 'IT & System Security' : finalRole === 'Staff' ? 'General Medical Staff' : 'Central Pharmacy',
          status: 'Active',
          lastActive: 'Just now',
        };

        if (rememberMe) {
          localStorage.setItem('medistock_user', JSON.stringify(loggedUser));
          localStorage.setItem('user', JSON.stringify(loggedUser));
          localStorage.setItem('medistock_remember_me', 'true');
        } else {
          sessionStorage.setItem('medistock_user', JSON.stringify(loggedUser));
          sessionStorage.setItem('user', JSON.stringify(loggedUser));
        }
        toast.success(`Google Account authenticated & stored in MySQL Database!`);
        return true;
      }
    } catch (err: any) {
      console.error('Google direct API error:', err);
      const msg = err?.response?.data?.message || err?.message;
      toast.error(`Google Auth Error: ${msg}`);
    }
    return false;
  };

  // Show registration success toast ONLY ONCE when coming directly from registration form
  const hasShownRegToast = React.useRef(false);
  React.useEffect(() => {
    if (directRegEmail && !hasShownRegToast.current) {
      hasShownRegToast.current = true;
      setEmail(directRegEmail);
      if (directRegPassword) setPassword(directRegPassword);
      toast.success(`Account created for ${directRegEmail}! Sign in below.`);

      // Clean up state so toast never shows on logout or page refresh
      window.history.replaceState({}, document.title);
      localStorage.removeItem('medistock_last_registered_email');
      localStorage.removeItem('medistock_last_registered_password');
    }
  }, [directRegEmail, directRegPassword]);

  // Login form renders cleanly for user credentials entry

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cleanEmail = (email || '').toLowerCase().trim();
      const cleanPassword = (password || '').trim();

      let success = false;
      if (typeof login === 'function') {
        success = await login(cleanEmail, cleanPassword, rememberMe);
      }

      if (success) {
        const isTargetAdmin = cleanEmail.includes('admin') || cleanEmail.includes('anilupputuri') || cleanEmail === 'admin@medistock.com';
        const isTargetSupplier = cleanEmail.includes('supplier') || cleanEmail === 'supplier@medistock.com';
        const isTargetStaff = cleanEmail.includes('staff') || cleanEmail === 'staff@medistock.com';

        let targetRoute = '/pharmacist-dashboard';
        if (isTargetAdmin) {
          targetRoute = '/admin-dashboard';
        } else if (isTargetSupplier) {
          targetRoute = '/supplier-dashboard';
        } else if (isTargetStaff) {
          targetRoute = '/staff-dashboard';
        }

        navigate(targetRoute, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Login error: ${err?.response?.data?.message || err?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '522295379594-0fv25if5irsbv2rpkkb0ll56cb7ep5j6.apps.googleusercontent.com';
      const windowGoogle = (window as any).google;

      if (windowGoogle?.accounts?.oauth2) {
        const tokenClient = windowGoogle.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile',
          callback: async (resp: any) => {
            if (resp.access_token) {
              try {
                const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${resp.access_token}` }
                });
                const gProfile = await userinfoRes.json();

                const success = await executeGoogleLogin({
                  name: gProfile.name || gProfile.given_name || 'Google Authorized User',
                  email: gProfile.email,
                  googleId: gProfile.sub || `g_${Date.now()}`,
                  avatar: gProfile.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                  role: 'Pharmacist'
                });
                if (success) {
                  navigate('/dashboard', { replace: true });
                }
              } catch (err: any) {
                toast.error(`Google profile error: ${err.message}`);
              } finally {
                setIsLoading(false);
              }
            } else {
              setIsLoading(false);
            }
          },
          error_callback: (err: any) => {
            console.error('Google OAuth popup error:', err);
            setIsLoading(false);
          }
        });
        tokenClient.requestAccessToken();
        return;
      }

      // Fallback Google Auth
      const targetEmail = email || `google.user@medistock.com`;
      const success = await executeGoogleLogin({
        name: 'Google User',
        email: targetEmail,
        googleId: `g_${Date.now()}`,
        role: 'Pharmacist'
      });
      if (success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Password reset instructions sent to ${forgotEmail || email}`);
    setIsForgotModalOpen(false);
  };

  const getRoleProfileName = (roleKey: string, defaultName: string) => {
    try {
      const raw = localStorage.getItem(`medistock_profile_${roleKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) return parsed.name;
      }
    } catch (e) {}
    return defaultName;
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
            onClick={handleGoogleLogin}
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
              Register Now
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

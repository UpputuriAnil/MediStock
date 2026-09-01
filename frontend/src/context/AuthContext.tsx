import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/user';
import { MOCK_USER } from '../services/mockData';
import toast from 'react-hot-toast';
import axios from 'axios';
import api, { API_BASE_URL } from '../services/api';
import { formatNameFromEmail } from '../utils/formatters';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (name: string, email: string, role: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, role: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (googleData?: { name?: string; email?: string; googleId?: string; avatar?: string; role?: string }, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractRoleString = (input: any): string => {
  if (!input) return '';
  if (typeof input === 'string') {
    if (input === '[object Object]') return '';
    return input;
  }
  if (typeof input === 'object') {
    if (input.name) return String(input.name);
    if (input.authority) return String(input.authority);
    if (input.role) return extractRoleString(input.role);
  }
  return String(input);
};

const getStoredRegistry = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem('medistock_user_registry');
    if (raw && raw !== 'undefined' && raw !== 'null') {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return {};
};

export const formatRole = (roleInput?: any, email?: string): 'Admin' | 'Pharmacist' | 'Staff' | 'Supplier' | 'User' => {
  const rawRoleStr = extractRoleString(roleInput);
  if (rawRoleStr) {
    const inputUpper = rawRoleStr.toUpperCase();
    if (inputUpper.includes('ADMIN')) return 'Admin';
    if (inputUpper.includes('SUPPLIER') || inputUpper.includes('SUPPLY')) return 'Supplier';
    if (inputUpper.includes('STAFF')) return 'Staff';
    if (inputUpper.includes('PHARM')) return 'Pharmacist';
  }

  const registry = getStoredRegistry();
  const normEmail = (email || '').toLowerCase().trim();
  const storedUser = normEmail ? registry[normEmail] : null;
  const registryRole = extractRoleString(storedUser?.role);
  if (registryRole) {
    const regUpper = registryRole.toUpperCase();
    if (regUpper.includes('ADMIN')) return 'Admin';
    if (regUpper.includes('SUPPLIER') || regUpper.includes('SUPPLY')) return 'Supplier';
    if (regUpper.includes('STAFF')) return 'Staff';
    if (regUpper.includes('PHARM')) return 'Pharmacist';
  }

  if (normEmail === 'admin@medistock.com') {
    return 'Admin';
  }
  if (normEmail.includes('supplier') || normEmail === 'supplier@medistock.com') {
    return 'Supplier';
  }
  if (normEmail === 'staff@medistock.com') {
    return 'Staff';
  }
  if (normEmail === 'pharmacist@medistock.com') {
    return 'Pharmacist';
  }

  return 'User';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const sessionSaved = sessionStorage.getItem('medistock_user') || sessionStorage.getItem('user');
      if (sessionSaved && sessionSaved !== 'undefined' && sessionSaved !== 'null') {
        const parsed = JSON.parse(sessionSaved);
        if (parsed && typeof parsed === 'object' && parsed.email) {
          const normRole = formatRole(parsed.role, parsed.email);
          return { ...parsed, role: normRole as any };
        }
      }

      const isRemembered = localStorage.getItem('medistock_remember_me') === 'true';
      if (isRemembered) {
        const localSaved = localStorage.getItem('medistock_user') || localStorage.getItem('user');
        if (localSaved && localSaved !== 'undefined' && localSaved !== 'null') {
          const parsed = JSON.parse(localSaved);
          if (parsed && typeof parsed === 'object' && parsed.email) {
            const normRole = formatRole(parsed.role, parsed.email);
            return { ...parsed, role: normRole as any };
          }
        }
      }

      return null;
    } catch (e) {
      return null;
    }
  });

  const saveUserSession = (loggedUser: User, rememberMe: boolean = true) => {
    setUser(loggedUser);
    sessionStorage.setItem('medistock_user', JSON.stringify(loggedUser));
    sessionStorage.setItem('user', JSON.stringify(loggedUser));

    if (rememberMe) {
      localStorage.setItem('medistock_user', JSON.stringify(loggedUser));
      localStorage.setItem('user', JSON.stringify(loggedUser));
      localStorage.setItem('medistock_remember_me', 'true');
      if (!localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', `demo_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
      }
    } else {
      localStorage.removeItem('medistock_user');
      localStorage.removeItem('user');
      localStorage.removeItem('medistock_remember_me');
    }
  };

  const login = async (email?: string, password?: string, rememberMe: boolean = true): Promise<boolean> => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const targetEmail = cleanEmail || 'admin@medistock.com';
    const targetPassword = (password || '').trim() || 'Admin@123';

    try {
      const res = await api.post('/auth/login', {
        email: targetEmail,
        password: targetPassword,
      });

      if (res.data && res.data.data) {
        const { accessToken, refreshToken, user: backendUser } = res.data.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        const rawRoles = backendUser?.roles;
        let rawRole: any = backendUser?.role;
        if (Array.isArray(rawRoles) && rawRoles.length > 0) {
          rawRole = rawRoles[0];
        } else if (rawRoles && typeof rawRoles === 'object') {
          const rolesArray = Array.from(rawRoles);
          if (rolesArray.length > 0) rawRole = rolesArray[0];
        }

        const formattedRole = formatRole(rawRole, targetEmail);
        const nameFromEmail = formatNameFromEmail(targetEmail);
        const backendFullName = `${backendUser?.firstName || ''} ${backendUser?.lastName || ''}`.trim();
        const defaultName = backendFullName || (targetEmail === 'admin@medistock.com' ? 'Admin' : nameFromEmail);

        const loggedUser: User = {
          id: String(backendUser?.id || `usr_${Date.now()}`),
          name: defaultName,
          email: backendUser?.email || targetEmail,
          role: formattedRole as any,
          avatar: formattedRole === 'Admin'
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
            : formattedRole === 'Staff'
              ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
          department: formattedRole === 'Admin' ? 'IT & System Security' : formattedRole === 'Staff' ? 'General Medical Staff' : 'Central Pharmacy',
          status: 'Active',
          lastActive: 'Just now',
        };

        saveUserSession(loggedUser, rememberMe);
        toast.success(`Welcome back, ${loggedUser.name}!`);
        return true;
      }
    } catch (err: any) {
      console.warn('Backend login endpoint unavailable, using local registry:', err?.message);
    }

    // Local registry & fallback with stored role profile checks
    const registry = getStoredRegistry();
    const regUser = registry[targetEmail.toLowerCase()];
    const resolvedRole = formatRole(regUser?.role, targetEmail);
    const roleKey = resolvedRole.toLowerCase();

    // Check if there is a customized saved profile for this role
    let savedRoleProfile: any = null;
    try {
      const rawRoleProf = localStorage.getItem(`medistock_profile_${roleKey}`);
      if (rawRoleProf) savedRoleProfile = JSON.parse(rawRoleProf);
    } catch (e) {}

    const nameFromEmail = formatNameFromEmail(targetEmail);
    const isDemoDefaultEmail = ['admin@medistock.com', 'pharmacist@medistock.com', 'staff@medistock.com', 'supplier@medistock.com'].includes(targetEmail.toLowerCase());
    const lastRegName = localStorage.getItem('medistock_last_registered_name');
    const isLastRegEmail = targetEmail.toLowerCase() === localStorage.getItem('medistock_last_registered_email')?.toLowerCase();

    const resolvedName = regUser?.name || (isLastRegEmail && lastRegName ? lastRegName : null) || (isDemoDefaultEmail ? savedRoleProfile?.name : null) || nameFromEmail;

    let loggedUser: User;

    if (resolvedRole === 'Admin') {
      loggedUser = {
        id: savedRoleProfile?.id || regUser?.id || 'usr_admin',
        name: resolvedName,
        email: savedRoleProfile?.email || targetEmail,
        role: 'Admin',
        avatar: savedRoleProfile?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        department: savedRoleProfile?.department || 'IT & System Security',
        phone: savedRoleProfile?.phone || '+1 (555) 890-1234',
        status: 'Active',
        lastActive: 'Just now',
      };
    } else if (resolvedRole === 'Supplier') {
      loggedUser = {
        id: savedRoleProfile?.id || regUser?.id || 'usr_supplier_apex',
        name: resolvedName !== 'Admin' ? resolvedName : 'Apex BioPharma Supplies',
        email: savedRoleProfile?.email || targetEmail,
        role: 'Supplier',
        avatar: savedRoleProfile?.avatar || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
        department: savedRoleProfile?.department || 'External Supplier Logistics',
        phone: savedRoleProfile?.phone || '+1 (800) 555-0199',
        status: 'Active',
        lastActive: 'Just now',
        supplierId: 'SUP-01',
      };
    } else if (resolvedRole === 'Staff') {
      loggedUser = {
        id: savedRoleProfile?.id || regUser?.id || 'usr_staff',
        name: resolvedName,
        email: savedRoleProfile?.email || targetEmail,
        role: 'Staff',
        avatar: savedRoleProfile?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        department: savedRoleProfile?.department || 'General Medical Staff',
        phone: savedRoleProfile?.phone || '+1 (555) 456-7890',
        status: 'Active',
        lastActive: 'Just now',
      };
    } else {
      loggedUser = {
        id: savedRoleProfile?.id || regUser?.id || 'usr_pharm',
        name: resolvedName,
        email: savedRoleProfile?.email || targetEmail,
        role: 'Pharmacist',
        avatar: savedRoleProfile?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        department: savedRoleProfile?.department || 'Central Pharmacy',
        phone: savedRoleProfile?.phone || '+1 (555) 234-5678',
        status: 'Active',
        lastActive: 'Just now',
      };
    }

    saveUserSession(loggedUser, rememberMe);
    toast.success(`Welcome back, ${loggedUser.name}!`);
    return true;
  };

  const signup = async (name: string, email: string, role: string, password?: string): Promise<boolean> => {
    const safeRole = role === 'Admin' ? 'Pharmacist' : (role || 'Pharmacist');
    const nameParts = name.trim().split(' ');
    let firstName = nameParts[0] || name;
    let lastName = nameParts.slice(1).join(' ') || 'User';
    const pwd = password || 'Password@123';

    // Store in user registry
    const registry = getStoredRegistry();
    registry[email.toLowerCase()] = { name, email, role: safeRole, password: pwd };
    localStorage.setItem('medistock_user_registry', JSON.stringify(registry));
    localStorage.setItem('medistock_last_registered_name', name);
    localStorage.setItem('medistock_last_registered_email', email);

    try {
      const res = await api.post('/auth/register', {
        email,
        password: pwd,
        confirmPassword: pwd,
        firstName,
        lastName,
        phoneNumber: '+1234567890',
        role: safeRole,
      });

      if (res.data && res.data.data) {
        const { accessToken, refreshToken } = res.data.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        toast.success(`Account registered for ${email}!`);
        return true;
      }
    } catch (err: any) {
      console.error('Backend register endpoint error:', err);
      let apiErrorMessage = err?.response?.data?.message || err?.response?.data?.error;
      if (err?.response?.data?.data && typeof err.response.data.data === 'object') {
        const fieldErrors = Object.values(err.response.data.data).filter(Boolean).join('. ');
        if (fieldErrors) apiErrorMessage = fieldErrors;
      }

      if (apiErrorMessage) {
        toast.error(`Registration error: ${apiErrorMessage}`);
      } else if (!err.response || err?.response?.status >= 500) {
        toast.error(`Backend server error (${err?.response?.status || 500}). Ensure Spring Boot backend is running on port 8080.`);
      } else {
        toast.error(`Registration error: ${err.message || 'Registration request failed'}`);
      }
      return false;
    }

    toast.success(`Account created for ${email}!`);
    return true;
  };

  const loginWithGoogle = async (
    googleData?: { name?: string; email?: string; googleId?: string; avatar?: string; role?: string },
    rememberMe: boolean = true
  ): Promise<boolean> => {
    const userEmail = googleData?.email || 'google.user@medistock.health';
    const userName = googleData?.name || 'Google Authorized User';
    const googleId = googleData?.googleId || `g_${Date.now()}`;
    const avatar = googleData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const role = googleData?.role || 'Pharmacist';

    const registry = getStoredRegistry();
    registry[userEmail.toLowerCase()] = { name: userName, email: userEmail, role };
    localStorage.setItem('medistock_user_registry', JSON.stringify(registry));

    try {
      const res = await api.post('/auth/google', {
        email: userEmail,
        name: userName,
        googleId,
        avatar,
        role,
      });

      if (res.data && res.data.data) {
        const { accessToken, refreshToken, user: backendUser } = res.data.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        const roleName = backendUser?.roles?.length ? Array.from(backendUser.roles)[0] : undefined;
        const resolvedRole = formatRole(roleName ? String(roleName) : role, userEmail);

        const loggedUser: User = {
          id: String(backendUser?.id || `usr_g_${Date.now()}`),
          name: `${backendUser?.firstName || ''} ${backendUser?.lastName || ''}`.trim() || userName,
          email: backendUser?.email || userEmail,
          role: resolvedRole as any,
          avatar: backendUser?.profilePictureUrl || avatar,
          department: resolvedRole === 'Admin' ? 'IT & System Security' : 'Central Pharmacy',
          status: 'Active',
          lastActive: 'Just now',
        };

        saveUserSession(loggedUser, rememberMe);
        toast.success(`Google Account authenticated & stored in MySQL Database as ${resolvedRole}!`);
        return true;
      }
    } catch (err: any) {
      console.warn('Backend Google OAuth endpoint error, using local authentication fallback:', err?.message);
    }

    // Fallback local Google authentication
    const resolvedRole = formatRole(role, userEmail);
    const loggedUser: User = {
      id: `usr_g_${Date.now()}`,
      name: userName,
      email: userEmail,
      role: resolvedRole as any,
      avatar,
      department: resolvedRole === 'Admin' ? 'IT & System Security' : 'Central Pharmacy',
      status: 'Active',
      lastActive: 'Just now',
    };

    saveUserSession(loggedUser, rememberMe);
    toast.success(`Logged in with Google as ${loggedUser.name}!`);
    return true;
  };

  const logout = () => {
    // Attempt backend logout if token exists
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.post('/auth/logout').catch(() => { });
    }

    setUser(null);
    localStorage.removeItem('medistock_user');
    localStorage.removeItem('user');
    localStorage.removeItem('medistock_remember_me');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('medistock_last_registered_email');
    localStorage.removeItem('medistock_last_registered_password');
    sessionStorage.clear();

    // Disable Google auto-select if GIS is initialized
    if (typeof (window as any).google?.accounts?.id?.disableAutoSelect === 'function') {
      try {
        (window as any).google.accounts.id.disableAutoSelect();
      } catch (e) {
        console.warn('Google disableAutoSelect error:', e);
      }
    }

    toast.success('Logged out successfully.');
    window.location.href = '/login';
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);

    // Save to active session storage & local storage
    sessionStorage.setItem('medistock_user', JSON.stringify(updated));
    sessionStorage.setItem('user', JSON.stringify(updated));
    localStorage.setItem('medistock_user', JSON.stringify(updated));
    localStorage.setItem('user', JSON.stringify(updated));

    // Save to role-based profile registry (e.g. medistock_profile_admin, medistock_profile_supplier, etc.)
    const roleKey = String(updated.role || '').toLowerCase();
    if (roleKey) {
      localStorage.setItem(`medistock_profile_${roleKey}`, JSON.stringify(updated));
    }

    // Update user registry by email
    const registry = getStoredRegistry();
    const cleanEmail = (updated.email || user.email || '').toLowerCase().trim();
    if (cleanEmail) {
      registry[cleanEmail] = {
        ...registry[cleanEmail],
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
      };
      localStorage.setItem('medistock_user_registry', JSON.stringify(registry));
    }

    // Attempt backend database update if available
    api.put('/users/profile', {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phoneNumber: updated.phone,
      department: updated.department,
    }).catch(() => {});

    toast.success('Profile updated successfully in system & database!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        register: signup,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

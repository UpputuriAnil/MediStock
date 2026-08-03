import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/user';
import { MOCK_USER } from '../services/mockData';
import toast from 'react-hot-toast';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, role: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, role: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (googleData?: { name?: string; email?: string; googleId?: string; avatar?: string; role?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('medistock_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const formatRole = (roleInput?: string, email?: string): 'Admin' | 'Pharmacist' | 'Staff' => {
    if (roleInput) {
      const inputUpper = roleInput.toUpperCase();
      if (inputUpper.includes('ADMIN')) return 'Admin';
      if (inputUpper.includes('STAFF')) return 'Staff';
      if (inputUpper.includes('PHARM')) return 'Pharmacist';
    }

    const registry = JSON.parse(localStorage.getItem('medistock_user_registry') || '{}');
    const storedUser = email ? registry[email.toLowerCase()] : null;
    const effectiveRole = storedUser?.role || '';

    if (effectiveRole) {
      const effUpper = effectiveRole.toUpperCase();
      if (effUpper.includes('ADMIN')) return 'Admin';
      if (effUpper.includes('STAFF')) return 'Staff';
      if (effUpper.includes('PHARM')) return 'Pharmacist';
    }

    if (email === 'admin@medistock.com') return 'Admin';
    if (email === 'staff@medistock.com') return 'Staff';
    return 'Pharmacist';
  };

  const login = async (email?: string, password?: string): Promise<boolean> => {
    const targetEmail = email || 'pharmacist@medistock.com';
    const targetPassword = password || 'Pharmacist@123';

    try {
      const res = await axios.post('/api/auth/login', {
        email: targetEmail,
        password: targetPassword,
      });

      if (res.data && res.data.data) {
        const { accessToken, refreshToken, user: backendUser } = res.data.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        const roleName = backendUser?.roles?.length ? Array.from(backendUser.roles)[0] : undefined;
        const formattedRole = formatRole(roleName ? String(roleName) : undefined, targetEmail);

        const loggedUser: User = {
          id: String(backendUser?.id || `usr_${Date.now()}`),
          name: `${backendUser?.firstName || 'User'} ${backendUser?.lastName || ''}`.trim(),
          email: backendUser?.email || targetEmail,
          role: formattedRole as any,
          avatar: formattedRole === 'Admin'
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
          department: formattedRole === 'Admin' ? 'System IT' : 'Central Pharmacy',
          status: 'Active',
          lastActive: 'Just now',
        };

        setUser(loggedUser);
        localStorage.setItem('medistock_user', JSON.stringify(loggedUser));
        toast.success(`Welcome back, ${loggedUser.name}!`);
        return true;
      }
    } catch (err: any) {
      console.warn('Backend login endpoint unavailable, using local registry:', err?.message);
    }

    // Local registry & fallback
    const registry = JSON.parse(localStorage.getItem('medistock_user_registry') || '{}');
    const regUser = registry[targetEmail.toLowerCase()];
    const resolvedRole = formatRole(regUser?.role, targetEmail);

    let loggedUser: User;

    if (targetEmail === 'admin@medistock.com' || resolvedRole === 'Admin') {
      loggedUser = {
        id: regUser?.id || 'usr_admin',
        name: regUser?.name || 'System Administrator',
        email: targetEmail,
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        department: 'IT & System Security',
        status: 'Active',
        lastActive: 'Just now',
      };
    } else if (targetEmail === 'pharmacist@medistock.com' || resolvedRole === 'Pharmacist') {
      loggedUser = {
        id: regUser?.id || 'usr_pharm',
        name: regUser?.name || 'John Doe',
        email: targetEmail,
        role: 'Pharmacist',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        department: 'Central Pharmacy',
        status: 'Active',
        lastActive: 'Just now',
      };
    } else {
      loggedUser = {
        id: regUser?.id || 'usr_staff',
        name: regUser?.name || targetEmail.split('@')[0].replace('.', ' '),
        email: targetEmail,
        role: resolvedRole as any,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        department: 'Pharmacy Services',
        status: 'Active',
        lastActive: 'Just now',
      };
    }

    setUser(loggedUser);
    localStorage.setItem('medistock_user', JSON.stringify(loggedUser));
    toast.success(`Welcome back, ${loggedUser.name}!`);
    return true;
  };

  const signup = async (name: string, email: string, role: string, password?: string): Promise<boolean> => {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || 'User';
    const pwd = password || 'Password@123';

    // Store in user registry
    const registry = JSON.parse(localStorage.getItem('medistock_user_registry') || '{}');
    registry[email.toLowerCase()] = { name, email, role, password: pwd };
    localStorage.setItem('medistock_user_registry', JSON.stringify(registry));

    try {
      const res = await axios.post('/api/auth/register', {
        email,
        password: pwd,
        confirmPassword: pwd,
        firstName,
        lastName,
        phoneNumber: '+1234567890',
        role,
      });

      if (res.data && res.data.data) {
        toast.success(`Account registered in MySQL Database for ${email}!`);
        return true;
      }
    } catch (err: any) {
      console.error('Backend register endpoint error:', err);
      const apiErrorMessage = err?.response?.data?.message || err?.response?.data?.error;

      if (apiErrorMessage) {
        toast.error(`Database Registration Error: ${apiErrorMessage}`);
      } else if (!err.response) {
        toast.error('Backend server is not running on port 8080. Start Spring Boot to store accounts in MySQL!');
      } else {
        toast.error(`Failed to register account in MySQL Database: ${err.message}`);
      }
      return false;
    }

    toast.success(`Account created for ${email}!`);
    return true;
  };

  const loginWithGoogle = async (googleData?: { name?: string; email?: string; googleId?: string; avatar?: string; role?: string }): Promise<boolean> => {
    const userEmail = googleData?.email || 'google.user@medistock.health';
    const userName = googleData?.name || 'Google Authorized User';
    const googleId = googleData?.googleId || `g_${Date.now()}`;
    const avatar = googleData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const role = googleData?.role || 'Admin';

    const registry = JSON.parse(localStorage.getItem('medistock_user_registry') || '{}');
    registry[userEmail.toLowerCase()] = { name: userName, email: userEmail, role };
    localStorage.setItem('medistock_user_registry', JSON.stringify(registry));

    try {
      const res = await axios.post('/api/auth/google', {
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

        setUser(loggedUser);
        localStorage.setItem('medistock_user', JSON.stringify(loggedUser));
        toast.success(`Google Account authenticated & stored in MySQL Database as ${resolvedRole}!`);
        return true;
      }
    } catch (err: any) {
      console.error('Backend Google OAuth endpoint error:', err);
      const apiErrorMessage = err?.response?.data?.message || err?.response?.data?.error;
      if (apiErrorMessage) {
        toast.error(`Database Google Login Error: ${apiErrorMessage}`);
      } else if (!err.response) {
        toast.error('Backend server is not running on port 8080. Start Spring Boot to store accounts in MySQL!');
      } else {
        toast.error(`Failed to authenticate Google account in MySQL: ${err.message}`);
      }
      return false;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medistock_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('medistock_last_registered_email');
    localStorage.removeItem('medistock_last_registered_password');
    toast.success('Logged out successfully.');
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('medistock_user', JSON.stringify(updated));

    // Update registry
    const registry = JSON.parse(localStorage.getItem('medistock_user_registry') || '{}');
    if (registry[user.email.toLowerCase()]) {
      registry[user.email.toLowerCase()] = {
        ...registry[user.email.toLowerCase()],
        name: updated.name,
        role: updated.role,
      };
      localStorage.setItem('medistock_user_registry', JSON.stringify(registry));
    }

    toast.success('Profile updated successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || (!!localStorage.getItem('accessToken') && !!localStorage.getItem('medistock_user')),
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
forgotPassword,
  resetPassword,
      }}
    >
  { children }
    </AuthContext.Provider >
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/user';
import { MOCK_USER } from '../services/mockData';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, role: string) => Promise<boolean>;
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
        return MOCK_USER;
      }
    }
    return MOCK_USER; // Logged in by default, but allows login/logout transitions
  });

  const login = async (email?: string, password?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let loggedUser: User = {
          ...MOCK_USER,
          email: email || MOCK_USER.email,
        };

        // Match MySQL Workbench preset accounts
        if (email === 'admin@medistock.com') {
          loggedUser = {
            id: 'usr_admin',
            name: 'System Administrator',
            email: 'admin@medistock.com',
            role: 'Admin',
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
            department: 'IT & System Security',
            status: 'Active',
            lastActive: 'Just now',
          };
        } else if (email === 'pharmacist@medistock.com') {
          loggedUser = {
            id: 'usr_pharm',
            name: 'John Doe',
            email: 'pharmacist@medistock.com',
            role: 'Chief Pharmacist',
            avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
            department: 'Central Pharmacy',
            status: 'Active',
            lastActive: 'Just now',
          };
        } else if (email === 'staff@medistock.com') {
          loggedUser = {
            id: 'usr_staff',
            name: 'Jane Smith',
            email: 'staff@medistock.com',
            role: 'Staff Pharmacist',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            department: 'Outpatient Care',
            status: 'Active',
            lastActive: 'Just now',
          };
        }

        setUser(loggedUser);
        localStorage.setItem('medistock_user', JSON.stringify(loggedUser));
        toast.success(`Welcome back, ${loggedUser.name}!`);
        resolve(true);
      }, 500);
    });
  };

  const signup = async (name: string, email: string, role: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name,
          email,
          role: (role as any) || 'Staff Pharmacist',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          department: 'Pharmacy Services',
          status: 'Active',
          lastActive: 'Just now',
        };
        setUser(newUser);
        localStorage.setItem('medistock_user', JSON.stringify(newUser));
        toast.success(`Account created! Welcome to MediStock, ${name}.`);
        resolve(true);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medistock_user');
    toast.success('Logged out successfully');
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('medistock_user', JSON.stringify(updated));
    toast.success('Profile updated');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

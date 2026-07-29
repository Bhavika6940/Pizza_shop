'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone?: string;
  address?: string;
}

interface AuthContextType {
  customerUser: UserProfile | null;
  adminUser: UserProfile | null;
  isCustomerLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  loginCustomer: (email: string, pass: string) => Promise<UserProfile>;
  loginAdmin: (email: string, pass: string) => Promise<UserProfile>;
  registerCustomerAccount: (data: { email: string; password: string; name: string; phone?: string; address?: string }) => Promise<UserProfile>;
  registerAdminAccount: (data: { email: string; password: string; name: string; phone?: string; address?: string }) => Promise<UserProfile>;
  logoutCustomer: () => void;
  logoutAdmin: () => void;
  quickDemoCustomerLogin: () => Promise<UserProfile>;
  quickDemoAdminLogin: () => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerUser, setCustomerUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);

  // Restore sessions from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCust = localStorage.getItem('slicecraft_customer_user');
      const storedAdmin = localStorage.getItem('slicecraft_admin_user');
      if (storedCust) {
        try { setCustomerUser(JSON.parse(storedCust)); } catch {}
      }
      if (storedAdmin) {
        try { setAdminUser(JSON.parse(storedAdmin)); } catch {}
      }
    }
  }, []);

  const loginCustomer = useCallback(async (email: string, pass: string) => {
    const res = await loginUser({ email, password: pass, role: 'CUSTOMER' });
    setCustomerUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_customer_user', JSON.stringify(res.user));
    }
    return res.user;
  }, []);

  const loginAdmin = useCallback(async (email: string, pass: string) => {
    const res = await loginUser({ email, password: pass, role: 'ADMIN' });
    setAdminUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_admin_user', JSON.stringify(res.user));
    }
    return res.user;
  }, []);

  const registerCustomerAccount = useCallback(async (data: { email: string; password: string; name: string; phone?: string; address?: string }) => {
    const res = await registerUser({ ...data, role: 'CUSTOMER' });
    setCustomerUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_customer_user', JSON.stringify(res.user));
    }
    return res.user;
  }, []);

  const registerAdminAccount = useCallback(async (data: { email: string; password: string; name: string; phone?: string; address?: string }) => {
    const res = await registerUser({ ...data, role: 'ADMIN' });
    setAdminUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_admin_user', JSON.stringify(res.user));
    }
    return res.user;
  }, []);

  const logoutCustomer = useCallback(() => {
    setCustomerUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('slicecraft_customer_user');
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('slicecraft_admin_user');
    }
  }, []);

  const quickDemoCustomerLogin = useCallback(async () => {
    return await loginCustomer('customer@slicecraft.com', 'customer123');
  }, [loginCustomer]);

  const quickDemoAdminLogin = useCallback(async () => {
    return await loginAdmin('admin@slicecraft.com', 'admin123');
  }, [loginAdmin]);

  return (
    <AuthContext.Provider
      value={{
        customerUser,
        adminUser,
        isCustomerLoggedIn: !!customerUser,
        isAdminLoggedIn: !!adminUser,
        loginCustomer,
        loginAdmin,
        registerCustomerAccount,
        registerAdminAccount,
        logoutCustomer,
        logoutAdmin,
        quickDemoCustomerLogin,
        quickDemoAdminLogin,
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

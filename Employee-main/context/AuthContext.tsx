import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { getStoredUser, login as loginService, logout as logoutService } from '../services/authService';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (payload: { identifier: string; otp: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      setUser(existing);
    }
    setLoading(false);
  }, []);

  const login = async (payload: { identifier: string; otp: string }) => {
    const profile = await loginService(payload);
    setUser(profile);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


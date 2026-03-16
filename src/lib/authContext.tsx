import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile } from './mockData';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  login: (profile: Profile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);

  const login = (profile: Profile) => setUser(profile);
  const logout = () => setUser(null);
  const updateProfile = (updates: Partial<Profile>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { User } from '../types';
import { storage } from '../utils/storage';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedUser = storage.getUser();
    const storedToken = storage.getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    storage.setToken(token);
    storage.setUser(userData);
    setUser(userData);
  };

  const logout = () => {
    storage.clear();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    storage.setUser(userData);
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


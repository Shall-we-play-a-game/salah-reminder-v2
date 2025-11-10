import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useAuth() {
  const [user, setUser] = useLocalStorage('user', null);
  const [loading, setLoading] = useState(false);

  const login = async (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };
}
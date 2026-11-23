import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('burgundy_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Re-hydrate session from token on initial app mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('burgundy_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data && res.data.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.warn('[Auth] Session restoration failed:', err?.response?.data?.message || err.message);
          localStorage.removeItem('burgundy_token');
          localStorage.removeItem('burgundy_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await authApi.login({ email, password });
      const { data } = response.data;
      
      setUser({ _id: data._id, name: data.name, email: data.email });
      setToken(data.token);
      
      localStorage.setItem('burgundy_token', data.token);
      localStorage.setItem('burgundy_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const response = await authApi.register({ name, email, password });
      const { data } = response.data;
      
      setUser({ _id: data._id, name: data.name, email: data.email });
      setToken(data.token);
      
      localStorage.setItem('burgundy_token', data.token);
      localStorage.setItem('burgundy_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('burgundy_token');
    localStorage.removeItem('burgundy_user');
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  const clearError = () => setAuthError(null);

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

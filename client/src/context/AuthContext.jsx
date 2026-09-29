import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.data.user);
      setPermissions(response.data.data.permissions || []);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user, permissions } = response.data.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    setPermissions(permissions || []);
    return response;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setPermissions([]);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, permissions, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

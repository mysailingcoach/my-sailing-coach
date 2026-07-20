import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Apply token to axios on mount and whenever it changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parse errors
        }
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = useCallback(async (email, password) => {
    const response = await axios.post(getApiUrl('/auth/login'), { email, password });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const response = await axios.post(getApiUrl('/auth/signup'), { name, email, password });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, loading, login, signup, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

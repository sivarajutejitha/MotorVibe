/**
 * Authentication Context Provider
 * Manages user login state, JWT persistence, profile, and role privileges.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('motorvibe_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out.');
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  async function login(email, password) {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('motorvibe_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed.');
  }

  async function signup(userData) {
    const res = await api.signup(userData);
    if (res.success && res.token) {
      localStorage.setItem('motorvibe_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed.');
  }

  function logout() {
    localStorage.removeItem('motorvibe_token');
    setToken(null);
    setUser(null);
    api.logout().catch(() => {});
  }

  function updateUser(updatedData) {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        register: signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

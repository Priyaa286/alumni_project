import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as loginApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated && parsed.user) {
          return {
            isAuthenticated: true,
            user: parsed.user,
            token: parsed.token || `demo-token-${parsed.user.role}`,
          };
        }
      } catch (e) {
        console.error('Failed to parse saved authentication state:', e);
        localStorage.removeItem('auth_user');
      }
    }
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // Demo fallback credentials
    const DEMO_FALLBACK = [
      { email: 'admin@nec.edu', password: 'admin123', role: 'admin', name: 'NEC Admin' },
      { email: 'user@nec.edu', password: 'user123', role: 'user', name: 'NEC Nominator' }
    ];

    try {
      const res = await loginApi(email, password);
      if (res.success && res.user) {
        const newState = {
          isAuthenticated: true,
          user: res.user,
          token: res.token || `demo-token-${res.user.role}`,
        };
        setAuthState(newState);
        localStorage.setItem('auth_user', JSON.stringify(newState));
        return { success: true, user: res.user };
      } else {
        return { success: false, message: res.message || 'Invalid email or password' };
      }
    } catch (err) {
      console.warn('Backend API login failed or unreachable, checking offline demo fallback:', err);
      
      // Fallback verification for demo credentials when backend is down
      const match = DEMO_FALLBACK.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === password
      );

      if (match) {
        const newState = {
          isAuthenticated: true,
          user: { email: match.email, role: match.role, name: match.name },
          token: `demo-token-${match.role}`,
        };
        setAuthState(newState);
        localStorage.setItem('auth_user', JSON.stringify(newState));
        return { success: true, user: newState.user };
      }

      const msg = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        token: authState.token,
        loading,
        login,
        logout,
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

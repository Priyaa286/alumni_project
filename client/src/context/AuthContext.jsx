import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendOTP as sendOtpApi, verifyOTP as verifyOtpApi, googleAuthUser as googleAuthApi, localDevLogin as localDevLoginApi } from '../services/api';
import { auth, googleProvider, signInWithPopup } from '../config/firebase';

const AuthContext = createContext(null);

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // Keep a signed-in session for 7 days.

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated && parsed.user && typeof parsed.token === 'string' && parsed.token.split('.').length === 2) {
          // Check whether the saved session has expired.
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_user');
          } else {
            return {
              isAuthenticated: true,
              user: { ...parsed.user, role: parsed.user.role || 'user' },
              token: parsed.token || null,
              expiresAt: parsed.expiresAt || (Date.now() + SESSION_TTL_MS),
            };
          }
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
      expiresAt: null,
    };
  });

  const [loading, setLoading] = useState(false);

  // Auto logout when the saved session expires.
  useEffect(() => {
    if (authState.isAuthenticated && authState.expiresAt) {
      const timeRemaining = authState.expiresAt - Date.now();
      if (timeRemaining <= 0) {
        logout();
      } else {
        const timer = setTimeout(() => {
          logout();
        }, timeRemaining);
        return () => clearTimeout(timer);
      }
    }
  }, [authState.isAuthenticated, authState.expiresAt]);

  // Helper to persist auth session
  const saveAuthSession = (user, token) => {
    const updatedUser = { ...user, role: user.role || 'user' };
    const expiresAt = Date.now() + SESSION_TTL_MS;

    const newState = {
      isAuthenticated: true,
      user: updatedUser,
      token: token || null,
      expiresAt,
    };
    setAuthState(newState);
    localStorage.setItem('auth_user', JSON.stringify(newState));
  };

  /**
   * Request 6-Digit Email OTP
   */
  const requestOtp = async (email) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await sendOtpApi(cleanEmail);
      return res;
    } catch (err) {
      console.warn('Backend send OTP error:', err);
      const msg = err.response?.data?.message || 'Failed to send verification code. Please make sure the backend server is running.';
      return {
        success: false,
        message: msg,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify 6-Digit Email OTP Code
   */
  const verifyOtpCode = async (email, otpCode) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const inputOtp = otpCode.trim();

    try {
      const res = await verifyOtpApi(cleanEmail, inputOtp);
      if (res.success) {
        const userObj = res.user || {
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'user',
        };
        saveAuthSession(userObj, res.token);
        return { success: true, user: userObj };
      } else {
        return { success: false, message: res.message || 'Verification failed.' };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired verification code.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Production Single Sign-On (SSO) using Firebase Auth
   */
  const loginWithFirebaseSSO = async () => {
    setLoading(true);

    try {
      if (!auth || !googleProvider) {
        return {
          success: false,
          message: 'Firebase SSO is not configured. Please ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID are set in client/.env.',
        };
      }

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      const response = await googleAuthApi({
        idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });

      if (!response.success || !response.user || !response.token) {
        return { success: false, message: response.message || 'Firebase Single Sign-On verification failed.' };
      }

      if (response.user.role !== 'admin') {
        return {
          success: false,
          isAdminDenied: true,
          message: 'You do not have administrative access. Alumni can fill out and submit nominations directly without logging in.',
          user: response.user,
        };
      }

      saveAuthSession(response.user, response.token);
      return { success: true, user: response.user };
    } catch (err) {
      console.error('Firebase SSO login error:', err);
      // Handle popup closed by user gracefully
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Sign-in popup was closed before completing SSO.' };
      }
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Firebase Single Sign-On encountered an issue.',
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = loginWithFirebaseSSO;

  const loginLocally = async (email) => {
    setLoading(true);
    try {
      const response = await localDevLoginApi(email.trim().toLowerCase());
      if (!response.success || !response.user || !response.token) {
        return { success: false, message: response.message || 'Local sign-in failed.' };
      }
      saveAuthSession(response.user, response.token);
      return { success: true, user: response.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Local sign-in is disabled. Set LOCAL_DEV_AUTH=true in backend/.env and restart the backend.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout User / Admin
   */
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
        requestOtp,
        verifyOtpCode,
        loginWithFirebaseSSO,
        loginWithGoogle,
        loginLocally,
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

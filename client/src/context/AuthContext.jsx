import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendOTP as sendOtpApi, verifyOTP as verifyOtpApi, googleAuthUser as googleAuthApi } from '../services/api';
import { isAdminEmail } from '../config/adminList';
import { auth, googleProvider, signInWithPopup } from '../config/firebase';

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
            token: parsed.token || `auth-token-${parsed.user.role}-${Date.now()}`,
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

  // Helper to persist auth session
  const saveAuthSession = (user, token) => {
    const newState = {
      isAuthenticated: true,
      user,
      token: token || `auth-token-${user.role}-${Date.now()}`,
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
      if (res.success && res.user) {
        saveAuthSession(res.user, res.token);
        return { success: true, user: res.user };
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
   * Google Sign-In (Passwordless)
   */
  const loginWithGoogle = async () => {
    setLoading(true);

    try {
      // 1. Try Firebase Popup Authentication
      if (auth && googleProvider) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;
          const cleanEmail = firebaseUser.email.toLowerCase();

          const googleData = {
            email: cleanEmail,
            name: firebaseUser.displayName || cleanEmail.split('@')[0],
            avatarUrl: firebaseUser.photoURL || '',
            googleId: firebaseUser.uid,
          };

          // Sync with backend controller
          try {
            const res = await googleAuthApi(googleData);
            if (res.success && res.user) {
              saveAuthSession(res.user, res.token);
              return { success: true, user: res.user };
            }
          } catch (backendErr) {
            console.warn('Backend sync failed after Google auth, using Firebase payload:', backendErr);
          }

          const computedRole = isAdminEmail(cleanEmail) ? 'admin' : 'user';
          const fallbackUser = {
            name: googleData.name,
            email: googleData.email,
            role: computedRole,
            authProvider: 'google',
            avatarUrl: googleData.avatarUrl,
          };

          saveAuthSession(fallbackUser);
          return { success: true, user: fallbackUser };
        } catch (popupErr) {
          console.warn('Firebase popup closed/not configured, using interactive Google fallback prompt:', popupErr.message);
        }
      }

      // 2. Interactive Google Account Email Prompt for Demo/Development Environments
      const userGoogleEmail = window.prompt('Enter your Google Account Email ID for authentication:');
      if (!userGoogleEmail || !userGoogleEmail.trim()) {
        setLoading(false);
        return { success: false, message: 'Google Sign-In was cancelled.' };
      }

      const cleanEmail = userGoogleEmail.trim().toLowerCase();
      const computedRole = isAdminEmail(cleanEmail) ? 'admin' : 'user';

      const userName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
      const googleUser = {
        name: formattedName,
        email: cleanEmail,
        role: computedRole,
        authProvider: 'google',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      };

      try {
        await googleAuthApi({
          email: cleanEmail,
          name: googleUser.name,
          avatarUrl: googleUser.avatarUrl,
        });
      } catch (e) {
        // Backend sync optional
      }

      saveAuthSession(googleUser);
      return { success: true, user: googleUser };
    } catch (err) {
      console.error('Google login error:', err);
      return { success: false, message: 'Google Sign-In encountered an issue.' };
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
        loginWithGoogle,
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

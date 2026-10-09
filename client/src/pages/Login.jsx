import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { firebaseSSOConfigured } from '../config/firebase';

const Login = () => {
  const navigate = useNavigate();
  const { loginWithFirebaseSSO, isAuthenticated, user, loading: authLoading } = useAuth();

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/responses', { replace: true });
      } else {
        navigate('/nomination', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  /**
   * Trigger Production Firebase Single Sign-On (SSO)
   */
  const handleFirebaseSSO = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginWithFirebaseSSO();
      if (result.success) {
        toast.success(`Welcome, ${result.user.name || result.user.email}!`);
        navigate('/admin/responses', { replace: true });
      } else if (result.isAdminDenied) {
        toast.warn('You do not have administrative access. Redirecting to nomination form...', { autoClose: 5000 });
        setError(result.message || 'You do not have administrative access.');
        setTimeout(() => {
          navigate('/nomination', { replace: true });
        }, 1800);
      } else if (result.message) {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const msg = 'Firebase Single Sign-On encountered an issue. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-premium border border-primary/20 relative overflow-hidden bg-white/95 backdrop-blur-md">
          {/* Top Decorative Gradient Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-primary to-purple-600" />

          {/* Institution & Portal Title Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 via-purple-50 to-blue-50 text-primary mb-4 shadow-sm border border-primary/20">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">
              Alumni Portal SSO
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              National Engineering College Alumni Association
            </p>

            <div className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Enterprise Single Sign-On</span>
            </div>
          </div>

          {/* Error Notice Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          {/* Single Sign-On Primary Card Container */}
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Sign in securely with your Google or institutional account using standard Single Sign-On (SSO).
              </p>
            </div>

            {/* Production Firebase SSO Button */}
            <button
              type="button"
              onClick={handleFirebaseSSO}
              disabled={isSubmitting || authLoading}
              className="w-full py-4 px-6 rounded-2xl border-2 border-slate-200 hover:border-primary/50 bg-white hover:bg-slate-50/80 text-slate-800 font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer group"
            >
              {isSubmitting || authLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating with SSO...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google (Firebase SSO)</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-primary transition-all ml-auto" />
                </>
              )}
            </button>
          </div>

          {/* Footer Security Badge */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Protected by Firebase Authentication & OAuth 2.0</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

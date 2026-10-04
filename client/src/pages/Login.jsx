import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { googleSignInConfigured } from '../config/firebase';


const Login = () => {
  const navigate = useNavigate();
  const { requestOtp, verifyOtpCode, loginWithGoogle, loginLocally, isAuthenticated, user, loading: authLoading } = useAuth();
  const isLocalDevelopment = import.meta.env.DEV && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  // Screen View Step: 'email' or 'otp'
  const [step, setStep] = useState('email');

  // Form State
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown timer for OTP resend (in seconds)
  const [resendTimer, setResendTimer] = useState(0);

  // References for 6 OTP input boxes
  const inputRefs = useRef([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/responses', { replace: true });
      } else {
        navigate('/nomination', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Countdown timer interval logic
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  /**
   * Handle Requesting OTP
   */
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email format (e.g., user@example.com).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestOtp(email.trim());
      if (res.success) {
        toast.success(`Verification code sent to ${email.trim()}`);
        setStep('otp');
        setResendTimer(60); // 60 seconds resend timer
      } else {
        setError(res.message || 'Failed to send verification code. Please try again.');
        toast.error(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      const msg = 'Failed to connect to authentication server. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const result = await loginWithGoogle();
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin/responses' : '/nomination', { replace: true });
    } else if (result.message) {
      setError(result.message);
      toast.error(result.message);
    }
  };

  const handleLocalSignIn = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Enter an email address.');
      return;
    }
    setIsSubmitting(true);
    const result = await loginLocally(email);
    if (result.success) {
      toast.success(`Signed in locally as ${result.user.role}.`);
      navigate(result.user.role === 'admin' ? '/admin/responses' : '/nomination', { replace: true });
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    setIsSubmitting(false);
  };

  /**
   * Handle OTP Box Change
   */
  const handleOtpBoxChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtpValues = [...otpValues];
    
    // Paste support
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtpValues[i] = pasted[i] || '';
      }
      setOtpValues(newOtpValues);
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle OTP Keydown (Backspace navigation)
   */
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Handle Verify OTP Submission
   */
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const fullOtp = otpValues.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyOtpCode(email.trim(), fullOtp);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name || result.user.email}!`);
        if (result.user.role === 'admin') {
          navigate('/admin/responses', { replace: true });
        } else {
          navigate('/nomination', { replace: true });
        }
      } else {
        setError(result.message || 'Invalid verification code. Please check and try again.');
        toast.error(result.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-premium border border-primary/20 relative overflow-hidden bg-white/95 backdrop-blur-md">
          {/* Top Decorative Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-secondary" />

          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3 shadow-sm border border-primary/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Portal Access
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              National Engineering College Alumni Association
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              /* STEP 1: EMAIL / GOOGLE LOGIN VIEW */
              <motion.div
                key="step-email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Email Form */}
                <form onSubmit={isLocalDevelopment ? handleLocalSignIn : handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        disabled={isSubmitting || authLoading}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white text-sm"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-purple-700 hover:from-primary/95 hover:to-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting || authLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{isLocalDevelopment ? 'Signing in locally...' : 'Sending Verification Code...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isLocalDevelopment ? 'Sign In for Local Development' : 'Send 6-Digit OTP Code'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
                {googleSignInConfigured ? (
                  <>
                    <div className="relative py-1 text-center text-[11px] font-semibold text-slate-400">
                      <span className="relative z-10 bg-white px-3">OR</span>
                      <span className="absolute left-0 right-0 top-1/2 border-t border-slate-200" />
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting || authLoading}
                      className="w-full py-3 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <span className="text-base font-black text-blue-600">G</span>
                      Continue with Google
                    </button>
                  </>
                ) : (
                  <p className="text-center text-xs text-slate-500">
                    {isLocalDevelopment
                      ? 'Local development sign-in is available on this computer only.'
                      : 'Google sign-in is unavailable until Firebase is configured. Contact the site administrator to enable sign-in.'}
                  </p>
                )}
              </motion.div>
            ) : (
              /* STEP 2: OTP VERIFICATION VIEW */
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Step Header */}
                <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl text-center">
                  <p className="text-xs text-slate-600">Verification code sent to:</p>
                  <p className="text-sm font-bold text-primary truncate mt-0.5">{email}</p>
                </div>

                {/* 6-Digit OTP Input Boxes */}
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center mb-3">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {otpValues.map((val, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (inputRefs.current[idx] = el)}
                          type="text"
                          maxLength={6}
                          value={val}
                          onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-extrabold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white transition-all shadow-sm font-mono"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submit OTP Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-purple-700 hover:from-primary/95 hover:to-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting || authLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Resend & Change Email Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtpValues(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0 || isSubmitting}
                    className="text-primary hover:underline font-bold disabled:text-slate-400 disabled:no-underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

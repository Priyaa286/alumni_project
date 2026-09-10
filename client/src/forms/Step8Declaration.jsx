import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { sendOtp, verifyOtp } from '../services/api';

const Step8Declaration = ({ register, watch, setValue, formState: { errors } }) => {
  const nomineeEmail = watch('nominee.email') || '';
  const isOtpVerified = watch('declaration.isOtpVerified') || false;

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Register isOtpVerified field in react-hook-form
  useEffect(() => {
    register('declaration.isOtpVerified', {
      validate: (val) => val === true || 'You must verify the OTP sent to the Nominee email to proceed'
    });
  }, [register]);

  const handleSendOtp = async () => {
    if (!nomineeEmail || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(nomineeEmail)) {
      toast.error('Please enter a valid Nominee Email in Step 1 before requesting OTP.');
      return;
    }

    try {
      setIsSending(true);
      const res = await sendOtp(nomineeEmail);
      if (res.success) {
        setOtpSent(true);
        setCountdown(60);
        toast.success(`OTP sent successfully to ${nomineeEmail}. Please check your email inbox.`);
      } else {
        toast.error(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      toast.error(err.response?.data?.message || 'Failed to send OTP email. Please check server SMTP configuration.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code received in your email');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await verifyOtp(nomineeEmail, otpCode);
      if (res.success) {
        setValue('declaration.isOtpVerified', true, { shouldValidate: true });
        toast.success('Email OTP verified successfully!');
      } else {
        toast.error(res.message || 'Verification failed.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      toast.error(err.response?.data?.message || 'Invalid OTP code. Please check your email and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Declaration & Email OTP Verification
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Please confirm the accuracy of the details and verify the Nominee's email address using OTP.
        </p>
      </div>

      {/* Declaration Checkbox */}
      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-nec cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('declaration.isDeclared', { 
              required: 'You must check the declaration box to proceed' 
            })}
            className="w-5 h-5 mt-0.5 text-primary border-slate-300 rounded focus:ring-primary"
          />
          <span className="text-sm font-semibold text-slate-700 leading-relaxed">
            I hereby declare that all the information provided in this nomination form is true, complete, and accurate to the best of my knowledge. I understand that any false declarations may lead to rejection.
          </span>
        </label>
        {errors?.declaration?.isDeclared && (
          <span className="text-xs text-red-500 font-bold px-1">{errors.declaration.isDeclared.message}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nominee Name (Signed By) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Nominee / Signee Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Confirm full name for nomination"
            {...register('declaration.nomineeName', { required: 'Nominee/Signee name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.declaration?.nomineeName ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.declaration?.nomineeName && (
            <span className="text-xs text-red-500 font-medium">{errors.declaration.nomineeName.message}</span>
          )}
        </div>

        {/* Date Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('declaration.date', { required: 'Date is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white ${
              errors?.declaration?.date ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.declaration?.date && (
            <span className="text-xs text-red-500 font-medium">{errors.declaration.date.message}</span>
          )}
        </div>

        {/* Place */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">
            Place <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter location (e.g. Kovilpatti)"
            {...register('declaration.place', { required: 'Place is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.declaration?.place ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.declaration?.place && (
            <span className="text-xs text-red-500 font-medium">{errors.declaration.place.message}</span>
          )}
        </div>
      </div>

      {/* Nominee Email OTP Verification Section */}
      <div className="border border-borderlight bg-slate-50/80 rounded-nec p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-base font-bold text-slate-800">
              Nominee Email Verification
            </h3>
          </div>
          {isOtpVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified ✓
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Verification Required
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          An OTP will be sent to the Nominee's email address (<strong>{nomineeEmail || 'Not provided'}</strong>). Please enter the received OTP code from your email inbox to complete verification before proceeding.
        </p>

        {isOtpVerified ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-nec flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Email Verification Complete</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                The OTP for <strong>{nomineeEmail}</strong> has been successfully verified. You may now proceed to the next step.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Step 1: Send OTP Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-nec text-sm text-slate-700 font-medium truncate">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Nominee Email</span>
                {nomineeEmail || <span className="text-rose-500 italic font-semibold">Please enter Nominee Email in Step 1</span>}
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending || countdown > 0 || !nomineeEmail}
                className={`px-5 py-3 rounded-nec text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isSending || countdown > 0 || !nomineeEmail
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-md cursor-pointer'
                }`}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {otpSent ? 'Resend OTP' : 'Send OTP to Nominee Email'}
                  </>
                )}
              </button>
            </div>

            {/* Step 2: OTP Input & Verify */}
            {otpSent && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Enter 6-Digit OTP Code Received in Mail <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP code"
                    className="flex-1 px-4 py-2.5 rounded-nec border border-slate-300 text-lg tracking-widest font-mono font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all text-center sm:text-left"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || otpCode.length !== 6}
                    className={`px-6 py-2.5 rounded-nec text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      isVerifying || otpCode.length !== 6
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md cursor-pointer'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Verify OTP
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {errors?.declaration?.isOtpVerified && (
          <span className="text-xs text-red-500 font-bold block mt-2">
            {errors.declaration.isOtpVerified.message}
          </span>
        )}
      </div>
    </div>
  );
};

export default Step8Declaration;

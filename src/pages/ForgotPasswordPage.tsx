import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import API from '@/utils/api/apiClient';
import { AUTH_ROLE_STORAGE_KEY } from '@/utils/api/apiConfig';
import { useAuth } from '@/context/AuthContext';

const ForgotPasswordPage = () => {
  const { clearAllAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [resetError, setResetError] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const role = localStorage.getItem(AUTH_ROLE_STORAGE_KEY) || 'student';

  const getEndpointPrefix = () => {
    if (role === 'teacher') return '/api/v1/teachers';
    if (role === 'cr') return '/api/v1/crs';
    return '/api/v1/students';
  };

  const onSendEmail = async (data: any) => {
    setLoading(true);
    setEmailError('');
    try {
      await API.post(`${getEndpointPrefix()}/forget-password`, { email: (data.email || '').trim() });
      setSavedEmail((data.email || '').trim());
      reset();
      setStep('reset');
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Failed to send OTP. Please try again.';
      setEmailError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: any) => {
    setOtpError('');
    setPasswordError('');
    setConfirmError('');

    if (!data.otp?.trim()) {
      setOtpError('OTP is required');
      return;
    }
    if (!data.newPassword) {
      setPasswordError('Password is required');
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    if (!savedEmail?.trim()) {
      setResetError('Session expired. Please request OTP again.');
      setStep('email');
      return;
    }

    setLoading(true);
    setResetError('');
    try {
      await API.post(`${getEndpointPrefix()}/reset-password`, {
        email: savedEmail.trim(),
        otp: String(data.otp).trim(),
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      clearAllAuth();
      navigate('/login');
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Failed to reset password';
      setResetError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-background px-6 pt-16 sm:pt-24">
      {/* Back button - top left */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-5 left-5 flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
      >
        <ArrowLeft className="h-5 w-5 text-primary" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >

        {/* Header - matching PasswordRecoveryHeader.jsx */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-foreground">
            Welcome to <span className="text-primary">NeuraRUET</span>
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            RUET intelligence at<br />your service.
          </p>

          {/* Icon + Title */}
          <div className="mt-10 flex flex-col items-center gap-2.5">
            <Lock className="h-10 w-10 text-foreground" />
            <h2 className="text-xl font-medium text-foreground">Password Recovery</h2>
          </div>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSubmit(onSendEmail)} className="space-y-5">
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Email</label>
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="Enter your email"
                className={`w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  emailError ? 'ring-1 ring-warning' : ''
                }`}
                onChange={() => setEmailError('')}
              />
              {emailError && <p className="mt-1 ml-1 text-xs text-warning">{emailError}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary h-[55px] text-base font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2: Reset Password (OTP + New Password + Confirm) */}
        {step === 'reset' && (
          <form onSubmit={handleSubmit(onResetPassword)} className="space-y-5">
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">OTP Code</label>
              <input
                {...register('otp')}
                placeholder="Enter OTP from email"
                className={`w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  otpError ? 'ring-1 ring-warning' : ''
                }`}
                onChange={() => setOtpError('')}
              />
              {otpError && <p className="mt-1 ml-1 text-xs text-warning">{otpError}</p>}
            </div>
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">New Password</label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Confirm Password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
              {confirmError && <p className="mt-1 ml-1 text-xs text-warning">{confirmError}</p>}
            </div>
            {resetError && <p className="text-xs text-warning ml-1">{resetError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary h-[55px] text-base font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reset Password
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Loader2, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import API from '@/utils/api/apiClient';
import { useAuth } from '@/context/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { role, clearAllAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'success', title: '', message: '' });

  // Password visibility
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const { register, handleSubmit, reset, watch, setError, formState: { errors } } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  const getUpdateEndpoint = () => {
    if (role === 'teacher') return '/api/v1/update-password/teachers';
    if (role === 'cr') return '/api/v1/update-password/crs';
    return '/api/v1/update-password/students';
  };

  const getLogoutEndpoint = () => {
    if (role === 'teacher') return '/api/v1/teachers/logout';
    if (role === 'cr') return '/api/v1/crs/logout';
    return '/api/v1/students/logout';
  };

  const onUpdatePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await API.put(getUpdateEndpoint(), {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_new_password: data.confirmPassword,
      });
      reset();
      setModalConfig({ type: 'success', title: 'Password Updated', message: 'Your password has been changed successfully.' });
      setShowModal(true);
    } catch (err: any) {
      const detail = err?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('current')) {
        setError('currentPassword', { message: detail });
      } else {
        setModalConfig({ type: 'error', title: 'Update Failed', message: detail || err?.message || 'Failed to update password' });
        setShowModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setLogoutLoading(true);
    try {
      await API.post(getLogoutEndpoint(), {});
    } catch { }
    await clearAllAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - matching SettingsScreen.jsx */}
      <div className="flex items-center gap-3 px-[18px] pt-[18px] pb-2.5">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-9 w-9 items-center justify-center rounded-full"
        >
          <ArrowLeft className="h-[18px] w-[18px] text-primary" />
        </button>
        <h1 className="text-2xl font-medium text-primary">Settings</h1>
      </div>

      <div className="overflow-y-auto px-6 pt-2.5 pb-10 max-w-2xl mx-auto">
        {/* Update Password Form - matching UpdatePasswordForm.jsx */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-base font-medium text-foreground mb-5">Update Password</h3>

          <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Current Password</label>
              <div className="relative">
                <input
                  {...register('currentPassword', { required: 'Current password is required' })}
                  type={secureCurrent ? 'password' : 'text'}
                  placeholder="Enter current password"
                  className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setSecureCurrent(!secureCurrent)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {secureCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && <p className="mt-1 ml-1 text-xs text-warning">{errors.currentPassword.message}</p>}
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">New Password</label>
              <div className="relative">
                <input
                  {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={secureNew ? 'password' : 'text'}
                  placeholder="Enter new password"
                  className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setSecureNew(!secureNew)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {secureNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 ml-1 text-xs text-warning">{errors.newPassword.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Confirm New Password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === newPassword || 'Passwords do not match',
                  })}
                  type={secureConfirm ? 'password' : 'text'}
                  placeholder="Confirm new password"
                  className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setSecureConfirm(!secureConfirm)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {secureConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 ml-1 text-xs text-warning">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary h-[55px] text-base font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update Password
            </button>
          </form>
        </motion.div>

        {/* Logout Button - matching SettingsScreen.jsx */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={logoutLoading}
            className="w-full rounded-full border border-destructive bg-popover h-[55px] text-base font-semibold text-destructive flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-destructive/10 transition-colors"
          >
            {logoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {logoutLoading ? 'Logging out...' : 'Log Out'}
          </button>
        </motion.div>
      </div>

      {/* Success/Error Modal - matching SettingsScreen.jsx */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75">
          <div className="w-[80%] max-w-sm rounded-[20px] border border-border bg-popover p-6 text-center">
            <div className={`mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 ${
              modalConfig.type === 'success'
                ? 'border-primary bg-primary/20'
                : 'border-destructive bg-destructive/20'
            }`}>
              <span className="text-[28px] font-bold text-foreground">
                {modalConfig.type === 'success' ? '✓' : '!'}
              </span>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2.5">{modalConfig.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{modalConfig.message}</p>
            <button
              onClick={() => {
                setShowModal(false);
                if (modalConfig.type === 'success') navigate('/dashboard');
              }}
              className="w-full rounded-full bg-primary py-3 text-[15px] font-semibold text-primary-foreground"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal - matching SettingsScreen.jsx */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75">
          <div className="w-[80%] max-w-sm rounded-[20px] border border-border bg-popover p-6 text-center">
            <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-destructive bg-destructive/20">
              <span className="text-[28px] font-bold text-foreground">!</span>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2.5">Log Out</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-full bg-border py-3 text-[15px] font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-full bg-destructive py-3 text-[15px] font-semibold text-foreground"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

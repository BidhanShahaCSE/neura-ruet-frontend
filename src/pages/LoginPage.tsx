import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import API from '@/utils/api/apiClient';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_KIND_STORAGE_KEY,
  AUTH_ROLE_STORAGE_KEY,
} from '@/utils/api/apiConfig';
import type { UserRole } from '@/context/AuthContext';

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'student', label: 'Student Login' },
  { id: 'teacher', label: 'Teacher Login' },
];

const getConfig = (role: UserRole) => {
  if (role === 'teacher') return { endpoint: '/api/v1/teachers/login', idField: 'neura_teacher_id', label: 'Neura Teacher ID', placeholder: 'e.g. NEURAT1001' };
  if (role === 'cr') return { endpoint: '/api/v1/crs/login', idField: 'neura_cr_id', label: 'Neura CR ID', placeholder: 'e.g. NEURACR3037' };
  return { endpoint: '/api/v1/students/login', idField: 'neura_id', label: 'Neura ID', placeholder: 'e.g. NEURA2303137' };
};

const LoginPage = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ userId: '', password: '' });
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<{ userId: string; password: string }>();

  const config = getConfig(role);

  const onSubmit = async (data: { userId: string; password: string }) => {
    setLoading(true);
    setFieldErrors({ userId: '', password: '' });

    try {
      const payload = { [config.idField]: data.userId.trim(), password: data.password };
      const response = await API.post(config.endpoint, payload);
      const setupToken = response?.data?.setup_token;

      if (setupToken) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, setupToken);
        localStorage.setItem(AUTH_TOKEN_KIND_STORAGE_KEY, 'setup');
        localStorage.setItem(AUTH_ROLE_STORAGE_KEY, role);
        navigate('/profile-setup');
      }
    } catch (error: any) {
      const detail = error?.data?.detail;
      if (error?.status === 400 && typeof detail === 'string') {
        const lower = detail.toLowerCase();
        if (lower.includes('password')) {
          setFieldErrors({ userId: '', password: detail });
        } else {
          setFieldErrors({ userId: detail, password: '' });
        }
        return;
      }
      if (error?.status === 422 && Array.isArray(detail)) {
        let userIdMsg = '';
        let passwordMsg = '';
        for (const item of detail) {
          const loc = Array.isArray(item?.loc) ? item.loc : [];
          const field = loc[loc.length - 1];
          const msg = typeof item?.msg === 'string' ? item.msg : 'Invalid input';
          if (field === config.idField) userIdMsg = msg;
          if (field === 'password') passwordMsg = msg;
        }
        setFieldErrors({ userId: userIdMsg, password: passwordMsg || (!userIdMsg ? 'Invalid input' : '') });
        return;
      }
      setFieldErrors({
        userId: '',
        password: typeof error?.message === 'string' ? error.message : 'Network error. Try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setFieldErrors({ userId: '', password: '' });
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header - matching LoginHeader.jsx */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-foreground">
            Welcome to <span className="text-primary">NeuraRUET</span>
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            RUET intelligence at<br />your service.
          </p>
        </div>

        {/* Role Selector - matching RoleSelector.jsx */}
        <div className="mb-8 px-2">
          {/* Student & Teacher row */}
          <div className="flex gap-2.5 mb-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className={`flex-1 rounded-full py-3 text-base font-medium transition-all duration-200 ${
                  role === r.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* CR Login row - centered */}
          <div className="flex justify-center">
            <button
              onClick={() => handleRoleChange('cr')}
              className={`min-w-[140px] rounded-full px-10 py-3 text-base font-medium transition-all duration-200 ${
                role === 'cr'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              }`}
            >
              CR Login
            </button>
          </div>
        </div>

        {/* Login Form - matching LoginForm.jsx */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* User ID */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] font-normal text-foreground">
              {config.label}
            </label>
            <input
              {...register('userId', { required: true })}
              placeholder={config.placeholder}
              autoCapitalize="none"
              disabled={loading}
              className={`w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                fieldErrors.userId ? 'ring-1 ring-warning' : ''
              }`}
              onChange={() => setFieldErrors((prev) => ({ ...prev, userId: '' }))}
            />
            {fieldErrors.userId && (
              <p className="mt-1 ml-1 text-xs text-warning">{fieldErrors.userId}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] font-normal text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password', { required: true })}
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                disabled={loading}
                className={`w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                  fieldErrors.password ? 'ring-1 ring-warning' : ''
                }`}
                onChange={() => setFieldErrors((prev) => ({ ...prev, password: '' }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 ml-1 text-xs text-warning">{fieldErrors.password}</p>
            )}

            {/* Forgot Password - matching LoginForm.jsx */}
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              className="mt-2 block ml-auto text-[13px] text-warning hover:opacity-80 transition-opacity"
            >
              Forget Password?
            </button>
          </div>

          {/* Login Button - matching LoginForm.jsx */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary h-[55px] text-base font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;

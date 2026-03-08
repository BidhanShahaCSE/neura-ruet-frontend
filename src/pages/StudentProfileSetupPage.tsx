import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, User, ChevronDown } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import API from '@/utils/api/apiClient';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const SECTIONS = ['A', 'B', 'C', 'None'];

const StudentProfileSetupPage = () => {
  const navigate = useNavigate();
  const { completeSetup, status } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      rollNumber: '',
      department: '',
      section: '',
      series: '',
      mobileNumber: '',
      email: '',
    },
  });

  useEffect(() => {
    if (status === 'authenticated') { navigate('/dashboard'); return; }

    const load = async () => {
      try {
        const response = await API.get('/api/v1/students/profile-setup/me');
        const p = response?.data;
        if (!p) return;
        setValue('fullName', p.full_name ?? '');
        setValue('rollNumber', p.roll_no ?? '');
        setValue('department', p.dept ?? '');
        setValue('section', p.section ?? '');
        setValue('series', p.series != null ? String(p.series) : '');
        setValue('mobileNumber', p.mobile_no ?? '');
        setValue('email', p.email ?? '');
      } catch { }
    };
    load();
  }, [status, navigate, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        full_name: (data.fullName || '').trim(),
        roll_no: data.rollNumber ? String(data.rollNumber).trim() : null,
        dept: (data.department || '').trim(),
        section: data.section === 'None' ? null : data.section,
        series: data.series ? Number(data.series) : null,
        mobile_no: (data.mobileNumber || '').trim(),
        email: (data.email || '').trim(),
      };

      const response = await API.post('/api/v1/students/profile-setup', payload);
      const { access_token, refresh_token, refresh_token_id } = response?.data || {};

      if (access_token) {
        completeSetup({
          accessToken: access_token,
          refreshToken: refresh_token || '',
          refreshTokenId: refresh_token_id || '',
          role: 'student',
          fullName: data.fullName,
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Failed to save profile.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 pt-5 pb-10">
        <h1 className="text-2xl font-medium text-primary mb-8">Profile Setup</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-[120px] h-[120px] mb-2 flex items-center justify-center">
            <User className="w-24 h-24 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Student Profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Full Name</label>
            <input
              {...register('fullName', { required: 'Full name is required' })}
              disabled={loading}
              className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.fullName && <p className="mt-1 ml-1 text-xs text-warning">{(errors.fullName as any).message}</p>}
          </div>

          {/* Roll Number (Read Only) */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Roll Number</label>
            <input
              {...register('rollNumber')}
              readOnly
              className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Department (Read Only) */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Department</label>
            <input
              {...register('department')}
              readOnly
              className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Section Dropdown */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Section</label>
            <Controller
              control={control}
              name="section"
              rules={{ required: 'Section is required' }}
              render={({ field }) => (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSectionOpen(!sectionOpen)}
                    disabled={loading}
                    className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <span className={field.value ? 'text-foreground' : 'text-muted-foreground'}>
                      {field.value || 'Select section'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${sectionOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sectionOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSectionOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-[14px] border border-border bg-popover p-2">
                        {SECTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { field.onChange(s); setSectionOpen(false); }}
                            className={`w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                              field.value === s ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            />
            {errors.section && <p className="mt-1 ml-1 text-xs text-warning">{(errors.section as any).message}</p>}
          </div>

          {/* Series (Read Only) */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Series</label>
            <input {...register('series')} readOnly className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-muted-foreground focus:outline-none" />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Mobile Number</label>
            <input
              {...register('mobileNumber', {
                required: 'Mobile number is required',
                pattern: { value: /^01\d{9}$/, message: 'Invalid Bangladeshi mobile number' },
              })}
              placeholder="e.g. 01XXXXXXXXX"
              disabled={loading}
              className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.mobileNumber && <p className="mt-1 ml-1 text-xs text-warning">{(errors.mobileNumber as any).message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Email</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
              disabled={loading}
              className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.email && <p className="mt-1 ml-1 text-xs text-warning">{(errors.email as any).message}</p>}
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary h-[55px] text-base font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Completing...' : 'Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileSetupPage;

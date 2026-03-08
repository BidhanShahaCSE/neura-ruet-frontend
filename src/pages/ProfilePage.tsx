import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, User, ChevronDown, ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import API from '@/utils/api/apiClient';
import { useAuth } from '@/context/AuthContext';
import { AUTH_FULL_NAME_STORAGE_KEY } from '@/utils/api/apiConfig';

const SECTIONS = ['A', 'B', 'C', 'None'];
const CR_OPTIONS = ['CR-1', 'CR-2', 'CR-3'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { role, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [crOpen, setCrOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'success', title: '', message: '' });

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      rollNumber: '',
      department: '',
      section: '',
      series: '',
      mobileNumber: '',
      email: '',
      crNo: 'CR-1',
      designation: '',
      joiningYear: '',
    },
  });

  const getProfileEndpoint = () => {
    if (role === 'teacher') return '/api/v1/teachers/profile-setup/me';
    if (role === 'cr') return '/api/v1/crs/profile-setup/me';
    return '/api/v1/students/profile-setup/me';
  };

  const getUpdateEndpoint = () => {
    if (role === 'teacher') return '/api/v1/teachers/profile-setup';
    if (role === 'cr') return '/api/v1/crs/profile-setup';
    return '/api/v1/students/profile-setup';
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await API.get(getProfileEndpoint());
        const p = response?.data;
        if (!p) return;

        setValue('fullName', p.full_name ?? '');
        setValue('mobileNumber', p.mobile_no ?? '');
        setValue('email', p.email ?? '');
        setValue('department', p.dept ?? '');

        if (role === 'teacher') {
          // Teacher-specific fields
          const desig = p.designation;
          if (typeof desig === 'string' && desig.length) {
            const normalized = desig.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            setValue('designation', normalized);
          }
          setValue('joiningYear', p.joining_year != null ? String(p.joining_year) : '');
        } else {
          // Student & CR fields
          setValue('rollNumber', p.roll_no ?? '');
          setValue('section', p.section ?? '');
          setValue('series', p.series != null ? String(p.series) : '');

          if (role === 'cr' && typeof p.cr_no === 'string' && p.cr_no.length) {
            setValue('crNo', p.cr_no.toUpperCase());
          }
        }
      } catch { }
      setFetching(false);
    };
    loadProfile();
  }, [role, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let payload: any;

      if (role === 'teacher') {
        payload = {
          full_name: (data.fullName || '').trim(),
          designation: (data.designation || '').trim(),
          dept: (data.department || '').trim(),
          joining_year: data.joiningYear ? Number(data.joiningYear) : null,
          mobile_no: (data.mobileNumber || '').trim(),
          email: (data.email || '').trim(),
        };
      } else {
        payload = {
          full_name: (data.fullName || '').trim(),
          roll_no: data.rollNumber ? String(data.rollNumber).trim() : null,
          dept: (data.department || '').trim(),
          section: data.section === 'None' ? null : data.section,
          series: data.series ? Number(data.series) : null,
          mobile_no: (data.mobileNumber || '').trim(),
          email: (data.email || '').trim(),
        };
        if (role === 'cr') {
          payload.cr_no = (data.crNo || '').toLowerCase();
        }
      }

      await API.post(getUpdateEndpoint(), payload);

      localStorage.setItem(AUTH_FULL_NAME_STORAGE_KEY, data.fullName.trim());
      await refreshProfile();

      setModalConfig({ type: 'success', title: 'Profile Updated', message: 'Your profile has been updated successfully.' });
      setShowModal(true);
    } catch (err: any) {
      setModalConfig({ type: 'error', title: 'Update Failed', message: err?.message || 'Failed to update profile.' });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    if (role === 'teacher') return 'Teacher Profile';
    if (role === 'cr') return 'CR Profile';
    return 'Student Profile';
  };

  const DropdownField = ({ name, label, options, open, setOpen, rules }: any) => (
    <div>
      <label className="mb-2 ml-1 block text-[13px] text-foreground">{label}</label>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              disabled={loading}
              className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <span className={field.value ? 'text-foreground' : 'text-muted-foreground'}>
                {field.value || `Select ${label.toLowerCase()}`}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-[14px] border border-border bg-popover p-2">
                  {options.map((o: string) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => { field.onChange(o); setOpen(false); }}
                      className={`w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                        field.value === o ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}
            {fieldState.error && <p className="mt-1 ml-1 text-xs text-warning">{fieldState.error.message}</p>}
          </div>
        )}
      />
    </div>
  );

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full mr-2.5 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </button>
        <h1 className="text-2xl font-medium text-primary">Profile Update</h1>
      </div>

      <div className="max-w-md mx-auto px-6 pb-10">
        {/* Profile Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-[80px] h-[80px] mb-2 flex items-center justify-center">
            <User className="w-16 h-16 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">{getRoleLabel()}</p>
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

          {/* Student/CR: Roll Number (Read Only) */}
          {role !== 'teacher' && (
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Roll Number</label>
              <input
                {...register('rollNumber')}
                readOnly
                className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-muted-foreground focus:outline-none"
              />
            </div>
          )}

          {/* CR: CR No. Dropdown */}
          {role === 'cr' && (
            <DropdownField name="crNo" label="CR No." options={CR_OPTIONS} open={crOpen} setOpen={setCrOpen} rules={{ required: 'CR No. is required' }} />
          )}

          {/* Department (Read Only) */}
          <div>
            <label className="mb-2 ml-1 block text-[13px] text-foreground">Department</label>
            <input
              {...register('department')}
              readOnly
              className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Teacher: Designation */}
          {role === 'teacher' && (
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Designation</label>
              <input
                {...register('designation', { required: 'Designation is required' })}
                disabled={loading}
                className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.designation && <p className="mt-1 ml-1 text-xs text-warning">{(errors.designation as any).message}</p>}
            </div>
          )}

          {/* Teacher: Joining Year (Read Only) */}
          {role === 'teacher' && (
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Joining Year</label>
              <input
                {...register('joiningYear')}
                readOnly
                className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-muted-foreground focus:outline-none"
              />
            </div>
          )}

          {/* Student/CR: Section Dropdown */}
          {role !== 'teacher' && (
            <DropdownField name="section" label="Section" options={SECTIONS} open={sectionOpen} setOpen={setSectionOpen} rules={{ required: 'Section is required' }} />
          )}

          {/* Student/CR: Series (Read Only) */}
          {role !== 'teacher' && (
            <div>
              <label className="mb-2 ml-1 block text-[13px] text-foreground">Series</label>
              <input
                {...register('series')}
                readOnly
                className="w-full rounded-[14px] border-0 bg-secondary h-[54px] px-5 text-[13px] text-muted-foreground focus:outline-none"
              />
            </div>
          )}

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

          {/* Update Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary h-[55px] text-base font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Result Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-[18px] border border-border bg-popover p-6 text-center"
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
                modalConfig.type === 'success' ? 'bg-primary/20' : 'bg-destructive/20'
              }`}>
                <span className="text-2xl">{modalConfig.type === 'success' ? '✓' : '✕'}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{modalConfig.title}</h3>
              <p className="text-sm text-muted-foreground mb-5">{modalConfig.message}</p>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (modalConfig.type === 'success') navigate(-1);
                }}
                className="w-full rounded-full bg-primary h-[48px] text-sm font-semibold text-primary-foreground"
              >
                {modalConfig.type === 'success' ? 'Go Back' : 'Try Again'}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;

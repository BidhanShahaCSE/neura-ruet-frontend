import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  createTeacherNotice,
  getTeacherNoticeById,
  updateTeacherNotice,
} from '@/services/teacherNoticeService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALLOWED_DEPTS = [
  'CSE', 'EEE', 'ME', 'CE', 'IPE', 'ETE',
  'URP', 'ARCH', 'BME', 'MTE', 'GCE', 'WRE',
];

const SECTIONS = ['A', 'B', 'C', 'None'];

interface NoticeFormData {
  title: string;
  description: string;
  department: string;
  section: string;
  series: string;
}

const TeacherNoticeUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const noticeId = searchParams.get('noticeId');

  const isEditing = useMemo(() => {
    const id = String(noticeId ?? '').trim();
    return id.length > 0;
  }, [noticeId]);

  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [initialValues, setInitialValues] = useState<NoticeFormData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NoticeFormData>({
    defaultValues: {
      title: '',
      description: '',
      department: '',
      section: '',
      series: '',
    },
  });

  // Reset success state when noticeId changes
  useEffect(() => {
    setUploadSuccess(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [noticeId]);

  // Load existing notice for editing
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isEditing) {
        const empty: NoticeFormData = { title: '', description: '', department: '', section: '', series: '' };
        setInitialValues(empty);
        reset(empty);
        return;
      }
      setLoading(true);
      try {
        const notice = await getTeacherNoticeById(noticeId!);
        if (cancelled) return;
        const next: NoticeFormData = {
          title: notice?.title ?? '',
          description: (notice as any)?.notice_message ?? '',
          department: (notice as any)?.dept ?? '',
          section: (notice as any)?.sec ? String((notice as any).sec).toUpperCase() : 'None',
          series: (notice as any)?.series != null ? String((notice as any).series) : '',
        };
        setInitialValues(next);
        reset(next);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load notice');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isEditing, noticeId, reset]);

  const onSubmit = async (data: NoticeFormData) => {
    try {
      const rawSection = String(data.section ?? '').trim().toUpperCase();

      const payload = {
        title: data.title.trim(),
        notice_message: data.description.trim(),
        dept: data.department.trim().toUpperCase(),
        sec: rawSection === 'NONE' ? null : rawSection,
        series: data.series.trim(),
      };

      if (!payload.title || payload.title.length > 200) {
        throw new Error('Title must be between 1 and 200 characters');
      }
      if (!payload.notice_message) {
        throw new Error('Description is required');
      }
      if (!ALLOWED_DEPTS.includes(payload.dept)) {
        throw new Error('Department must be one of: ' + ALLOWED_DEPTS.join(', '));
      }
      if (!(payload.sec === null || ['A', 'B', 'C'].includes(payload.sec))) {
        throw new Error('Section must be A, B, C or None');
      }
      const seriesInt = Number.parseInt(payload.series, 10);
      if (!Number.isFinite(seriesInt) || seriesInt < 19 || seriesInt > 25) {
        throw new Error('Series must be a number between 19 and 25');
      }

      if (isEditing) {
        await updateTeacherNotice(noticeId!, payload as any);
        toast.success('Notice updated successfully');
        const nextInit: NoticeFormData = {
          title: payload.title,
          description: payload.notice_message,
          department: payload.dept,
          section: payload.sec === null ? 'None' : payload.sec,
          series: payload.series,
        };
        setInitialValues(nextInit);
        reset(nextInit);
      } else {
        await createTeacherNotice(payload as any);
        toast.success('Notice uploaded successfully');
      }

      setUploadSuccess(true);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload notice');
    }
  };

  const handleCreateNew = () => {
    setUploadSuccess(false);
    setSearchParams({});
    const empty: NoticeFormData = { title: '', description: '', department: '', section: '', series: '' };
    setInitialValues(empty);
    reset(empty);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4 shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-full mr-2.5 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </button>
        <h1 className="text-2xl font-medium text-primary">
          {isEditing ? 'Edit Notice' : 'Upload Notice'}
        </h1>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5">
          {/* Chat messages */}
          <div className="space-y-4 mb-6">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-[14px] rounded-tr-[4px] bg-primary px-4 py-3">
                <p className="text-[13px] text-primary-foreground">
                  {isEditing ? 'Edit a Notice' : 'Upload a Notice'}
                </p>
              </div>
            </div>
            {/* AI message */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-[14px] rounded-tl-[4px] bg-secondary px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-foreground/10">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary-foreground">AI</span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary">Neura AI</span>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/[0.88]">
                  To {isEditing ? 'edit' : 'upload'} a notice, you have to fill the following options
                </p>
              </div>
            </div>
          </div>

          {/* Form or Success */}
          {!uploadSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-10">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-[13px] text-foreground ml-1">Title</Label>
                <Input
                  {...register('title', {
                    required: 'Title is required',
                    maxLength: { value: 200, message: 'Max 200 characters' },
                  })}
                  placeholder="Give a suitable title..."
                  className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] h-auto focus-visible:ring-primary"
                />
                {errors.title && <p className="text-xs text-warning ml-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-[13px] text-foreground ml-1">Description</Label>
                <Textarea
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Write your notice here..."
                  className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] min-h-[120px] resize-none focus-visible:ring-primary"
                />
                {errors.description && (
                  <p className="text-xs text-warning ml-1">{errors.description.message}</p>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="space-y-2">
                <Label className="text-[13px] text-foreground ml-1">Department</Label>
                <Controller
                  control={control}
                  name="department"
                  rules={{
                    required: 'Department is required',
                    validate: (v) =>
                      ALLOWED_DEPTS.includes(String(v || '').toUpperCase()) || 'Invalid department',
                  }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-secondary border-transparent rounded-[14px] px-5 h-[52px] text-[13px] focus:ring-primary">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALLOWED_DEPTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department && (
                  <p className="text-xs text-warning ml-1">{errors.department.message}</p>
                )}
              </div>

              {/* Section Dropdown */}
              <div className="space-y-2">
                <Label className="text-[13px] text-foreground ml-1">Section</Label>
                <Controller
                  control={control}
                  name="section"
                  rules={{
                    required: 'Section is required',
                    validate: (v) => {
                      const n = String(v || '').trim().toUpperCase();
                      return ['A', 'B', 'C', 'NONE'].includes(n) || 'Invalid section';
                    },
                  }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-secondary border-transparent rounded-[14px] px-5 h-[52px] text-[13px] focus:ring-primary">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.section && (
                  <p className="text-xs text-warning ml-1">{errors.section.message}</p>
                )}
              </div>

              {/* Series */}
              <div className="space-y-2">
                <Label className="text-[13px] text-foreground ml-1">Series</Label>
                <Input
                  {...register('series', {
                    required: 'Series is required',
                    validate: (v) => {
                      const n = Number.parseInt(String(v || ''), 10);
                      if (!Number.isFinite(n)) return 'Series must be a number';
                      if (n < 19 || n > 25) return 'Series must be between 19 and 25';
                      return true;
                    },
                  })}
                  placeholder="e.g. 23"
                  className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] h-auto focus-visible:ring-primary"
                />
                {errors.series && <p className="text-xs text-warning ml-1">{errors.series.message}</p>}
              </div>

              {/* Upload button */}
              <div className="flex justify-center mt-5 pb-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground rounded-full w-[140px] h-12 text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting
                    ? isEditing
                      ? 'Updating...'
                      : 'Uploading...'
                    : isEditing
                      ? 'Update'
                      : 'Upload'}
                </button>
              </div>
            </form>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center pb-10">
              {/* Success AI message */}
              <div className="w-full flex justify-start mb-5">
                <div className="max-w-[85%] rounded-[14px] rounded-tl-[4px] bg-secondary px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-foreground/10">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary-foreground">AI</span>
                    </div>
                    <span className="text-[11px] font-semibold text-primary">Neura AI</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-foreground/[0.88]">
                    Uploaded successfully!
                  </p>
                </div>
              </div>

              {/* Create New button */}
              <button
                onClick={handleCreateNew}
                className="bg-primary text-primary-foreground rounded-full px-8 h-12 text-base font-semibold hover:opacity-90 transition-opacity"
              >
                Create New
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherNoticeUploadPage;

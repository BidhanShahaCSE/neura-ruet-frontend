import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createCrNotice, getCrNoticeById, updateCrNotice } from '@/services/crNoticeService';

interface NoticeFormData {
  title: string;
  description: string;
}

const CRNoticeUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const noticeId = searchParams.get('noticeId');
  const isEditing = Boolean(noticeId);

  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [initialValues, setInitialValues] = useState<NoticeFormData | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NoticeFormData>({
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    setUploadSuccess(false);
  }, [noticeId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isEditing) {
        const empty = { title: '', description: '' };
        setInitialValues(empty);
        reset(empty);
        return;
      }

      setLoading(true);
      try {
        const notice = await getCrNoticeById(noticeId!);
        if (cancelled) return;
        const next = {
          title: notice?.title ?? '',
          description: notice?.notice_message ?? '',
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
      const payload = {
        title: data.title.trim(),
        notice_message: data.description.trim(),
      };

      if (!payload.title || payload.title.length > 200) {
        throw new Error('Title must be between 1 and 200 characters');
      }
      if (!payload.notice_message) {
        throw new Error('Description is required');
      }

      if (isEditing) {
        await updateCrNotice(noticeId!, payload);
        const nextInit = { title: payload.title, description: payload.notice_message };
        setInitialValues(nextInit);
        reset(nextInit);
      } else {
        await createCrNotice(payload);
        reset({ title: '', description: '' });
      }

      setUploadSuccess(true);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload notice');
    }
  };

  const handleCancel = () => {
    if (initialValues) {
      reset(initialValues);
    } else {
      reset({ title: '', description: '' });
    }
  };

  const handleCreateNew = () => {
    setUploadSuccess(false);
    setSearchParams({});
    reset({ title: '', description: '' });
    setInitialValues({ title: '', description: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4">
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

      {/* Chat-style messages */}
      <div className="max-w-3xl mx-auto px-5">
        <div className="space-y-4 mb-6">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-[14px] rounded-tr-[4px] bg-primary px-4 py-3">
              <p className="text-[13px] text-primary-foreground">
                {isEditing ? 'Edit a Notice' : 'Upload a Notice'}
              </p>
            </div>
          </div>
          {/* Assistant message */}
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-[14px] rounded-tl-[4px] bg-popover px-4 py-3">
              <p className="text-[13px] leading-relaxed text-foreground/[0.88]">
                To {isEditing ? 'edit' : 'upload'} a notice, you have to fill the following options
              </p>
            </div>
          </div>
        </div>

        {/* Form OR Success State */}
        {!uploadSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-10">
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

            <div className="space-y-2">
              <Label className="text-[13px] text-foreground ml-1">Description</Label>
              <Textarea
                {...register('description', { required: 'Description is required' })}
                placeholder="Write your notice here..."
                className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] min-h-[120px] resize-none focus-visible:ring-primary"
              />
              {errors.description && <p className="text-xs text-warning ml-1">{errors.description.message}</p>}
            </div>

            {/* Cancel + Upload buttons side by side */}
            <div className="flex justify-center gap-5 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-full w-[120px] h-12 text-base font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full w-[120px] h-12 text-base font-semibold"
              >
                {isSubmitting
                  ? (isEditing ? 'Updating...' : 'Uploading...')
                  : (isEditing ? 'Update' : 'Upload')}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center pb-10">
            {/* Success message bubble */}
            <div className="w-full flex justify-start mb-5">
              <div className="rounded-[14px] rounded-tl-[4px] bg-popover px-4 py-3">
                <p className="text-[13px] text-foreground/[0.88]">
                  {isEditing ? 'Updated successfully!' : 'Uploaded successfully!'}
                </p>
              </div>
            </div>

            {/* Create New button */}
            <Button
              onClick={handleCreateNew}
              className="rounded-full px-8 h-12 text-base font-semibold mt-2"
            >
              Create New
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRNoticeUploadPage;

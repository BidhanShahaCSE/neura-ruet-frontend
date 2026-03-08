import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CR_MATERIAL_TYPE,
  uploadCrMaterial,
  getCrMaterialByTypeAndId,
  updateCrMaterial,
} from '@/services/crMaterialUploadService';

interface MaterialFormData {
  driveLink: string;
  materialType: string;
  courseCode: string;
  courseName: string;
  topic: string;
  writtenBy: string;
  ctNo: string;
  year: string;
}

const MATERIAL_TYPES = [
  CR_MATERIAL_TYPE.CLASS_NOTE,
  CR_MATERIAL_TYPE.CT_QUESTION,
  CR_MATERIAL_TYPE.LECTURE_SLIDE,
  CR_MATERIAL_TYPE.SEMESTER_QUESTION,
];

const CRMaterialUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const materialType = searchParams.get('materialType');
  const materialId = searchParams.get('materialId');
  const isEditing = Boolean(materialType && materialId);

  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [initialValues, setInitialValues] = useState<MaterialFormData | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<MaterialFormData>({
    defaultValues: {
      driveLink: '',
      materialType: materialType || '',
      courseCode: '',
      courseName: '',
      topic: '',
      writtenBy: '',
      ctNo: '',
      year: '',
    },
  });

  const selectedMaterialType = watch('materialType');

  useEffect(() => {
    setUploadSuccess(false);
  }, [materialType, materialId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isEditing) {
        const empty: MaterialFormData = {
          driveLink: '',
          materialType: materialType && MATERIAL_TYPES.includes(materialType as any) ? materialType : '',
          courseCode: '', courseName: '', topic: '', writtenBy: '', ctNo: '', year: '',
        };
        setInitialValues(empty);
        reset(empty);
        return;
      }

      setLoading(true);
      try {
        const data = await getCrMaterialByTypeAndId(materialType!, materialId!);
        if (cancelled) return;

        const next: MaterialFormData = {
          driveLink: data?.drive_url != null ? String(data.drive_url) : '',
          materialType: materialType!,
          courseCode: data?.course_code != null ? String(data.course_code) : '',
          courseName: data?.course_name != null ? String(data.course_name) : '',
          topic: data?.topic != null ? String(data.topic) : '',
          writtenBy: data?.written_by != null ? String(data.written_by) : '',
          ctNo: data?.ct_no != null ? String(data.ct_no) : '',
          year: data?.year != null ? String(data.year) : '',
        };

        setInitialValues(next);
        reset(next);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load material');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isEditing, materialType, materialId, reset]);

  const onSubmit = async (data: MaterialFormData) => {
    try {
      const effectiveMaterialType = isEditing ? materialType! : data.materialType;
      if (!effectiveMaterialType) {
        throw new Error('Material Type is required');
      }

      const driveUrl = data.driveLink.trim();
      const courseCode = data.courseCode.trim();
      const courseName = data.courseName.trim();
      const topic = data.topic.trim();
      const writtenBy = data.writtenBy.trim();
      const ctNoRaw = data.ctNo.trim();
      const yearRaw = data.year.trim();

      let payload: any = null;

      if (effectiveMaterialType === CR_MATERIAL_TYPE.CLASS_NOTE) {
        payload = { drive_url: driveUrl, course_code: courseCode, course_name: courseName, topic, written_by: writtenBy };
      } else if (effectiveMaterialType === CR_MATERIAL_TYPE.CT_QUESTION) {
        payload = { drive_url: driveUrl, course_code: courseCode, course_name: courseName, ct_no: Number(ctNoRaw) };
      } else if (effectiveMaterialType === CR_MATERIAL_TYPE.LECTURE_SLIDE) {
        payload = { drive_url: driveUrl, course_code: courseCode, course_name: courseName, topic };
      } else if (effectiveMaterialType === CR_MATERIAL_TYPE.SEMESTER_QUESTION) {
        payload = { drive_url: driveUrl, course_code: courseCode, course_name: courseName, year: Number(yearRaw) };
      }

      if (isEditing) {
        await updateCrMaterial(effectiveMaterialType, materialId!, payload);
        const nextInit: MaterialFormData = {
          driveLink: driveUrl, materialType: effectiveMaterialType,
          courseCode, courseName, topic, writtenBy, ctNo: ctNoRaw, year: yearRaw,
        };
        setInitialValues(nextInit);
        reset(nextInit);
      } else {
        await uploadCrMaterial(effectiveMaterialType, payload);
        reset({
          driveLink: '', materialType: effectiveMaterialType,
          courseCode: '', courseName: '', topic: '', writtenBy: '', ctNo: '', year: '',
        });
      }

      setUploadSuccess(true);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload material');
    }
  };

  const handleCancel = () => {
    if (initialValues) {
      reset(initialValues);
    } else {
      reset({
        driveLink: '', materialType: '', courseCode: '', courseName: '',
        topic: '', writtenBy: '', ctNo: '', year: '',
      });
    }
  };

  const handleCreateNew = () => {
    setUploadSuccess(false);
    setSearchParams({});
    const empty: MaterialFormData = {
      driveLink: '', materialType: '', courseCode: '', courseName: '',
      topic: '', writtenBy: '', ctNo: '', year: '',
    };
    setInitialValues(empty);
    reset(empty);
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
          {isEditing ? 'Edit Material' : 'Upload Material'}
        </h1>
      </div>

      {/* Chat-style messages */}
      <div className="max-w-3xl mx-auto px-5">
        <div className="space-y-4 mb-6">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-[14px] rounded-tr-[4px] bg-primary px-4 py-3">
              <p className="text-[13px] text-primary-foreground">
                {isEditing ? 'Edit a Material' : 'Upload a Material'}
              </p>
            </div>
          </div>
          {/* Assistant message */}
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-[14px] rounded-tl-[4px] bg-popover px-4 py-3">
              <p className="text-[13px] leading-relaxed text-foreground/[0.88]">
                To {isEditing ? 'edit' : 'upload'} a material, you have to fill the following options
              </p>
            </div>
          </div>
        </div>

        {/* Form OR Success State */}
        {!uploadSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">
            {/* Drive Link (First - as textarea, matching original) */}
            <div className="space-y-2">
              <Label className="text-[13px] text-foreground ml-1">Upload material drive link here</Label>
              <Textarea
                {...register('driveLink', { required: 'Link is required' })}
                placeholder="Paste your link here..."
                className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] min-h-[80px] resize-none focus-visible:ring-primary"
              />
              {errors.driveLink && <p className="text-xs text-warning ml-1">{errors.driveLink.message}</p>}
            </div>

            {/* Material Type Dropdown */}
            <div className="space-y-2">
              <Label className="text-[13px] text-foreground ml-1">Material Type</Label>
              <Controller
                name="materialType"
                control={control}
                rules={{ required: 'Material type is required' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEditing}
                  >
                    <SelectTrigger className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] h-auto focus:ring-primary">
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.materialType && <p className="text-xs text-warning ml-1">{errors.materialType.message}</p>}
            </div>

            {/* --- Conditional Fields based on Material Type --- */}

            {/* Class Note fields */}
            {selectedMaterialType === CR_MATERIAL_TYPE.CLASS_NOTE && (
              <>
                <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" register={register} errors={errors} required />
                <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" register={register} errors={errors} required />
                <InputField label="Topic" name="topic" placeholder="Array" register={register} errors={errors} />
                <InputField label="Written By" name="writtenBy" placeholder="Taieb Mahmud Rafin" register={register} errors={errors} />
              </>
            )}

            {/* CT Question fields */}
            {selectedMaterialType === CR_MATERIAL_TYPE.CT_QUESTION && (
              <>
                <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" register={register} errors={errors} required />
                <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" register={register} errors={errors} required />
                <InputField label="CT No" name="ctNo" placeholder="1" register={register} errors={errors} required type="number" />
              </>
            )}

            {/* Lecture Slide fields */}
            {selectedMaterialType === CR_MATERIAL_TYPE.LECTURE_SLIDE && (
              <>
                <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" register={register} errors={errors} required />
                <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" register={register} errors={errors} required />
                <InputField label="Topic" name="topic" placeholder="Tree" register={register} errors={errors} />
              </>
            )}

            {/* Semester Question fields */}
            {selectedMaterialType === CR_MATERIAL_TYPE.SEMESTER_QUESTION && (
              <>
                <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" register={register} errors={errors} required />
                <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" register={register} errors={errors} required />
                <InputField label="Year" name="year" placeholder="2021" register={register} errors={errors} required type="number" />
              </>
            )}

            {/* Cancel + Upload buttons side by side */}
            <div className="flex justify-center gap-5 pt-5">
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

/* Reusable input field matching original app's InputField pattern */
interface InputFieldProps {
  label: string;
  name: keyof MaterialFormData;
  placeholder: string;
  register: any;
  errors: any;
  required?: boolean;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, placeholder, register, errors, required = false, type }) => (
  <div className="space-y-2">
    <Label className="text-[13px] text-foreground ml-1">{label}</Label>
    <Input
      {...register(name, required ? { required: `${label} is required` } : {})}
      type={type}
      placeholder={placeholder}
      className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] h-auto focus-visible:ring-primary"
    />
    {errors[name] && <p className="text-xs text-warning ml-1">{errors[name].message}</p>}
  </div>
);

export default CRMaterialUploadPage;
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  createTeacherResultSheet,
  batchUpsertTeacherResultEntries,
  getTeacherResultSheetById,
  updateTeacherResultSheet,
} from '@/services/teacherResultSheetService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ── types ── */
interface RollEntry {
  roll: string;
  marks: string;
}

interface ResultMeta {
  ctNo: string;
  courseCode: string;
  courseName: string;
  department: string;
  section: string;
  series: string;
}

const DEPARTMENTS = ['EEE', 'CSE', 'ETE', 'ECE', 'CE', 'URP', 'ARCH', 'BECM', 'ME', 'IPE', 'CME', 'MTE', 'MSE', 'CHE'];
const SECTIONS = ['A', 'B', 'C', 'None'];

/* ══════════════════════════════════════════════════
   ResultCreateMessage – chat bubble header
   ══════════════════════════════════════════════════ */
const ResultCreateMessage: React.FC<{ isEditing: boolean }> = ({ isEditing }) => (
  <div className="px-5 mb-5 space-y-4">
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-[14px] rounded-tr-[4px] bg-primary px-4 py-3">
        <p className="text-[13px] text-primary-foreground">
          {isEditing ? 'Edit a Marksheet' : 'Create a Marksheet'}
        </p>
      </div>
    </div>
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-[14px] rounded-tl-[4px] bg-popover px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-foreground/10">
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[8px] font-bold text-primary-foreground">AI</span>
          </div>
          <span className="text-[11px] font-semibold text-primary">Neura AI</span>
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/[0.88]">
          To create a marksheet, you have to fill following options
        </p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   MarkSheetForm – roll range + 3-column grid
   ══════════════════════════════════════════════════ */
interface MarkSheetFormProps {
  startRoll: string;
  setStartRoll: (v: string) => void;
  endRoll: string;
  setEndRoll: (v: string) => void;
  generatedRolls: RollEntry[];
  setGeneratedRolls: (v: RollEntry[]) => void;
}

const MarkSheetForm: React.FC<MarkSheetFormProps> = ({
  startRoll, setStartRoll, endRoll, setEndRoll, generatedRolls, setGeneratedRolls,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleGenerate = () => {
    const start = parseInt(startRoll);
    const end = parseInt(endRoll);
    if (isNaN(start) || isNaN(end)) { toast.error('Please enter valid numbers.'); return; }
    if (end < start) { toast.error('Ending roll must be greater than starting roll.'); return; }
    if (end - start + 1 > 70) { toast.error('You can only generate up to 70 rolls at a time.'); return; }
    const rolls: RollEntry[] = [];
    for (let i = start; i <= end; i++) rolls.push({ roll: i.toString(), marks: '' });
    setGeneratedRolls(rolls);
    inputRefs.current = new Array(rolls.length).fill(null);
  };

  const handleMarkChange = (text: string, index: number) => {
    const updated = [...generatedRolls];
    updated[index] = { ...updated[index], marks: text };
    setGeneratedRolls(updated);
  };

  const focusNext = (index: number) => {
    if (index < generatedRolls.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const renderColumns = () => {
    if (generatedRolls.length === 0) return null;
    const numCols = 3;
    const perCol = Math.ceil(generatedRolls.length / numCols);
    const cols = [
      generatedRolls.slice(0, perCol).map((item, i) => ({ ...item, idx: i })),
      generatedRolls.slice(perCol, perCol * 2).map((item, i) => ({ ...item, idx: perCol + i })),
      generatedRolls.slice(perCol * 2).map((item, i) => ({ ...item, idx: perCol * 2 + i })),
    ];

    return (
      <div className="flex justify-between items-start gap-1">
        {cols.map((col, ci) => (
          <div key={ci} className="flex-1 flex flex-col items-center gap-2.5">
            {col.map((item) => (
              <div key={item.roll} className="flex items-center justify-center gap-1">
                <div className="w-[52px] h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-primary-foreground">{item.roll}</span>
                </div>
                <span className="text-foreground text-xs font-bold">:</span>
                <input
                  ref={(el) => { inputRefs.current[item.idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  className="w-9 h-8 rounded-lg bg-secondary text-center text-foreground text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                  value={generatedRolls[item.idx].marks}
                  onChange={(e) => handleMarkChange(e.target.value, item.idx)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); focusNext(item.idx); } }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-5 mb-5">
      {/* Roll range inputs */}
      <div className="flex justify-center items-center gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground">Starting Roll :</span>
          <input
            className="bg-secondary rounded-lg w-20 h-[30px] text-center text-foreground text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
            value={startRoll}
            onChange={(e) => setStartRoll(e.target.value)}
            placeholder="e.g. 2303121"
            inputMode="numeric"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground">Ending Roll :</span>
          <input
            className="bg-secondary rounded-lg w-20 h-[30px] text-center text-foreground text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
            value={endRoll}
            onChange={(e) => setEndRoll(e.target.value)}
            placeholder="e.g. 2303181"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Generate button */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={handleGenerate}
          className="bg-primary text-primary-foreground rounded-full px-8 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Generate Form
        </button>
      </div>

      {/* Column headers */}
      {generatedRolls.length > 0 && (
        <div className="flex justify-between mb-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex justify-center gap-5">
              <span className="text-xs font-medium text-foreground">Roll</span>
              <span className="text-xs font-medium text-foreground">Marks</span>
            </div>
          ))}
        </div>
      )}

      {renderColumns()}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   ResultForm – course meta + submit
   ══════════════════════════════════════════════════ */
interface ResultFormProps {
  onFormSubmit: (data: ResultMeta) => void;
  isSubmitting: boolean;
  initialValues: ResultMeta | null;
  isEditing: boolean;
}

const ResultForm: React.FC<ResultFormProps> = ({ onFormSubmit, isSubmitting, initialValues, isEditing }) => {
  const safeInitial = useMemo(() => {
    if (!initialValues) return null;
    return { ...initialValues };
  }, [initialValues]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ResultMeta>({
    defaultValues: { ctNo: '', courseCode: '', courseName: '', department: '', section: '', series: '' },
  });

  useEffect(() => {
    if (safeInitial) reset(safeInitial);
  }, [safeInitial, reset]);

  const onSubmit = (data: ResultMeta) => {
    onFormSubmit(data);
    if (!isEditing) reset();
  };

  const inputClass = 'bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] h-auto text-foreground placeholder:text-muted-foreground focus-visible:ring-primary';

  return (
    <div className="px-5">
      {/* CT No */}
      <div className="mb-4">
        <label className="text-[13px] text-foreground ml-1 mb-2 block">CT no.</label>
        <Input {...register('ctNo', { required: 'CT no. is required' })} placeholder="e.g. 1" className={inputClass} />
        {errors.ctNo && <p className="text-xs text-warning ml-1 mt-1.5">{errors.ctNo.message}</p>}
      </div>

      {/* Course Code */}
      <div className="mb-4">
        <label className="text-[13px] text-foreground ml-1 mb-2 block">Course Code</label>
        <Input {...register('courseCode', { required: 'Course code is required' })} placeholder="e.g. CSE-2100" className={inputClass} />
        {errors.courseCode && <p className="text-xs text-warning ml-1 mt-1.5">{errors.courseCode.message}</p>}
      </div>

      {/* Course Name */}
      <div className="mb-4">
        <label className="text-[13px] text-foreground ml-1 mb-2 block">Course Name</label>
        <Input {...register('courseName', { required: 'Course name is required' })} placeholder="e.g. Data Structure and Algorithm" className={inputClass} />
        {errors.courseName && <p className="text-xs text-warning ml-1 mt-1.5">{errors.courseName.message}</p>}
      </div>

      {/* Department dropdown */}
      <div className="mb-4">
        <label className="text-[13px] text-foreground ml-1 mb-2 block">Department</label>
        <Controller
          control={control}
          name="department"
          rules={{ required: 'Department is required' }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] h-auto text-foreground focus:ring-primary">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.department && <p className="text-xs text-warning ml-1 mt-1.5">{errors.department.message}</p>}
      </div>

      {/* Section dropdown */}
      <div className="mb-4">
        <label className="text-[13px] text-foreground ml-1 mb-2 block">Section</label>
        <Controller
          control={control}
          name="section"
          rules={{ required: 'Section is required' }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-secondary border-transparent rounded-[14px] px-5 py-4 text-[13px] h-auto text-foreground focus:ring-primary">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {SECTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.section && <p className="text-xs text-warning ml-1 mt-1.5">{errors.section.message}</p>}
      </div>

      {/* Series */}
      <div className="mb-4">
        <label className="text-[13px] text-foreground ml-1 mb-2 block">Series</label>
        <Input {...register('series', { required: 'Series is required' })} placeholder="e.g. 23" className={inputClass} />
        {errors.series && <p className="text-xs text-warning ml-1 mt-1.5">{errors.series.message}</p>}
      </div>

      {/* Upload button */}
      <div className="flex justify-center mt-5 pb-10">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground rounded-full w-[120px] h-12 text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update' : 'Upload')}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   TeacherResultCreatePage – orchestrator
   ══════════════════════════════════════════════════ */
const TeacherResultCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sheetId = searchParams.get('sheetId');
  const isEditing = Boolean(sheetId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialMeta, setInitialMeta] = useState<ResultMeta | null>(null);

  // Lifted state
  const [startRoll, setStartRoll] = useState('');
  const [endRoll, setEndRoll] = useState('');
  const [generatedRolls, setGeneratedRolls] = useState<RollEntry[]>([]);

  /* ── load for editing ── */
  useEffect(() => {
    let cancelled = false;
    const toFormSection = (v: any) => {
      if (v == null) return 'None';
      const c = String(v).trim();
      return c || 'None';
    };

    const load = async () => {
      if (!isEditing) { setInitialMeta(null); return; }
      setLoading(true);
      try {
        const sheet = await getTeacherResultSheetById(sheetId!);
        if (cancelled) return;

        setInitialMeta({
          ctNo: sheet?.ct_no != null ? String(sheet.ct_no) : '',
          courseCode: sheet?.course_code != null ? String(sheet.course_code) : '',
          courseName: sheet?.course_name != null ? String(sheet.course_name) : '',
          department: sheet?.dept != null ? String(sheet.dept) : '',
          section: toFormSection(sheet?.section),
          series: sheet?.series != null ? String(sheet.series) : '',
        });

        const entries = Array.isArray(sheet?.entries) ? sheet.entries : [];
        const entryRolls = entries.map((e: any) => parseInt(String(e?.roll_no ?? ''), 10)).filter(Number.isFinite);
        let ns = sheet?.starting_roll != null ? String(sheet.starting_roll).trim() : '';
        let ne = sheet?.ending_roll != null ? String(sheet.ending_roll).trim() : '';
        if ((!ns || !ne) && entryRolls.length > 0) {
          ns = ns || String(Math.min(...entryRolls));
          ne = ne || String(Math.max(...entryRolls));
        }
        setStartRoll(ns);
        setEndRoll(ne);

        const si = parseInt(ns, 10);
        const ei = parseInt(ne, 10);
        if (Number.isFinite(si) && Number.isFinite(ei) && ei >= si && ei - si + 1 <= 70) {
          const marksByRoll = new Map<string, string>();
          for (const e of entries) {
            const r = String(e?.roll_no ?? '').trim();
            const m = String(e?.marks ?? '').trim().toUpperCase();
            marksByRoll.set(r, m === 'A' ? '' : m);
          }
          const rolls: RollEntry[] = [];
          for (let i = si; i <= ei; i++) {
            const rs = String(i);
            rolls.push({ roll: rs, marks: marksByRoll.get(rs) ?? '' });
          }
          setGeneratedRolls(rolls);
        }
        setUploadSuccess(false);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load result sheet');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isEditing, sheetId]);

  /* ── helpers ── */
  const normalizeSection = (v: string) => {
    const c = v.trim();
    if (!c || c.toLowerCase() === 'none') return null;
    return c;
  };
  const normalizeMarks = (v: string) => {
    const c = v.trim();
    return c === '' ? 'A' : c.toUpperCase();
  };

  const handleCreateNew = () => {
    setUploadSuccess(false);
    setStartRoll('');
    setEndRoll('');
    setGeneratedRolls([]);
    setInitialMeta(null);
    setSearchParams({});
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── final submit ── */
  const handleFinalSubmit = async (meta: ResultMeta) => {
    if (isSubmitting) return;
    if (!startRoll || !endRoll) { toast.error('Please enter starting and ending roll and generate the form.'); return; }
    if (generatedRolls.length === 0) { toast.error('Please generate the marks form first.'); return; }

    const seriesInt = parseInt(meta.series, 10);
    if (isNaN(seriesInt)) { toast.error('Series must be a number (19–25).'); return; }
    const ctNoInt = parseInt(meta.ctNo, 10);
    if (isNaN(ctNoInt) || ctNoInt < 1) { toast.error('CT no must be a positive integer.'); return; }

    const sheetPayload = {
      ct_no: ctNoInt,
      course_code: meta.courseCode.trim(),
      course_name: meta.courseName.trim(),
      dept: meta.department.trim(),
      section: normalizeSection(meta.section),
      series: seriesInt,
      starting_roll: startRoll.trim(),
      ending_roll: endRoll.trim(),
    };

    const entriesPayload = {
      entries: generatedRolls.map((item) => ({
        roll_no: item.roll.trim(),
        marks: normalizeMarks(item.marks),
      })),
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateTeacherResultSheet(sheetId!, sheetPayload);
        await batchUpsertTeacherResultEntries(sheetId!, entriesPayload);
      } else {
        const sheet = await createTeacherResultSheet(sheetPayload);
        if (!sheet?.id) throw new Error('Create sheet did not return id');
        await batchUpsertTeacherResultEntries(sheet.id, entriesPayload);
      }
      setUploadSuccess(true);
      toast.success(isEditing ? 'Updated successfully!' : 'Uploaded successfully!');
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload result sheet.');
    } finally {
      setIsSubmitting(false);
    }
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
        <button onClick={() => navigate('/dashboard')} className="flex h-10 w-10 items-center justify-center rounded-full mr-2.5 hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-primary" />
        </button>
        <h1 className="text-2xl font-medium text-primary">{isEditing ? 'Edit Result' : 'Create Result'}</h1>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full">
        <ResultCreateMessage isEditing={isEditing} />

        {!uploadSuccess ? (
          <>
            <MarkSheetForm
              startRoll={startRoll}
              setStartRoll={setStartRoll}
              endRoll={endRoll}
              setEndRoll={setEndRoll}
              generatedRolls={generatedRolls}
              setGeneratedRolls={setGeneratedRolls}
            />
            <ResultForm
              onFormSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
              initialValues={initialMeta}
              isEditing={isEditing}
            />
          </>
        ) : (
          <div className="px-5 space-y-5">
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-[14px] rounded-tl-[4px] bg-popover px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-foreground/10">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary-foreground">AI</span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary">Neura AI</span>
                </div>
                <p className="text-[13px] text-foreground/[0.88]">
                  {isEditing ? 'Updated successfully!' : 'Uploaded successfully!'}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleCreateNew}
                className="bg-primary text-primary-foreground rounded-full px-8 h-12 text-base font-semibold hover:opacity-90 transition-opacity"
              >
                Create New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherResultCreatePage;

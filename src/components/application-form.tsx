'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/store/use-language';
import { useDiscovery } from '@/store/use-discovery';
import { courses } from '@/data/courses';
import {
  SUBJECT_OPTIONS,
  gradesForQualification,
  type QualificationKey,
} from '@/data/entry-rules';
import {
  checkEntryEligibility,
  emptyGradeRows,
  formatGradesResultJson,
  type GradeRow,
} from '@/lib/entry-check';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  FileText,
  GraduationCap,
  Upload,
  ImageIcon,
  Plus,
  Trash2,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { buildWhatsAppUrl, buildApplyWhatsAppMessage, buildGeneralWhatsAppMessage, buildEntryHelpWhatsAppMessage } from '@/lib/contact';
import { isValidPhone, phoneValidationMessage, sanitizePhoneInput } from '@/lib/phone';

const STEPS = 6;

const QUALIFICATIONS: QualificationKey[] = [
  'SPM',
  'IGCSE',
  'UEC',
  'STPM',
  'A-Level',
  'Diploma',
  'Foundation',
];

interface ApplicationFormProps {
  preSelectedProgramme?: string;
}

export function ApplicationForm({ preSelectedProgramme }: ApplicationFormProps) {
  const { lang, t } = useLanguage();
  const { selectedProgramme, result, leadInfo } = useDiscovery();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [prefilledFromQuiz, setPrefilledFromQuiz] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const prefilledRef = useRef(false);

  const [personal, setPersonal] = useState({ name: '', email: '', phone: '' });
  const [qualification, setQualification] = useState<QualificationKey | ''>('');
  const [gradeRows, setGradeRows] = useState<GradeRow[]>(() => emptyGradeRows(3));
  const [programme, setProgramme] = useState('');
  const [documents, setDocuments] = useState({ notes: '', proofPath: '' });
  const [proofPreview, setProofPreview] = useState('');
  const [fromDiscovery, setFromDiscovery] = useState(false);

  useEffect(() => {
    const pre = preSelectedProgramme || selectedProgramme;
    if (pre) setProgramme(pre);
    if (result) setFromDiscovery(true);

    if (!prefilledRef.current && leadInfo) {
      prefilledRef.current = true;
      const phone = sanitizePhoneInput(leadInfo.phone || '');
      setPersonal({
        name: leadInfo.name || '',
        email: leadInfo.email || '',
        phone,
      });
      setPrefilledFromQuiz(true);

      const hasCompleteLead =
        Boolean(leadInfo.name?.trim()) &&
        leadInfo.email?.includes('@') &&
        isValidPhone(phone);
      if (hasCompleteLead) setStep(2);
    }
  }, [preSelectedProgramme, selectedProgramme, result, leadInfo]);

  const selectedCourse = courses.find((c) => c.id === programme);
  const progress = (step / STEPS) * 100;

  const entryCheck = useMemo(() => {
    if (!programme || !qualification) return null;
    return checkEntryEligibility(programme, qualification, gradeRows);
  }, [programme, qualification, gradeRows]);

  const gradeOptions = qualification ? gradesForQualification(qualification) : [];

  const entryHelpWaUrl = useMemo(() => {
    if (!selectedCourse || !entryCheck || entryCheck.ok) return null;
    const detail = t(
      `Credit ${entryCheck.creditCount}/${entryCheck.minCredits}${
        entryCheck.missingSubjects.length
          ? `，缺少 ${entryCheck.missingSubjects.join('、')}`
          : ''
      }`,
      `Credits ${entryCheck.creditCount}/${entryCheck.minCredits}${
        entryCheck.missingSubjects.length
          ? `, missing ${entryCheck.missingSubjects.join(', ')}`
          : ''
      }`,
    );
    return buildWhatsAppUrl(
      buildEntryHelpWhatsAppMessage(
        lang,
        lang === 'zh' ? selectedCourse.name.zh : selectedCourse.name.en,
        detail,
      ),
    );
  }, [selectedCourse, entryCheck, lang, t]);

  function canNext(): boolean {
    if (step === 1) {
      return (
        personal.name.trim() !== '' &&
        personal.email.includes('@') &&
        isValidPhone(personal.phone)
      );
    }
    if (step === 2) return programme !== '';
    if (step === 3) {
      if (!qualification) return false;
      const filled = gradeRows.filter((r) => r.subjectId && r.grade);
      if (filled.length < 3) return false;
      if (filled.some((r) => r.subjectId === 'OTHER' && !r.subjectOther.trim())) return false;
      return Boolean(entryCheck?.ok);
    }
    if (step === 6) return Boolean(entryCheck?.ok);
    return true;
  }

  function updateRow(id: string, patch: Partial<GradeRow>) {
    setGradeRows((rows) => {
      const current = rows.find((r) => r.id === id);
      if (!current) return rows;

      if (patch.subjectId && patch.subjectId !== 'OTHER') {
        const taken = rows.some((r) => r.id !== id && r.subjectId === patch.subjectId);
        if (taken) {
          toast.error(t('这科已经填过，不能重复', 'This subject is already added'));
          return rows;
        }
      }

      if (patch.subjectOther !== undefined) {
        const name = patch.subjectOther.trim().toLowerCase();
        if (name) {
          const taken = rows.some(
            (r) =>
              r.id !== id &&
              r.subjectId === 'OTHER' &&
              r.subjectOther.trim().toLowerCase() === name,
          );
          if (taken) {
            toast.error(t('这科已经填过，不能重复', 'This subject is already added'));
            return rows;
          }
        }
      }

      return rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    });
  }

  function addRow() {
    if (gradeRows.length >= 10) {
      toast.error(t('最多 10 科', 'Maximum 10 subjects'));
      return;
    }
    setGradeRows((rows) => [
      ...rows,
      {
        id: `row-${Date.now()}`,
        subjectId: '',
        subjectOther: '',
        grade: '',
      },
    ]);
  }

  function removeRow(id: string) {
    if (gradeRows.length <= 3) {
      toast.error(t('至少保留 3 科', 'Keep at least 3 subjects'));
      return;
    }
    setGradeRows((rows) => rows.filter((r) => r.id !== id));
  }

  async function handleProofUpload(file: File | null) {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error(t('请上传 JPG / PNG / WebP / PDF', 'Please upload JPG / PNG / WebP / PDF'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('文件不能超过 5MB', 'File must be under 5MB'));
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'upload failed');
      setDocuments((d) => ({ ...d, proofPath: data.path }));
      if (file.type.startsWith('image/')) {
        setProofPreview(URL.createObjectURL(file));
      } else {
        setProofPreview('');
      }
      toast.success(t('成绩证明已上传', 'Proof uploaded'));
    } catch {
      toast.error(t('上传失败，请重试', 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!isValidPhone(personal.phone)) {
      toast.error(phoneValidationMessage(lang));
      setStep(1);
      return;
    }
    if (!programme) {
      setStep(2);
      return;
    }
    if (!qualification || !entryCheck) {
      setStep(3);
      return;
    }
    if (!entryCheck.ok) {
      toast.error(
        t('成绩未达入学门槛，请调整科目成绩后再提交', 'Results do not meet entry requirements. Please update your grades before submitting.'),
      );
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      const gradesResult = formatGradesResultJson(qualification, gradeRows, entryCheck);
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personal.name,
          email: personal.email,
          phone: sanitizePhoneInput(personal.phone),
          qualification,
          gradesResult,
          programme,
          documents: documents.notes,
          proofPath: documents.proofPath || undefined,
          fromDiscovery,
          discoveryProfile: result ? JSON.stringify(result.final) : undefined,
          entryCheckOk: entryCheck.ok,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setRefId(data.referenceId || data.id || 'NEUC-' + Date.now());
      setSubmitted(true);
      toast.success(t('申请已提交！', 'Application submitted!'));
    } catch {
      toast.error(t('提交失败，请稍后重试', 'Submission failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section id="apply-section" className="py-16 px-4">
        <Card className="max-w-lg mx-auto text-center border-emerald-200">
          <CardContent className="pt-10 pb-10">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('申请已提交', 'Application Submitted')}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {t('招生团队将审核您的申请并联系您。', 'Our admissions team will review and contact you.')}
            </p>
            <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 inline-block">
              {t('参考编号', 'Reference')}: {refId}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <Button variant="outline" asChild>
                <Link href="/">{t('返回首页', 'Back to Home')}</Link>
              </Button>
              <Button className="bg-[#25D366] hover:bg-[#1fb855] text-white" asChild>
                <a
                  href={buildWhatsAppUrl(buildGeneralWhatsAppMessage(lang))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('WhatsApp 联系招生', 'WhatsApp Admissions')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
            <GraduationCap className="h-7 w-7 text-emerald-600" />
            {t('线上报名', 'Apply Online')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('步骤', 'Step')} {step}/{STEPS}
          </p>
          <Progress value={progress} className="mt-4 h-2" />
          {prefilledFromQuiz && (
            <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">
              {t(
                '已根据 Course Discovery 测验信息自动填写姓名、邮箱与电话，可返回第一步修改。',
                'Name, email and phone were pre-filled from your Course Discovery quiz. You can go back to step 1 to edit.',
              )}
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {step === 1 && t('个人资料', 'Personal Information')}
                  {step === 2 && t('选择课程', 'Programme Selection')}
                  {step === 3 && t('学术背景与成绩', 'Academic Background & Results')}
                  {step === 4 && t('成绩证明上传', 'Upload Result Proof')}
                  {step === 5 && t('确认申请', 'Review Application')}
                  {step === 6 && t('条件预检', 'Condition Pre-check')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('姓名', 'Name')} *</Label>
                      <Input
                        value={personal.name}
                        onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('邮箱', 'Email')} *</Label>
                      <Input
                        type="email"
                        value={personal.email}
                        onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('电话', 'Phone')} *</Label>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={t('例如 0123456789', 'e.g. 0123456789')}
                        value={personal.phone}
                        onChange={(e) =>
                          setPersonal({ ...personal, phone: sanitizePhoneInput(e.target.value) })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('仅数字，8–15 位', 'Digits only, 8–15 characters')}
                      </p>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>{t('申请课程', 'Programme')} *</Label>
                      <Select value={programme || ''} onValueChange={setProgramme}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('选择课程...', 'Select programme...')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {lang === 'zh' ? c.name.zh : c.name.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedCourse && (
                      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground text-sm">
                          {t('入学要求摘要', 'Entry requirements summary')}
                        </p>
                        {(lang === 'zh'
                          ? selectedCourse.entryRequirements.zh
                          : selectedCourse.entryRequirements.en
                        )
                          .slice(0, 3)
                          .map((line) => (
                            <p key={line}>• {line}</p>
                          ))}
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fromDiscovery}
                        onChange={(e) => setFromDiscovery(e.target.checked)}
                      />
                      {t(
                        '通过 Course Discovery 测验找到此课程',
                        'Found via Course Discovery Test',
                      )}
                    </label>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('最高学历', 'Highest Qualification')} *</Label>
                      <Select
                        value={qualification || ''}
                        onValueChange={(v) => {
                          setQualification(v as QualificationKey);
                          setGradeRows((rows) =>
                            rows.map((r) => ({ ...r, grade: '' })),
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('请选择', 'Select...')} />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALIFICATIONS.map((q) => (
                            <SelectItem key={q} value={q}>
                              {q === 'IGCSE' ? 'IGCSE / O-Level' : q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label>{t('成绩结果', 'Academic Results')} *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addRow}>
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          {t('添加科目', 'Add subject')}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          '请至少填写 3 科，且同一科目不能重复。有数学要求的课程会自动检查。',
                          'Enter at least 3 subjects. Each subject can only be added once. Programmes that require Math are checked automatically.',
                        )}
                      </p>

                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 text-left">
                            <tr>
                              <th className="px-2 py-2 font-medium w-8">#</th>
                              <th className="px-2 py-2 font-medium">{t('科目', 'Subject')}</th>
                              <th className="px-2 py-2 font-medium w-28">{t('成绩', 'Grade')}</th>
                              <th className="px-2 py-2 w-10" />
                            </tr>
                          </thead>
                          <tbody>
                            {gradeRows.map((row, idx) => (
                              <tr key={row.id} className="border-t align-top">
                                <td className="px-2 py-2 text-muted-foreground">{idx + 1}</td>
                                <td className="px-2 py-2 space-y-1.5">
                                  <Select
                                    value={row.subjectId || ''}
                                    onValueChange={(v) =>
                                      updateRow(row.id, { subjectId: v, subjectOther: '' })
                                    }
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder={t('选择科目', 'Subject')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SUBJECT_OPTIONS.map((s) => {
                                        const taken =
                                          s.id !== 'OTHER' &&
                                          gradeRows.some(
                                            (r) => r.id !== row.id && r.subjectId === s.id,
                                          );
                                        return (
                                          <SelectItem key={s.id} value={s.id} disabled={taken}>
                                            {lang === 'zh' ? s.zh : s.en}
                                            {taken ? t('（已填）', ' (added)') : ''}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  {row.subjectId === 'OTHER' && (
                                    <Input
                                      className="h-8"
                                      placeholder={t('科目名称', 'Subject name')}
                                      value={row.subjectOther}
                                      onChange={(e) =>
                                        updateRow(row.id, { subjectOther: e.target.value })
                                      }
                                    />
                                  )}
                                </td>
                                <td className="px-2 py-2">
                                  <Select
                                    value={row.grade || ''}
                                    onValueChange={(v) => updateRow(row.id, { grade: v })}
                                    disabled={!qualification}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="—" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {gradeOptions.map((g) => (
                                        <SelectItem key={g} value={g}>
                                          {g}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-2 py-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeRow(row.id)}
                                    disabled={gradeRows.length <= 3}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {entryCheck && (
                      <div
                        className={`rounded-lg border p-3 text-sm space-y-1.5 ${
                          entryCheck.ok
                            ? 'border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20'
                            : 'border-amber-200 bg-amber-50/60 dark:bg-amber-950/20'
                        }`}
                      >
                        <p className="font-medium flex items-center gap-1.5">
                          {entryCheck.ok ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                          {t(
                            `Credit / 达标：${entryCheck.creditCount} / 需 ${entryCheck.minCredits}`,
                            `Credits: ${entryCheck.creditCount} / need ${entryCheck.minCredits}`,
                          )}
                        </p>
                        {entryCheck.messages.map((m) => (
                          <p key={m.en} className="text-xs text-muted-foreground">
                            {lang === 'zh' ? m.zh : m.en}
                          </p>
                        ))}
                        {!entryCheck.ok && entryHelpWaUrl && (
                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground mb-2">
                              {t(
                                '暂时无法线上提交？可联系招生顾问一对一协助评估其他方案。',
                                'Unable to submit online? Chat with admissions for one-to-one advice on other options.',
                              )}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1fb855] text-white"
                              asChild
                            >
                              <a href={entryHelpWaUrl} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-1.5 h-4 w-4" />
                                {t('WhatsApp 联系客服', 'Contact advisor on WhatsApp')}
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-dashed p-4 space-y-3">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {t('成绩单 / 证明照片', 'Transcript / Proof photo')}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          '上传成绩单照片或 PDF 作为证明（选填，建议上传便于审核）',
                          'Upload transcript photo or PDF as proof (optional, recommended)',
                        )}
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => handleProofUpload(e.target.files?.[0] ?? null)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {documents.proofPath
                          ? t('重新上传', 'Re-upload')
                          : t('选择文件', 'Choose file')}
                      </Button>
                      {documents.proofPath && (
                        <p className="text-xs text-emerald-600">
                          {t('已上传', 'Uploaded')}: {documents.proofPath.split('/').pop()}
                        </p>
                      )}
                      {proofPreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proofPreview}
                          alt="proof preview"
                          className="mt-2 max-h-40 rounded-md border object-contain"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t('补充备注', 'Additional notes')}
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder={t('其他需要说明的内容…', 'Anything else we should know…')}
                        value={documents.notes}
                        onChange={(e) => setDocuments({ ...documents, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">{t('姓名', 'Name')}</dt>
                      <dd className="font-medium">{personal.name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('邮箱', 'Email')}</dt>
                      <dd className="font-medium">{personal.email}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('电话', 'Phone')}</dt>
                      <dd className="font-medium">{personal.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('课程', 'Programme')}</dt>
                      <dd className="font-medium">
                        {selectedCourse
                          ? lang === 'zh'
                            ? selectedCourse.name.zh
                            : selectedCourse.name.en
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('学历', 'Qualification')}</dt>
                      <dd className="font-medium">{qualification || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground mb-1">{t('成绩结果', 'Results')}</dt>
                      <dd>
                        <ul className="space-y-0.5">
                          {gradeRows
                            .filter((r) => r.subjectId && r.grade)
                            .map((r) => {
                              const sub =
                                r.subjectId === 'OTHER'
                                  ? r.subjectOther
                                  : SUBJECT_OPTIONS.find((s) => s.id === r.subjectId)?.[
                                      lang === 'zh' ? 'zh' : 'en'
                                    ] || r.subjectId;
                              return (
                                <li key={r.id}>
                                  {sub}: <span className="font-medium">{r.grade}</span>
                                </li>
                              );
                            })}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('成绩证明', 'Proof')}</dt>
                      <dd className="font-medium">
                        {documents.proofPath
                          ? t('已上传', 'Uploaded')
                          : t('未上传（可选）', 'Not uploaded (optional)')}
                      </dd>
                    </div>
                  </dl>
                )}

                {step === 6 && selectedCourse && entryCheck && (
                  <div
                    className={`space-y-3 text-sm rounded-lg p-4 border ${
                      entryCheck.ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200'
                    }`}
                  >
                    <p className="font-semibold flex items-center gap-2">
                      {entryCheck.ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                      {t('申请预检', 'Application Check')}
                    </p>
                    <div>
                      {t('学费', 'Tuition')}: RM {selectedCourse.tuition.toLocaleString()}
                    </div>
                    <div>
                      {t(
                        `Credit / 达标：${entryCheck.creditCount} / ${entryCheck.minCredits}`,
                        `Credits: ${entryCheck.creditCount} / ${entryCheck.minCredits}`,
                      )}
                    </div>
                    {entryCheck.messages.map((m) => (
                      <p key={m.en} className="text-xs text-muted-foreground">
                        {lang === 'zh' ? m.zh : m.en}
                      </p>
                    ))}
                    <p className="text-muted-foreground text-xs">
                      {t(
                        '必须符合基本入学门槛才能提交申请。如有疑问请联系招生顾问。',
                        'You must meet basic entry requirements to submit. Contact admissions if you need help.',
                      )}
                    </p>
                    {!entryCheck.ok && entryHelpWaUrl && (
                      <Button
                        type="button"
                        className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white"
                        asChild
                      >
                        <a href={entryHelpWaUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-1.5 h-4 w-4" />
                          {t('WhatsApp 联系客服', 'Contact advisor on WhatsApp')}
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('上一步', 'Back')}
          </Button>
          {step < STEPS ? (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!canNext()}
              onClick={() => {
                if (step === 1 && !isValidPhone(personal.phone)) {
                  toast.error(phoneValidationMessage(lang));
                  return;
                }
                setStep((s) => s + 1);
              }}
            >
              {t('下一步', 'Next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || !entryCheck?.ok}
              onClick={handleSubmit}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t('提交申请', 'Submit Application')}
            </Button>
          )}
        </div>

        {selectedCourse && (
          <p className="text-center mt-4 text-xs text-muted-foreground">
            <a
              href={buildWhatsAppUrl(
                buildApplyWhatsAppMessage(
                  lang,
                  lang === 'zh' ? selectedCourse.name.zh : selectedCourse.name.en,
                ),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              {t('或通过 WhatsApp 咨询报名', 'Or consult via WhatsApp')}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}

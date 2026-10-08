'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/store/use-language';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ScanLine,
  ServerOff,
  RefreshCw,
} from 'lucide-react';
import type {
  TranscriptExtraction,
  VerificationResult,
} from '@/lib/transcript-extract';

export type ScanStatus = 'idle' | 'scanning' | 'done' | 'error';

export interface ScanError {
  code: string;
  message: string;
  hint?: string;
}

interface TranscriptScanPanelProps {
  status: ScanStatus;
  extraction: TranscriptExtraction | null;
  verification: VerificationResult | null;
  error: ScanError | null;
  /** Milliseconds the model took, for the "read in Xs" note. */
  tookMs?: number;
  modelName?: string;
  /** Pages scanned (multi-page PDFs). */
  pages?: number;
  hasFile: boolean;
  onScan: () => void;
  onApply: () => void;
  applied: boolean;
}

export function TranscriptScanPanel({
  status,
  extraction,
  verification,
  error,
  tookMs,
  modelName,
  pages,
  hasFile,
  onScan,
  onApply,
  applied,
}: TranscriptScanPanelProps) {
  const { lang, t } = useLanguage();

  const usable = useMemo(
    () => extraction?.subjects.filter((s) => s.matched) ?? [],
    [extraction],
  );
  const unreadable = useMemo(
    () => extraction?.subjects.filter((s) => !s.matched) ?? [],
    [extraction],
  );

  const mismatches = verification?.items.filter((i) => i.kind === 'mismatch') ?? [];
  const missingInForm = verification?.items.filter((i) => i.kind === 'missing_in_form') ?? [];

  if (!hasFile && status === 'idle') return null;

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            {t('AI 自动读取成绩', 'AI result reader')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              '使用本地 AI 模型读取你上传的成绩单，自动填入科目与成绩。资料不会离开本机。',
              'Reads your uploaded slip with a local AI model and fills in your subjects. Nothing leaves this server.',
            )}
          </p>
        </div>
        {status !== 'scanning' && (
          <Button
            type="button"
            size="sm"
            variant={status === 'done' ? 'outline' : 'default'}
            className={status === 'done' ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
            onClick={onScan}
            disabled={!hasFile}
          >
            {status === 'done' || status === 'error' ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <ScanLine className="h-3.5 w-3.5 mr-1.5" />
            )}
            {status === 'done' || status === 'error'
              ? t('重新扫描', 'Scan again')
              : t('扫描成绩单', 'Scan result slip')}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {status === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 text-sm"
          >
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>
              {t(
                '正在读取成绩单…首次使用需要载入模型，可能需要 10–60 秒。',
                'Reading your slip… the first run loads the model and can take 10–60s.',
              )}
            </span>
          </motion.div>
        )}

        {status === 'error' && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-sm space-y-1"
          >
            <p className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-200">
              {error.code === 'unreachable' || error.code === 'model_missing' ? (
                <ServerOff className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {error.message}
            </p>
            {error.hint && (
              <p className="text-xs text-amber-800/80 dark:text-amber-200/70">{error.hint}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t(
                '你仍然可以手动填写成绩，扫描只是辅助功能。',
                'You can still fill in your grades manually — scanning is optional.',
              )}
            </p>
          </motion.div>
        )}

        {status === 'done' && extraction && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                {t(`读取到 ${usable.length} 科`, `${usable.length} subjects read`)}
              </span>
              {extraction.qualification && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  {extraction.qualification}
                </span>
              )}
              {extraction.examYear && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  {extraction.examYear}
                </span>
              )}
              {typeof pages === 'number' && pages > 1 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  {t(`${pages} 页`, `${pages} pages`)}
                </span>
              )}
              {typeof tookMs === 'number' && (
                <span className="text-muted-foreground">
                  {(tookMs / 1000).toFixed(1)}s{modelName ? ` · ${modelName}` : ''}
                </span>
              )}
            </div>

            {usable.length > 0 && (
              <div className="overflow-hidden rounded-md border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs">
                    <tr>
                      <th className="px-2.5 py-1.5 font-medium">{t('科目', 'Subject')}</th>
                      <th className="px-2.5 py-1.5 font-medium w-24">
                        {t('成绩', 'Grade')}
                      </th>
                      <th className="px-2.5 py-1.5 font-medium w-28">
                        {t('原文', 'As printed')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usable.map((s, i) => (
                      <tr key={`${s.subjectId}-${i}`} className="border-t">
                        <td className="px-2.5 py-1.5">
                          {lang === 'zh' ? s.label.zh : s.label.en}
                        </td>
                        <td className="px-2.5 py-1.5 font-medium">{s.grade}</td>
                        <td className="px-2.5 py-1.5 text-xs text-muted-foreground truncate">
                          {s.rawSubject} · {s.rawGrade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {unreadable.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {t(
                  `${unreadable.length} 科成绩无法辨识（${unreadable
                    .map((s) => s.rawSubject)
                    .join('、')}），请手动填写。`,
                  `${unreadable.length} subject(s) could not be read (${unreadable
                    .map((s) => s.rawSubject)
                    .join(', ')}). Please enter them manually.`,
                )}
              </p>
            )}

            {verification?.checked && (
              <div
                className={`rounded-md border px-3 py-2.5 text-sm space-y-1.5 ${
                  mismatches.length
                    ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30'
                }`}
              >
                <p className="flex items-center gap-2 font-medium">
                  {mismatches.length ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {mismatches.length
                    ? t('成绩与证明不一致', 'Grades differ from your proof')
                    : t('成绩与证明一致', 'Grades match your proof')}
                </p>

                {mismatches.map((item) => (
                  <p key={item.subjectId} className="text-xs flex items-center gap-1.5">
                    <XCircle className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>
                      {lang === 'zh' ? item.label.zh : item.label.en}:{' '}
                      {t('你填写', 'you entered')}{' '}
                      <strong>{item.formGrade}</strong> ·{' '}
                      {t('成绩单显示', 'slip shows')}{' '}
                      <strong>{item.proofGrade}</strong>
                    </span>
                  </p>
                ))}

                {missingInForm.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      `成绩单另有 ${missingInForm.length} 科未填入表格。`,
                      `${missingInForm.length} subject(s) on the slip are not in your form.`,
                    )}
                  </p>
                )}

                {verification.unverified > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      `${verification.unverified} 科未在成绩单中找到。`,
                      `${verification.unverified} subject(s) were not found on the slip.`,
                    )}
                  </p>
                )}
              </div>
            )}

            {usable.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={onApply}
                >
                  {applied
                    ? t('重新填入成绩', 'Re-apply to form')
                    : t('填入成绩表格', 'Fill my grades')}
                </Button>
                {applied && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="inline h-3 w-3 mr-1" />
                    {t('已填入第 3 步，请核对后再提交。', 'Applied to step 3 — please double-check.')}
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t(
                'AI 读取仅供参考，请务必核对每一科成绩，最终以正本成绩单为准。',
                'AI reading is a helper only — always verify each grade against your original slip.',
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

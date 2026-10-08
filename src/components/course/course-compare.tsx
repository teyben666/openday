'use client';

import { useEffect, useRef, useState } from 'react';
import { useComparison } from '@/store/use-comparison';
import { useLanguage } from '@/store/use-language';
import { courses } from '@/data/courses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, GraduationCap, ArrowLeftRight } from 'lucide-react';
import type { Course } from '@/data/courses';
import { cn } from '@/lib/utils';

type BilingualField = { zh: string; en: string };

interface CourseCompareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeLabels: Record<string, { zh: string; en: string }> = {
  bachelor: { zh: '学士', en: 'Bachelor' },
  foundation: { zh: '基础', en: 'Foundation' },
  diploma: { zh: '文凭', en: 'Diploma' },
};

const LABEL_W = 88;
const HEADER_H = 76;

function bf(field: BilingualField | undefined, lang: 'zh' | 'en'): string {
  if (!field) return '-';
  return lang === 'zh' ? field.zh : field.en;
}

function truncate(str: string, maxLines: number): string {
  const lines = str.split('\n');
  if (lines.length <= maxLines) return str;
  return lines.slice(0, maxLines).join('\n') + '...';
}

function formatTuition(amount: number): string {
  return `RM ${amount.toLocaleString()}`;
}

type RowDef = {
  key: string;
  label: string;
  alt?: boolean;
  render: (course: Course) => React.ReactNode;
};

export function CourseCompare({ open, onOpenChange }: CourseCompareProps) {
  const { selectedIds, remove, clear, swap } = useComparison();
  const { lang, t } = useLanguage();
  const coursePaneRef = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(150);
  const [isCompact, setIsCompact] = useState(false);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [scrollTop, setScrollTop] = useState(0);

  const selectedCourses = selectedIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as Course[];

  const hasCourses = selectedCourses.length > 0;
  const n = selectedCourses.length;
  const canSwipe = isCompact && n >= 3;

  const rows: RowDef[] = [
    {
      key: 'name',
      label: t('课程名称', 'Course'),
      render: (c) => <span className="font-medium">{bf(c.name, lang)}</span>,
    },
    {
      key: 'dept',
      label: t('院系', 'Department'),
      alt: true,
      render: (c) => <span>{bf(c.department, lang)}</span>,
    },
    {
      key: 'duration',
      label: t('学制', 'Duration'),
      render: (c) => <span>{bf(c.duration, lang)}</span>,
    },
    {
      key: 'tuition',
      label: t('学费', 'Tuition'),
      alt: true,
      render: (c) => (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          {formatTuition(c.tuition)}
        </span>
      ),
    },
    {
      key: 'intakes',
      label: t('入学月份', 'Intakes'),
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.intakes.map((intake) => (
            <Badge key={intake} variant="outline" className="text-xs font-normal">
              {intake}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'lang',
      label: t('授课语言', 'Language'),
      alt: true,
      render: (c) => <span>{bf(c.language, lang)}</span>,
    },
    {
      key: 'desc',
      label: t('简介', 'Description'),
      render: (c) => (
        <span className="leading-relaxed text-muted-foreground">
          {truncate(bf(c.description, lang), 2)}
        </span>
      ),
    },
    {
      key: 'entry',
      label: t('入学要求', 'Entry Req.'),
      alt: true,
      render: (c) => (
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          {c.entryRequirements[lang].slice(0, 2).map((item, i) => (
            <li key={i} className="text-xs leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'careers',
      label: t('就业前景', 'Careers'),
      render: (c) => (
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          {c.careerProspects[lang].slice(0, 3).map((item, i) => (
            <li key={i} className="text-xs leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsCompact(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Mobile: 2 course columns fit in the course pane (label pane is outside)
  useEffect(() => {
    const el = coursePaneRef.current;
    if (!el || !open || !isCompact) return;

    const update = () => {
      const next = Math.max(140, Math.floor(el.clientWidth / 2));
      setColW((prev) => (Math.abs(prev - next) > 2 ? next : prev));
    };
    const id = requestAnimationFrame(update);
    const ro = new ResizeObserver(() => requestAnimationFrame(update));
    ro.observe(el);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [open, n, isCompact]);

  // Measure course row heights so label rows match (keeps horizontal lines aligned)
  useEffect(() => {
    const pane = coursePaneRef.current;
    if (!pane || !open || !hasCourses) return;

    const measure = () => {
      const heights: number[] = [];
      for (let r = 0; r < rows.length; r++) {
        const cells = pane.querySelectorAll(`[data-compare-row="${r}"]`);
        let max = 0;
        cells.forEach((el) => {
          max = Math.max(max, el.getBoundingClientRect().height);
        });
        heights.push(max || 0);
      }
      setRowHeights(heights);
    };

    const id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(pane);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [open, hasCourses, n, colW, isCompact, lang]);

  useEffect(() => {
    if (!open) {
      coursePaneRef.current?.scrollTo({ left: 0, top: 0 });
      setScrollTop(0);
    }
  }, [open]);

  const cellPad = 'px-2.5 py-3 text-xs sm:px-3 sm:text-sm';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          '!flex h-[min(92vh,900px)] max-h-[92vh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0',
          'sm:max-w-5xl',
        )}
      >
        <DialogHeader className="shrink-0 space-y-0 border-b px-4 pb-4 pt-5 pr-12 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-5 w-5 shrink-0 text-emerald-600" />
                {t('课程对比', 'Course Comparison')}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {canSwipe
                  ? t(
                      '左右滑动切换对比 · 下方可调换位置',
                      'Swipe to switch pairs · swap below',
                    )
                  : t(
                      '最多可选择3个课程进行比较 · 下方可调换位置',
                      'Compare up to 3 courses · swap below the titles',
                    )}
              </DialogDescription>
            </div>
            {hasCourses && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {t('清空', 'Clear All')}
              </Button>
            )}
          </div>
        </DialogHeader>

        {!hasCourses ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">
              {t('尚未选择任何课程进行对比', 'No courses selected for comparison')}
            </p>
            <p className="mt-1 text-center text-sm text-muted-foreground/70">
              {t(
                '请在课程列表中点击「对比」按钮添加课程',
                'Click the compare button on course cards to add them',
              )}
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {n >= 2 && (
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b bg-emerald-50/80 px-3 py-2.5 dark:bg-emerald-950/30">
                {selectedCourses.slice(0, -1).map((course, i) => (
                  <button
                    key={`${course.id}-swap`}
                    type="button"
                    onClick={() => swap(i, i + 1)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span className="max-w-[5.5rem] truncate sm:max-w-[8rem]">
                      {bf(course.name, lang)}
                    </span>
                    <span className="text-emerald-500">⇄</span>
                    <span className="max-w-[5.5rem] truncate sm:max-w-[8rem]">
                      {bf(selectedCourses[i + 1].name, lang)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Label rail has NO scrollbar — mirrors course pane vertical scroll via transform */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div
                className="relative flex shrink-0 flex-col overflow-hidden border-r border-border bg-background"
                style={{ width: LABEL_W }}
              >
                <div
                  className="z-20 flex shrink-0 items-end border-b border-border bg-emerald-600 px-2 pb-3 pt-3 text-[11px] font-medium text-emerald-100"
                  style={{ height: HEADER_H }}
                >
                  {t('项目', 'Field')}
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <div
                    className="will-change-transform"
                    style={{ transform: `translateY(${-scrollTop}px)` }}
                  >
                    {rows.map((row, i) => (
                      <div
                        key={row.key}
                        className={cn(
                          'flex items-start border-b border-border px-2 py-3 text-xs font-medium text-muted-foreground sm:text-sm',
                          row.alt ? 'bg-muted' : 'bg-background',
                        )}
                        style={rowHeights[i] ? { height: rowHeights[i] } : undefined}
                      >
                        {row.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                ref={coursePaneRef}
                onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                className={cn(
                  'min-w-0 flex-1 overflow-auto overscroll-contain',
                  canSwipe && 'snap-x snap-proximity',
                )}
              >
                <div
                  className="grid"
                  style={{
                    width: isCompact ? n * colW : '100%',
                    minWidth: isCompact ? n * colW : '100%',
                    gridTemplateColumns: isCompact
                      ? `repeat(${n}, ${colW}px)`
                      : `repeat(${n}, minmax(0, 1fr))`,
                  }}
                >
                  {selectedCourses.map((course) => (
                    <div
                      key={`h-${course.id}`}
                      className={cn(
                        'sticky top-0 z-10 flex flex-col gap-1 border-b border-border bg-emerald-600 px-2.5 py-3 text-white sm:px-3',
                        canSwipe && 'snap-start',
                      )}
                      style={{ height: HEADER_H }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <Badge
                            variant="secondary"
                            className="mb-1 w-fit border-emerald-400/30 bg-emerald-500/30 px-1.5 text-[10px] text-emerald-100"
                          >
                            {bf(typeLabels[course.type], lang)}
                          </Badge>
                          <p className="line-clamp-2 text-sm font-semibold leading-tight">
                            {bf(course.name, lang)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(course.id)}
                          className="h-7 w-7 shrink-0 p-0 text-white/70 hover:bg-emerald-500/50 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {rows.map((row, rowIndex) =>
                    selectedCourses.map((course) => (
                      <div
                        key={`${row.key}-${course.id}`}
                        data-compare-row={rowIndex}
                        className={cn(
                          'min-w-0 break-words border-b border-border',
                          cellPad,
                          row.alt ? 'bg-muted' : 'bg-background',
                        )}
                      >
                        {row.render(course)}
                      </div>
                    )),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

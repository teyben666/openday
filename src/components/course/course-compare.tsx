'use client';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, GraduationCap } from 'lucide-react';
import type { Course } from '@/data/courses';

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

function ComparisonRow({
  label,
  selectedCourses,
  lang,
  render,
}: {
  label: string;
  selectedCourses: Course[];
  lang: 'zh' | 'en';
  render: (course: Course) => React.ReactNode;
}) {
  const isAlt = courses.indexOf(selectedCourses[0]) % 2 === 0;

  return (
    <div
      className={`grid gap-4 ${
        selectedCourses.length === 2
          ? 'grid-cols-[140px_1fr_1fr]'
          : 'grid-cols-[140px_1fr_1fr_1fr]'
      } border-b py-3 px-4 ${isAlt ? 'bg-muted/40' : 'bg-background'}`}
    >
      <div className="text-sm font-medium text-muted-foreground flex items-center">
        {label}
      </div>
      {selectedCourses.map((course) => (
        <div key={course.id} className="text-sm">
          {render(course)}
        </div>
      ))}
    </div>
  );
}

export function CourseCompare({ open, onOpenChange }: CourseCompareProps) {
  const { selectedIds, remove, clear } = useComparison();
  const { lang, t } = useLanguage();

  const selectedCourses = selectedIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as Course[];

  const hasCourses = selectedCourses.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                {t('课程对比', 'Course Comparison')}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {t(
                  '最多可选择3个课程进行比较',
                  'Compare up to 3 courses side by side'
                )}
              </DialogDescription>
            </div>
            {hasCourses && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('清空', 'Clear All')}
              </Button>
            )}
          </div>
        </DialogHeader>

        {!hasCourses ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              {t(
                '尚未选择任何课程进行对比',
                'No courses selected for comparison'
              )}
            </p>
            <p className="text-sm text-muted-foreground/70 text-center mt-1">
              {t(
                '请在课程列表中点击「对比」按钮添加课程',
                'Click the compare button on course cards to add them'
              )}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <div className="min-w-[600px]">
              {/* Column headers with course names */}
              <div
                className={`grid gap-4 sticky top-0 z-10 bg-emerald-600 text-white py-3 px-4 ${
                  selectedCourses.length === 2
                    ? 'grid-cols-[140px_1fr_1fr]'
                    : 'grid-cols-[140px_1fr_1fr_1fr]'
                }`}
              >
                <div />
                {selectedCourses.map((course) => (
                  <div key={course.id} className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/30 text-emerald-100 border-emerald-400/30 w-fit text-[10px] px-1.5"
                        >
                          {bf(typeLabels[course.type], lang)}
                        </Badge>
                        <span className="font-semibold text-sm leading-tight">
                          {bf(course.name, lang)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(course.id)}
                        className="text-white/70 hover:text-white hover:bg-emerald-500/50 h-7 w-7 p-0 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison rows */}
              <ComparisonRow
                label={t('课程名称', 'Course')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => (
                  <span className="font-medium">{bf(course.name, lang)}</span>
                )}
              />

              <ComparisonRow
                label={t('院系', 'Department')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => <span>{bf(course.department, lang)}</span>}
              />

              <ComparisonRow
                label={t('学制', 'Duration')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => <span>{bf(course.duration, lang)}</span>}
              />

              <ComparisonRow
                label={t('学费', 'Tuition')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatTuition(course.tuition)}
                  </span>
                )}
              />

              <ComparisonRow
                label={t('入学月份', 'Intakes')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => (
                  <div className="flex flex-wrap gap-1">
                    {course.intakes.map((intake) => (
                      <Badge
                        key={intake}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {intake}
                      </Badge>
                    ))}
                  </div>
                )}
              />

              <ComparisonRow
                label={t('授课语言', 'Language')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => <span>{bf(course.language, lang)}</span>}
              />

              <ComparisonRow
                label={t('简介', 'Description')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => (
                  <span className="text-muted-foreground leading-relaxed">
                    {truncate(bf(course.description, lang), 2)}
                  </span>
                )}
              />

              <ComparisonRow
                label={t('入学要求', 'Entry Req.')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => {
                  const reqs = course.entryRequirements[lang];
                  return (
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                      {reqs.slice(0, 2).map((item, i) => (
                        <li key={i} className="text-xs leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }}
              />

              <ComparisonRow
                label={t('就业前景', 'Careers')}
                selectedCourses={selectedCourses}
                lang={lang}
                render={(course) => {
                  const careers = course.careerProspects[lang];
                  return (
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                      {careers.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }}
              />
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { courses, type Course, type CourseType } from '@/data/courses';
import { FACULTIES, facultyOf, facultySort } from '@/data/faculties';
import { cn } from '@/lib/utils';

type TypeFilter = 'all' | CourseType;

const TYPE_LABEL: Record<CourseType, { zh: string; en: string }> = {
  bachelor: { zh: '学士', en: 'Degree' },
  diploma: { zh: '文凭', en: 'Diploma' },
  foundation: { zh: '预科', en: 'Foundation' },
};

const TYPE_BADGE: Record<CourseType, string> = {
  bachelor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  diploma: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  foundation: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
};

interface ProgrammePickerProps {
  value: string;
  onChange: (id: string) => void;
  lang: 'zh' | 'en';
  /** Course ids recommended by the Discovery quiz, best first. */
  recommendedIds?: string[];
  /** Returns true when the student's qualification cannot enter this course. */
  isUnavailable?: (course: Course) => boolean;
}

function keywordsFor(course: Course): string[] {
  const faculty = facultyOf(course);
  return [
    course.code,
    course.name.zh,
    course.name.en,
    course.department.zh,
    course.department.en,
    TYPE_LABEL[course.type].zh,
    TYPE_LABEL[course.type].en,
    ...(faculty ? [faculty.zh, faculty.en] : []),
  ];
}

export function ProgrammePicker({
  value,
  onChange,
  lang,
  recommendedIds = [],
  isUnavailable,
}: ProgrammePickerProps) {
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en);

  const { recommended, groups } = useMemo(() => {
    const visible = courses.filter((c) => typeFilter === 'all' || c.type === typeFilter);
    const recSet = new Set(recommendedIds);
    const rec = recommendedIds
      .map((id) => visible.find((c) => c.id === id))
      .filter((c): c is Course => Boolean(c));
    const rest = visible.filter((c) => !recSet.has(c.id)).sort(facultySort);
    const byFaculty = FACULTIES.map((f) => ({
      faculty: f,
      items: rest.filter((c) => c.color === f.key),
    })).filter((g) => g.items.length > 0);
    return { recommended: rec, groups: byFaculty };
  }, [typeFilter, recommendedIds]);

  const selected = courses.find((c) => c.id === value);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
  }

  function renderItem(course: Course) {
    const unavailable = isUnavailable?.(course) ?? false;
    const faculty = facultyOf(course);
    return (
      <CommandItem
        key={course.id}
        value={course.id}
        keywords={keywordsFor(course)}
        disabled={unavailable}
        onSelect={() => pick(course.id)}
        className="items-start gap-2 py-2"
      >
        <Check className={cn('mt-0.5 h-4 w-4', value === course.id ? 'opacity-100' : 'opacity-0')} />
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: faculty?.hex ?? '#94a3b8' }}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{lang === 'zh' ? course.name.zh : course.name.en}</span>
            <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium', TYPE_BADGE[course.type])}>
              {TYPE_LABEL[course.type][lang]}
            </span>
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {course.code} · {t(`${course.durationYears} 年`, `${course.durationYears} yr${course.durationYears === 1 ? '' : 's'}`)} · RM{' '}
            {course.tuition.toLocaleString()}
          </span>
          {unavailable && (
            <span className="block text-xs text-amber-600">
              {t('你的学历需先读预科 / 文凭', 'Your qualification needs a Foundation / Diploma first')}
            </span>
          )}
        </span>
      </CommandItem>
    );
  }

  const filters: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: t('全部', 'All') },
    { key: 'bachelor', label: TYPE_LABEL.bachelor[lang] },
    { key: 'diploma', label: TYPE_LABEL.diploma[lang] },
    { key: 'foundation', label: TYPE_LABEL.foundation[lang] },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-10 w-full justify-between px-3 py-2 font-normal"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2 text-left">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: facultyOf(selected)?.hex ?? '#94a3b8' }}
                aria-hidden
              />
              <span className="truncate">{lang === 'zh' ? selected.name.zh : selected.name.en}</span>
              <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium', TYPE_BADGE[selected.type])}>
                {TYPE_LABEL[selected.type][lang]}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{t('搜索或选择课程…', 'Search or pick a programme…')}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(32rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('输入课程名称、代码或学系，例如 BCS、心理', 'Type a name, code or department, e.g. BCS, psychology')} />
          <div className="flex gap-1.5 border-b px-2 py-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setTypeFilter(f.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  typeFilter === f.key
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <CommandList className="max-h-[min(24rem,60vh)]">
            <CommandEmpty>{t('找不到相关课程', 'No matching programme')}</CommandEmpty>
            {recommended.length > 0 && (
              <CommandGroup
                heading={
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    {t('为你推荐（来自课程测验）', 'Recommended for you (from your quiz)')}
                  </span>
                }
              >
                {recommended.map(renderItem)}
              </CommandGroup>
            )}
            {groups.map(({ faculty, items }) => (
              <CommandGroup
                key={faculty.key}
                heading={
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: faculty.hex }} aria-hidden />
                    {lang === 'zh' ? faculty.zh : faculty.en}
                  </span>
                }
              >
                {items.map(renderItem)}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

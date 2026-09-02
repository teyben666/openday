'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, GitCompareArrows, Eye } from 'lucide-react';
import type { Course } from '@/data/courses';
import { useLanguage } from '@/store/use-language';
import { useComparison } from '@/store/use-comparison';

interface CourseCardProps {
  course: Course;
  onViewDetail: (id: string) => void;
  showCompare?: boolean;
}

const typeLabel: Record<string, { zh: string; en: string }> = {
  bachelor: { zh: '学士', en: 'Bachelor' },
  diploma: { zh: '文凭', en: 'Diploma' },
  foundation: { zh: '基础', en: 'Foundation' },
};

const typeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  bachelor: 'default',
  diploma: 'secondary',
  foundation: 'outline',
};

/**
 * Maps a course color name to a Tailwind background class.
 * We use a lookup so Tailwind can statically detect the classes.
 */
const colorStripMap: Record<string, string> = {
  amber: 'bg-amber-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  fuchsia: 'bg-fuchsia-500',
  lime: 'bg-lime-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-500',
  stone: 'bg-stone-500',
  teal: 'bg-teal-500',
  violet: 'bg-violet-500',
  yellow: 'bg-yellow-500',
};

export default function CourseCard({ course, onViewDetail, showCompare = true }: CourseCardProps) {
  const { lang, t } = useLanguage();
  const { isSelected, toggle } = useComparison();
  const selected = isSelected(course.id);

  const formatTuition = (fee: number) =>
    `RM ${fee.toLocaleString('en-MY')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="h-full"
    >
      <Card className="relative flex h-full flex-col overflow-hidden border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-lg">
        {/* Color accent strip */}
        <div
          className={`absolute left-0 top-0 h-full w-1.5 rounded-l-lg ${colorStripMap[course.color] ?? 'bg-slate-500'}`}
        />

        <CardContent className="flex flex-1 flex-col gap-3 p-5 pl-5 sm:pl-6">
          {/* Top row: type badge + compare button */}
          <div className="flex items-center justify-between">
            <Badge variant={typeVariant[course.type] as 'default' | 'secondary' | 'outline'} className="text-xs font-medium">
              {typeLabel[course.type][lang]}
            </Badge>

            {showCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(course.id);
                }}
                aria-label={t('加入对比', 'Add to Compare')}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {selected ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <GitCompareArrows className="h-3.5 w-3.5" />
                )}
                {t('对比', 'Compare')}
              </button>
            )}
          </div>

          {/* Course name */}
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
              {course.name[lang]}
            </h3>
            <p className="text-sm text-muted-foreground">{course.department[lang]}</p>
          </div>

          {/* Info rows */}
          <div className="mt-auto space-y-2 pt-1">
            {/* Tuition & Duration */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">{formatTuition(course.tuition)}</span>
              <span className="text-muted-foreground">{course.duration[lang]}</span>
            </div>

            {/* Intake badges */}
            <div className="flex flex-wrap gap-1.5">
              {course.intakes.map((intake) => (
                <Badge key={intake} variant="outline" className="text-[11px] font-normal">
                  {intake}
                </Badge>
              ))}
              <Badge variant="outline" className="text-[11px] font-normal">
                {course.language[lang]}
              </Badge>
            </div>

            {/* View detail button */}
            <Button
              variant="outline"
              size="sm"
              className="mt-1 w-full"
              onClick={() => onViewDetail(course.id)}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {t('查看详情', 'View Details')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

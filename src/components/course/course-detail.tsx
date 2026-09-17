'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  GitCompareArrows,
  Check,
  CircleDot,
  BookOpen,
  Briefcase,
  ClipboardList,
  Clock,
  DollarSign,
  Globe,
  Award,
  Bookmark,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import type { Course } from '@/data/courses';
import { useLanguage } from '@/store/use-language';
import { useComparison } from '@/store/use-comparison';
import { useShortlist } from '@/store/use-discovery';
import { useDiscovery } from '@/store/use-discovery';
import { buildWhatsAppUrl, buildDiscoveryWhatsAppMessage } from '@/lib/contact';
import { cn } from '@/lib/utils';

interface CourseDetailProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeLabel: Record<string, { zh: string; en: string }> = {
  bachelor: { zh: '学士', en: 'Bachelor' },
  diploma: { zh: '文凭', en: 'Diploma' },
  foundation: { zh: '基础', en: 'Foundation' },
};

const typeBadgeClass: Record<string, string> = {
  bachelor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
  diploma: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
  foundation: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400',
};

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

export default function CourseDetail({ course, open, onOpenChange }: CourseDetailProps) {
  const { lang, t } = useLanguage();
  const { isSelected, toggle } = useComparison();
  const { toggle: toggleShortlist, isInShortlist } = useShortlist();
  const { setSelectedProgramme } = useDiscovery();

  if (!course) return null;

  const selected = isSelected(course.id);

  const formatTuition = (fee: number) => `RM ${fee.toLocaleString('en-MY')}`;

  const infoItems = [
    { icon: Award, label: t('学制', 'Duration'), value: course.duration[lang] },
    { icon: Clock, label: t('入学月份', 'Intakes'), value: course.intakes.join(', ') },
    { icon: DollarSign, label: t('学费', 'Tuition'), value: formatTuition(course.tuition) },
    { icon: Globe, label: t('授课语言', 'Language'), value: course.language[lang] },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          '!flex w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0',
          'h-[min(92vh,900px)] max-h-[92vh]',
          'sm:max-w-4xl sm:rounded-xl',
        )}
      >
        {/* Color strip at top */}
        <div className={`h-1.5 w-full shrink-0 ${colorStripMap[course.color] ?? 'bg-slate-500'}`} />

        <DialogHeader className="shrink-0 space-y-1.5 px-6 pt-5 pb-3 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={typeBadgeClass[course.type]}>
              {typeLabel[course.type][lang]}
            </Badge>
            <span className="text-xs text-muted-foreground">{course.mqaNo}</span>
            <Badge variant="outline" className="text-[11px]">
              {course.accreditation}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold leading-tight">
            {course.name[lang]}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {course.department[lang]}
          </DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:gap-0">
            {/* Left column - Info */}
            <div className="space-y-4 sm:pr-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {infoItems.map((item) => (
                  <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <Separator className="sm:hidden" />

              {/* Description */}
              <div>
                <h4 className="mb-1.5 text-sm font-semibold text-foreground">
                  {t('课程简介', 'Description')}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {course.description[lang]}
                </p>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                <h4 className="text-sm font-semibold mb-2">{t('适合你如果…', 'This course may suit you if…')}</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ {t('对该领域有兴趣', 'You are interested in this field')}</li>
                  <li>✓ {t('愿意投入时间学习相关技能', 'You are willing to invest time in related skills')}</li>
                  <li>✓ {t('符合基本入学资格', 'You meet basic entry requirements')}</li>
                </ul>
              </div>
            </div>

            {/* Right column - Tabs */}
            <div className="sm:border-l sm:pl-4">
              <Tabs defaultValue="subjects" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="subjects" className="gap-1 text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('课程设置', 'Subjects')}</span>
                    <span className="sm:hidden">{t('课程', 'Subjects')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="requirements" className="gap-1 text-xs">
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('入学资格', 'Entry Req.')}</span>
                    <span className="sm:hidden">{t('资格', 'Entry')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="careers" className="gap-1 text-xs">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('生涯展望', 'Careers')}</span>
                    <span className="sm:hidden">{t('前景', 'Career')}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="subjects" className="mt-3">
                  <ul className="space-y-1.5 pr-1">
                    {course.subjects[lang].map((subject, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <CircleDot className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />
                        {subject}
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="requirements" className="mt-3">
                  <ul className="space-y-1.5 pr-1">
                    {course.entryRequirements[lang].map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <CircleDot className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="careers" className="mt-3">
                  <ul className="space-y-1.5 pr-1">
                    {course.careerProspects[lang].map((career, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <CircleDot className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />
                        {career}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <Separator className="shrink-0" />

        {/* Bottom actions */}
        <div className="flex shrink-0 flex-col gap-2 border-t bg-background p-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              variant={isInShortlist(course.id) ? 'default' : 'outline'}
              className={isInShortlist(course.id) ? 'bg-teal-600 hover:bg-teal-700' : ''}
              onClick={() => toggleShortlist(course.id)}
            >
              <Bookmark className="mr-1.5 h-4 w-4" />
              {isInShortlist(course.id) ? t('已收藏', 'Saved') : t('加入收藏', 'Shortlist')}
            </Button>

            <Button
              variant={selected ? 'default' : 'outline'}
              className={selected ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => toggle(course.id)}
            >
              {selected ? <Check className="mr-1.5 h-4 w-4" /> : <GitCompareArrows className="mr-1.5 h-4 w-4" />}
              {selected ? t('已加入对比', 'Added to Compare') : t('加入对比', 'Add to Compare')}
            </Button>

            <Button variant="outline" className="bg-[#25D366]/10 border-[#25D366]/40 hover:bg-[#25D366]/20" asChild>
              <a
                href={buildWhatsAppUrl(
                  buildDiscoveryWhatsAppMessage(lang, lang === 'zh' ? course.name.zh : course.name.en),
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" />
                {t('WhatsApp 咨询', 'WhatsApp Enquiry')}
              </a>
            </Button>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setSelectedProgramme(course.id);
                onOpenChange(false);
                window.location.href = '/apply';
              }}
            >
              <GraduationCap className="mr-1.5 h-4 w-4" />
              {t('立即报名', 'Apply Now')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

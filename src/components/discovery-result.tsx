'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DIMENSIONS, dimensionLabels } from '@/data/dimensions';
import type { DiscoveryResult, CourseRecommendation } from '@/lib/course-matching';
import type { Course } from '@/data/courses';
import { useLanguage } from '@/store/use-language';
import { useComparison } from '@/store/use-comparison';
import { useDiscovery, useShortlist } from '@/store/use-discovery';
import { useCourseUi } from '@/components/site-layout';
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from '@/lib/contact';
import {
  RotateCcw,
  GitCompareArrows,
  Eye,
  CheckCircle2,
  MessageCircle,
  Bookmark,
  Pencil,
  Compass,
} from 'lucide-react';

const tierLabels = {
  gold: { zh: '🥇 最适合探索', en: '🥇 Most Worth Exploring', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  silver: { zh: '🥈 也值得考虑', en: '🥈 Also Worth Considering', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  bronze: { zh: '🥉 跨领域尝试', en: '🥉 Cross-Field Option', color: 'bg-teal-100 text-teal-800 border-teal-300' },
};

function DimensionBar({
  dim,
  score,
  interest,
  strength,
}: {
  dim: (typeof DIMENSIONS)[number];
  score: number;
  interest: number;
  strength: number;
}) {
  const { lang } = useLanguage();
  const label = dimensionLabels[dim];
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label.emoji} {lang === 'zh' ? label.zh : label.en}</span>
        <span className="font-semibold text-emerald-600">{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
        />
      </div>
      {Math.abs(interest - strength) > 25 && (
        <p className="text-[10px] text-amber-600">
          {lang === 'zh'
            ? `兴趣 ${interest}% vs 能力 ${strength}%`
            : `Interest ${interest}% vs Strength ${strength}%`}
        </p>
      )}
    </div>
  );
}

function RecCard({ rec, onViewDetail, onCompare }: {
  rec: CourseRecommendation;
  onViewDetail: (id: string) => void;
  onCompare: (c: Course) => void;
}) {
  const { lang, t } = useLanguage();
  const { toggle: toggleShortlist, isInShortlist } = useShortlist();
  const { course, tier, reasons, level } = rec;
  const tierInfo = tierLabels[tier];

  return (
    <Card className="overflow-hidden border hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <Badge variant="outline" className={`mb-2 ${tierInfo.color}`}>
          {lang === 'zh' ? tierInfo.zh : tierInfo.en}
        </Badge>
        <h4 className="font-bold">{lang === 'zh' ? course.name.zh : course.name.en}</h4>
        <p className="text-xs text-gray-500 mt-1">
          {lang === 'zh' ? course.department.zh : course.department.en} · RM {course.tuition.toLocaleString()}
        </p>
        <ul className="mt-3 space-y-1">
          {reasons.map((r) => (
            <li key={r.en} className="text-xs text-gray-600 flex gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              {lang === 'zh' ? r.zh : r.en}
            </li>
          ))}
        </ul>
        {level === 'strong' && <p className="text-[10px] text-emerald-600 mt-2">🟢 {t('非常值得了解', 'Highly worth exploring')}</p>}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => onViewDetail(course.id)}>
            <Eye className="h-3.5 w-3.5 mr-1" />{t('详情', 'Details')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCompare(course)}>
            <GitCompareArrows className="h-3.5 w-3.5 mr-1" />{t('对比', 'Compare')}
          </Button>
          <Button size="sm" variant={isInShortlist(course.id) ? 'default' : 'outline'} onClick={() => toggleShortlist(course.id)}>
            <Bookmark className="h-3.5 w-3.5 mr-1" />
            {isInShortlist(course.id) ? t('已收藏', 'Saved') : t('收藏', 'Save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface DiscoveryResultViewProps {
  result: DiscoveryResult;
}

export function DiscoveryResultView({ result }: DiscoveryResultViewProps) {
  const { t, lang } = useLanguage();
  const { toggle } = useComparison();
  const { setSelectedProgramme, resetDiscovery } = useDiscovery();
  const { openDetail, openCompare } = useCourseUi();

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold">{t('你的 Course Discovery 结果', 'Your Course Discovery Result')}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {t('主要方向', 'Main direction')}: <strong>{lang === 'zh' ? result.mainDirection.label.zh : result.mainDirection.label.en}</strong>
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-gray-500 uppercase">{t('六维画像', 'Six-Dimension Profile')}</h3>
            {DIMENSIONS.map((d) => (
              <DimensionBar key={d} dim={d} score={result.final[d]} interest={result.interest[d]} strength={result.strength[d]} />
            ))}
          </CardContent>
        </Card>

        <p className="text-sm text-gray-600 mb-6">{lang === 'zh' ? result.explanation.zh : result.explanation.en}</p>

        {(result.foundationAdvice.type === 'foundation' || result.foundationAdvice.type === 'compare') && (
          <Card className="mb-8 border-teal-200 bg-teal-50/50">
            <CardContent className="p-5 flex gap-3">
              <Compass className="h-6 w-6 text-teal-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t('建议', 'Suggestion')}</p>
                <p className="text-sm text-gray-600 mt-1">{lang === 'zh' ? result.foundationAdvice.message.zh : result.foundationAdvice.message.en}</p>
                {result.foundationAdvice.type === 'foundation' && (
                  <Button variant="link" className="px-0 text-teal-600" asChild>
                    <Link href="/courses#foundation">{t('了解 Foundation →', 'Explore Foundation →')}</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <h3 className="text-lg font-bold mb-4">{t('值得了解的课程', 'Courses Worth Exploring')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {result.recommendations.map((rec) => (
            <RecCard
              key={rec.course.id}
              rec={rec}
              onViewDetail={openDetail}
              onCompare={(c) => { toggle(c.id); openCompare(); }}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/discovery" onClick={() => resetDiscovery()}>
              <RotateCcw className="h-4 w-4 mr-2" />{t('重新测验', 'Retake Test')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/discovery?modify=1"><Pencil className="h-4 w-4 mr-2" />{t('修改答案', 'Modify Answers')}</Link>
          </Button>
          <Button className="bg-[#25D366] hover:bg-[#1fb855] text-white" asChild>
            <a href={buildWhatsAppUrl(buildGeneralWhatsAppMessage(lang))} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('WhatsApp 联系顾问', 'Chat on WhatsApp')}
            </a>
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            asChild
            onClick={() => result.recommendations[0] && setSelectedProgramme(result.recommendations[0].course.id)}
          >
            <Link href="/apply">{t('立即报名', 'Apply Now')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

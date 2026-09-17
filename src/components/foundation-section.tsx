'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { courses } from '@/data/courses';
import { useLanguage } from '@/store/use-language';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, ArrowRight } from 'lucide-react';

export function FoundationSection() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const foundationCourses = courses.filter((c) => c.type === 'foundation');

  return (
    <section id="foundation" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-100 dark:bg-teal-900/40 mb-4">
            <Compass className="h-7 w-7 text-teal-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {t('还不确定要读什么？', 'Not Sure Which Field Is Right?')}
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed">
            {t(
              '没关系。Foundation 可以给你时间探索不同学术领域、建立基础、体验不同科目，并为未来的 Degree 做好准备。',
              'That\'s okay. Foundation gives you time to explore different fields, build your academic base, and prepare for your future Degree.',
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {foundationCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-teal-200 dark:border-teal-900 bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-950/20 dark:to-gray-900 p-6"
            >
              <Badge className="bg-teal-600 text-white mb-3">
                {t('基础课程', 'Foundation')}
              </Badge>
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {lang === 'zh' ? course.name.zh : course.name.en}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                {lang === 'zh' ? course.description.zh : course.description.en}
              </p>
              <div className="flex items-center gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">RM {course.tuition.toLocaleString()}</span>
                <span>·</span>
                <span>{lang === 'zh' ? course.duration.zh : course.duration.en}</span>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full border-teal-300 text-teal-700 hover:bg-teal-50 cursor-pointer"
                onClick={() => router.push('/courses')}
              >
                {t('查看课程', 'View Programme')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        <ul className="mt-10 max-w-xl mx-auto space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {[
            t('探索不同学术领域', 'Explore different academic areas'),
            t('建立升学基础', 'Build your academic foundation'),
            t('体验不同科目', 'Experience various subjects'),
            t('了解自身优势', 'Understand your strengths'),
            t('为未来 Degree 做准备', 'Prepare for your future Degree'),
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

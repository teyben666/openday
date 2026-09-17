'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/store/use-language';
import { GraduationCap, DollarSign, BookOpen, Briefcase, Compass, Languages } from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: { zh: '多元学术领域', en: 'Diverse Academic Fields' },
    desc: {
      zh: 'IT、商业、设计、媒体、心理、教育、语言、金融 — 30+ 课程选择',
      en: 'IT, Business, Design, Media, Psychology, Education, Language, Finance — 30+ programmes',
    },
  },
  {
    icon: Languages,
    title: { zh: '中英双语教育与学习环境', en: 'Bilingual Learning Environment' },
    desc: {
      zh: '华英双语教学，多元文化校园，让你在熟悉语言中自信升学',
      en: 'Chinese–English bilingual teaching in a multicultural campus to support your transition to university',
    },
  },
  {
    icon: DollarSign,
    title: { zh: '学费亲民，奖学金丰厚', en: 'Affordable Fees & Generous Scholarships' },
    desc: {
      zh: '学费负担合理，并提供多种奖学金与助学金，减轻家庭升学压力',
      en: 'Reasonable tuition with various scholarships and financial aid to ease the cost of study',
    },
  },
  {
    icon: BookOpen,
    title: { zh: '理论与实务并重', en: 'Theory & Practice' },
    desc: {
      zh: '课程项目、实习与产业合作，让你不只学理论，也累积实际经验',
      en: 'Projects, internships, and industry partnerships for real-world experience',
    },
  },
  {
    icon: Briefcase,
    title: { zh: '明确的职业方向', en: 'Clear Career Paths' },
    desc: {
      zh: '课程 → 技能 → 职业路径，帮助你理解「读这个课会通往哪里」',
      en: 'Course → Skills → Careers — understand where each programme leads',
    },
  },
  {
    icon: Compass,
    title: { zh: '个性化课程建议', en: 'Personalised Discovery' },
    desc: {
      zh: '15 题 Course Discovery 测验，根据兴趣、能力与偏好推荐值得了解的课程',
      en: '15-question discovery test matching programmes to your interests and strengths',
    },
  },
];

const fields = [
  { emoji: '💻', zh: 'IT', en: 'IT', filter: 'tech' },
  { emoji: '💼', zh: '商业', en: 'Business', filter: 'business' },
  { emoji: '🎨', zh: '设计', en: 'Design', filter: 'design' },
  { emoji: '🎬', zh: '媒体', en: 'Media', filter: 'media' },
  { emoji: '🧠', zh: '心理', en: 'Psychology', filter: 'counselling' },
  { emoji: '📚', zh: '语言', en: 'Language', filter: 'chinese' },
  { emoji: '👶', zh: '教育', en: 'Education', filter: 'education' },
  { emoji: '💰', zh: '金融', en: 'Finance', filter: 'finance' },
];

export function WhyChooseUs() {
  const { lang, t } = useLanguage();
  const router = useRouter();

  return (
    <section id="why-choose-us" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {t('为什么选择新纪元？', 'Why Choose NEUC?')}
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t(
              '我们不只是列出课程 — 我们帮助你发现自己、了解课程、做出更好的升学决定',
              'We don\'t just list programmes — we help you discover yourself and make better decisions',
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {features.map((f, i) => (
            <motion.div
              key={f.title.en}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                {lang === 'zh' ? f.title.zh : f.title.en}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {lang === 'zh' ? f.desc.zh : f.desc.en}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('按领域探索课程', 'Explore by Field')}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {fields.map((field) => (
              <button
                key={field.filter}
                type="button"
                onClick={() => router.push(`/courses?category=${field.filter}`)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
              >
                <span>{field.emoji}</span>
                {lang === 'zh' ? field.zh : field.en}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

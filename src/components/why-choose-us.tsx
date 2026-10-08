'use client';

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

export function WhyChooseUs() {
  const { lang, t } = useLanguage();

  return (
    <section id="why-choose-us" className="py-16 sm:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-2xl font-extrabold text-white drop-shadow-sm sm:text-3xl">
            {t('为什么选择新纪元？', 'Why Choose NEUC?')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white drop-shadow-sm">
            {t(
              '我们不只是列出课程 — 我们帮助你发现自己、了解课程、做出更好的升学决定',
              "We don't just list programmes — we help you discover yourself and make better decisions",
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title.en}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel glass-panel-hover rounded-[1.35rem] p-6"
            >
              <div className="glass-icon mb-4 flex h-11 w-11 items-center justify-center rounded-2xl">
                <f.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="mb-2 font-bold text-white">
                {lang === 'zh' ? f.title.zh : f.title.en}
              </h3>
              <p className="text-sm leading-relaxed text-white">
                {lang === 'zh' ? f.desc.zh : f.desc.en}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

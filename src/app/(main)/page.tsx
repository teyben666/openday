'use client';

import Link from 'next/link';
import HeroSection from '@/components/hero-section';
import { WhyChooseUs } from '@/components/why-choose-us';
import { useLanguage } from '@/store/use-language';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from '@/lib/contact';
import { GraduationCap, BookOpen, Compass, MessageCircle } from 'lucide-react';

function HomeCtaCards() {
  const { t } = useLanguage();
  const cards = [
    {
      href: '/discovery',
      icon: Compass,
      title: t('Course Discovery', 'Course Discovery'),
      desc: t('15 题测验，发现适合你的课程方向', '15-question test to find your direction'),
    },
    {
      href: '/courses',
      icon: BookOpen,
      title: t('浏览课程', 'Browse Courses'),
      desc: t('30+ 学士、文凭与基础课程', '30+ bachelor, diploma & foundation programmes'),
    },
    {
      href: '/apply',
      icon: GraduationCap,
      title: t('线上报名', 'Apply Online'),
      desc: t('6 步完成线上申请', 'Complete your application in 6 steps'),
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50 dark:bg-gray-900/30">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border bg-white dark:bg-gray-900 p-6 hover:border-emerald-400 hover:shadow-md transition-all"
          >
            <c.icon className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="font-bold text-lg">{c.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContactCta() {
  const { t, lang } = useLanguage();
  const waUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage(lang));
  return (
    <section className="py-12 text-center px-4">
      <Button size="lg" className="bg-[#25D366] hover:bg-[#1fb855] text-white" asChild>
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-5 w-5" />
          {t('WhatsApp 联系招生顾问', 'Chat with Advisor on WhatsApp')}
        </a>
      </Button>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <HomeCtaCards />
      <ContactCta />
    </>
  );
}

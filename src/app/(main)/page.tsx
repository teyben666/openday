'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import HeroSection from '@/components/hero-section';
import { WhyChooseUs } from '@/components/why-choose-us';
import { useLanguage } from '@/store/use-language';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from '@/lib/contact';
import { GraduationCap, BookOpen, Compass, MessageCircle } from 'lucide-react';

/** Shared campus photo behind Why Choose Us → CTAs → WhatsApp. */
function CampusGlassBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/campus-bg.jpg"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft veil so frosted glass has something to blur */}
        <div className="absolute inset-0 bg-black/35" />
      </div>
      {children}
    </div>
  );
}

function HomeCtaCards() {
  const { t } = useLanguage();
  const cards = [
    {
      href: '/discovery',
      icon: Compass,
      title: t('课程探索', 'Course Discovery'),
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
    <section className="px-4 py-16 md:px-8">
      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.href}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={c.href}
              className="glass-panel glass-panel-hover block rounded-[1.35rem] p-6"
            >
              <div className="glass-icon mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                <c.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white">{c.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ContactCta() {
  const { t, lang } = useLanguage();
  const waUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage(lang));
  return (
    <section className="px-4 pb-16 pt-4 text-center md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <Button
          size="lg"
          className="rounded-full bg-[#25D366] px-8 text-white shadow-lg hover:bg-[#1fb855]"
          asChild
        >
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            {t('WhatsApp 联系招生顾问', 'Chat with Advisor on WhatsApp')}
          </a>
        </Button>
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CampusGlassBand>
        <WhyChooseUs />
        <HomeCtaCards />
        <ContactCta />
      </CampusGlassBand>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/store/use-language';
import { Sparkles, ArrowDown, BookOpen } from 'lucide-react';

function useTypingEffect(strings: string[], speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [strIdx, setStrIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = strings[strIdx];
    if (!deleting) {
      if (charIdx < current.length) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, speed);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setDeleting(true), pause);
        return () => clearTimeout(t);
      }
    } else {
      if (charIdx > 0) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, speed / 2);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setDeleting(false);
          setStrIdx((s) => (s + 1) % strings.length);
        }, speed / 2);
        return () => clearTimeout(t);
      }
    }
  }, [charIdx, deleting, speed, pause, strIdx, strings]);

  return display;
}

function FloatingShape({
  className,
  delay = 0,
  duration = 6,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        y: [30, -40, 20, -30, 30],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function HeroSection() {
  const { t } = useLanguage();

  const typingStrings = [
    t('发现你的未来', 'Discover Your Future'),
    t('探索30+课程', 'Explore 30+ Programmes'),
    t('开启你的大学之旅', 'Start Your University Journey'),
  ];

  const typed = useTypingEffect(typingStrings, 70, 2200);

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* ── gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700" />

      {/* ── subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── radial glow ── */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── floating shapes ── */}
      <FloatingShape
        className="top-[10%] left-[8%] w-16 h-16 rounded-full bg-white/10"
        delay={0}
        duration={7}
      />
      <FloatingShape
        className="top-[20%] right-[12%] w-10 h-10 rounded-lg bg-white/10"
        delay={1.2}
        duration={8}
      />
      <FloatingShape
        className="bottom-[25%] left-[15%] w-12 h-12 rounded-full bg-white/10"
        delay={0.8}
        duration={9}
      />
      <FloatingShape
        className="bottom-[15%] right-[8%] w-20 h-20 rounded-xl bg-white/10"
        delay={1.5}
        duration={10}
      />
      <FloatingShape
        className="top-[50%] left-[5%] w-8 h-8 rounded-full bg-white/15"
        delay={2}
        duration={6}
      />
      <FloatingShape
        className="top-[35%] right-[25%] w-6 h-6 rounded-md bg-white/15"
        delay={0.5}
        duration={7}
      />
      <FloatingShape
        className="bottom-[40%] right-[5%] w-14 h-14 rounded-full bg-white/8"
        delay={1.8}
        duration={11}
      />
      <FloatingShape
        className="top-[8%] left-[45%] w-5 h-5 rounded-full bg-white/20"
        delay={3}
        duration={5}
      />

      {/* ── content ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* university badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-white/20">
            <Sparkles className="h-4 w-4" />
            {t('新纪元大学学院', 'New Era University College')}
          </span>
        </motion.div>

        {/* main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          {t('新纪元大学学院', 'New Era University College')}
        </motion.h1>

        {/* typing line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 h-10 sm:h-12 flex items-center justify-center"
        >
          <span className="text-lg sm:text-xl md:text-2xl font-semibold text-emerald-100">
            {typed}
            <span className="inline-block w-0.5 h-6 sm:h-7 bg-white/80 ml-1 animate-pulse" />
          </span>
        </motion.div>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-base sm:text-lg text-emerald-100/90 font-medium"
        >
          {t(
            '30+ 课程 · 荣誉学士 · 专业文凭 · 基础课程',
            '30+ Programmes · Bachelor · Diploma · Foundation',
          )}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            asChild
            className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <Link href="/discovery">
              <Sparkles className="mr-2 h-5 w-5" />
              {t('发现你的未来', 'Discover Your Future')}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto border-2 border-white/70 bg-transparent text-white hover:bg-white/20 hover:text-white hover:border-white font-bold text-base px-8 py-6 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer shadow-lg shadow-black/10"
          >
            <Link href="/courses">
              <BookOpen className="mr-2 h-5 w-5" />
              {t('浏览课程', 'Browse Courses')}
            </Link>
          </Button>
        </motion.div>

        {/* scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="mx-auto h-6 w-6 text-white/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

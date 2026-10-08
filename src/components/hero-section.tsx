'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/store/use-language';
import { Sparkles, ArrowDown, BookOpen } from 'lucide-react';

const HERO_VIDEOS = [
  'https://www.newera.edu.my/images/%E3%80%901122%E3%80%91Menara_Nantah_Video_mute.mp4',
  'https://www.newera.edu.my/images/NEUC_video_bg.mp4',
] as const;

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

function HeroVideoBackground() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const video = videoRefs.current[active];
    if (!video) return;

    video.currentTime = 0;
    const play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        // Autoplay can fail until user gesture; muted + playsInline usually works.
      });
    }
  }, [active]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {HERO_VIDEOS.map((src, index) => (
        <video
          key={src}
          ref={(el) => {
            videoRefs.current[index] = el;
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            index === active ? 'opacity-100' : 'opacity-0'
          }`}
          src={src}
          muted
          playsInline
          preload={index === 0 ? 'auto' : 'metadata'}
          onEnded={() => setActive((i) => (i + 1) % HERO_VIDEOS.length)}
          aria-hidden
        />
      ))}
      {/* Neutral dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
    </div>
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
      <HeroVideoBackground />

      {/* ── content ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
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

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md"
        >
          {t('新纪元大学学院', 'New Era University College')}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 h-10 sm:h-12 flex items-center justify-center"
        >
          <span className="text-lg sm:text-xl md:text-2xl font-semibold text-white drop-shadow">
            {typed}
            <span className="inline-block w-0.5 h-6 sm:h-7 bg-white/80 ml-1 animate-pulse" />
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-base sm:text-lg text-white/90 font-medium drop-shadow"
        >
          {t(
            '30+ 课程 · 荣誉学士 · 专业文凭 · 基础课程',
            '30+ Programmes · Bachelor · Diploma · Foundation',
          )}
        </motion.p>

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

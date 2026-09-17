'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { quizQuestions, partLabels, type QuizPart } from '@/data/quiz';
import { useLanguage } from '@/store/use-language';
import { useDiscovery } from '@/store/use-discovery';
import { DiscoveryLeadGate } from '@/components/discovery-lead-gate';
import { ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function CourseQuiz() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const { answers: savedAnswers, setPendingAnswers, resetDiscovery } = useDiscovery();

  const isModify = searchParams.get('modify') === '1';
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => (isModify && savedAnswers ? savedAnswers : Array(quizQuestions.length).fill(null)) as (number | null)[],
  );
  const [direction, setDirection] = useState(1);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [started, setStarted] = useState(isModify && !!savedAnswers);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancing = useRef(false);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isModify && savedAnswers) {
      setStarted(true);
      setAnswers(savedAnswers as (number | null)[]);
      setCurrentQ(0);
    }
  }, [isModify, savedAnswers]);

  useEffect(() => {
    if (currentQ < 0 || currentQ >= quizQuestions.length) {
      setCurrentQ(Math.min(Math.max(currentQ, 0), quizQuestions.length - 1));
      advancing.current = false;
    }
  }, [currentQ]);

  const totalQuestions = quizQuestions.length;
  const progress = ((currentQ + 1) / totalQuestions) * 100;
  const question = quizQuestions[currentQ];
  const currentPart = question?.part as QuizPart;

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (advancing.current || !quizQuestions[currentQ]) return;
      advancing.current = true;

      const nextAnswers = [...answers];
      nextAnswers[currentQ] = optionIndex;
      setAnswers(nextAnswers);

      if (advanceTimer.current) clearTimeout(advanceTimer.current);

      if (currentQ < totalQuestions - 1) {
        advanceTimer.current = setTimeout(() => {
          setDirection(1);
          setCurrentQ((q) => Math.min(q + 1, totalQuestions - 1));
          advancing.current = false;
        }, 350);
      } else {
        advanceTimer.current = setTimeout(() => {
          setPendingAnswers(nextAnswers as number[]);
          setShowLeadGate(true);
          advancing.current = false;
        }, 450);
      }
    },
    [answers, currentQ, totalQuestions, setPendingAnswers],
  );

  const handleStart = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advancing.current = false;
    resetDiscovery();
    setAnswers(Array(quizQuestions.length).fill(null));
    setCurrentQ(0);
    setShowLeadGate(false);
    setStarted(true);
  };

  if (showLeadGate) {
    return (
      <DiscoveryLeadGate
        answers={answers as number[]}
        onUnlocked={() => setShowLeadGate(false)}
      />
    );
  }

  if (!started) {
    return (
      <section className="w-full py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
              <Sparkles className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {t('Course Discovery 测验', 'Course Discovery Test')}
            </h1>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              {t(
                '15 个问题，了解你的兴趣、能力与偏好 — 不是告诉你「应该读什么」，而是帮你发现值得了解的课程。',
                '15 questions on interests, strengths, and preferences — we help you discover programmes worth exploring, not decide for you.',
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs text-gray-500">
              <Badge variant="secondary">{t('兴趣 40%', 'Interest 40%')}</Badge>
              <Badge variant="secondary">{t('能力 35%', 'Strength 35%')}</Badge>
              <Badge variant="secondary">{t('偏好 25%', 'Preference 25%')}</Badge>
            </div>
            <Button size="lg" onClick={handleStart} className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-6 rounded-xl cursor-pointer">
              {t('开始探索', 'Start Discovery')}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  if (!question || !currentPart || !partLabels[currentPart]) {
    return null;
  }

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-2 text-center">
          <Badge variant="outline" className="text-emerald-700 border-emerald-300">
            {t(
              `Part ${currentPart === 'interest' ? 'A' : currentPart === 'strength' ? 'B' : 'C'} — ${partLabels[currentPart].zh}`,
              `Part ${currentPart === 'interest' ? 'A' : currentPart === 'strength' ? 'B' : 'C'} — ${partLabels[currentPart].en}`,
            )}{' '}
            ({partLabels[currentPart].weight})
          </Badge>
        </div>
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-gray-500">
            <span>{t('问题', 'Question')} {currentQ + 1}/{totalQuestions}</span>
            <span className="text-emerald-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={currentQ} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-6 leading-relaxed">
                  {lang === 'zh' ? question.question.zh : question.question.en}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={[
                        'relative w-full text-left rounded-xl p-4 border-2 transition-all cursor-pointer',
                        answers[currentQ] === idx
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-teal-300',
                      ].join(' ')}
                    >
                      <div className="flex gap-3">
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-sm font-medium">{lang === 'zh' ? opt.text.zh : opt.text.en}</span>
                      </div>
                      {answers[currentQ] === idx && (
                        <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-emerald-500" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {currentQ > 0 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => {
              if (advanceTimer.current) clearTimeout(advanceTimer.current);
              advancing.current = false;
              setDirection(-1);
              setCurrentQ((q) => Math.max(0, q - 1));
            }}>
              ← {t('上一题', 'Previous')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

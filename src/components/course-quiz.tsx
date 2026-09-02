'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { quizQuestions, calculateQuizResult, categoryLabels } from '@/data/quiz';
import type { QuizQuestion } from '@/data/quiz';
import { courses } from '@/data/courses';
import type { Course } from '@/data/courses';
import { useLanguage } from '@/store/use-language';
import {
  RotateCcw,
  Send,
  GitCompareArrows,
  Eye,
  Trophy,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

/* ─── slide variants ─── */
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
  }),
};

/* ─── option card ─── */
function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: QuizQuestion['options'][number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useLanguage();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={[
        'relative w-full text-left rounded-xl p-4 sm:p-5 border-2 transition-all duration-200 cursor-pointer',
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-200/50'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-teal-300 hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl sm:text-3xl shrink-0 mt-0.5">{option.emoji}</span>
        <span
          className={[
            'text-sm sm:text-base font-medium leading-relaxed',
            selected
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-gray-700 dark:text-gray-300',
          ].join(' ')}
        >
          {t(option.text.zh, option.text.en)}
        </span>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

/* ─── course result card ─── */
function CourseResultCard({
  course,
  onCompare,
}: {
  course: Course;
  onCompare: (course: Course) => void;
}) {
  const { t, lang } = useLanguage();

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {/* header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-snug">
                {lang === 'zh' ? course.name.zh : course.name.en}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {lang === 'zh' ? course.department.zh : course.department.en}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={[
                'shrink-0 text-xs font-medium',
                course.type === 'bachelor'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : course.type === 'diploma'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
              ].join(' ')}
            >
              {course.type === 'bachelor'
                ? t('学士', 'Bachelor')
                : course.type === 'diploma'
                  ? t('文凭', 'Diploma')
                  : t('基础', 'Foundation')}
            </Badge>
          </div>

          {/* meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              RM {course.tuition.toLocaleString()}
            </span>
            <span className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
            <span>{lang === 'zh' ? course.duration.zh : course.duration.en}</span>
          </div>

          {/* action buttons */}
          <div className="flex gap-2 mt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs cursor-pointer"
              onClick={() => {
                /* view details — handled by parent */
              }}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {t('查看详情', 'View Details')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs cursor-pointer"
              onClick={() => onCompare(course)}
            >
              <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" />
              {t('加入对比', 'Compare')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── main component ─── */
export default function CourseQuiz() {
  const { t, lang } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null),
  );
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateQuizResult> | null>(null);
  const [started, setStarted] = useState(false);

  const totalQuestions = quizQuestions.length;
  const progress = ((currentQ + 1) / totalQuestions) * 100;
  const question = quizQuestions[currentQ];

  /* get recommended courses based on top categories */
  const recommendedCourses = useMemo(() => {
    if (!result) return [];
    return courses
      .filter((c) =>
        c.categories.some((cat) => result.topCategories.includes(cat)),
      )
      .slice(0, 6);
  }, [result]);

  /* handle option select */
  const handleSelect = useCallback(
    (optionIndex: number) => {
      const nextAnswers = [...answers];
      nextAnswers[currentQ] = optionIndex;
      setAnswers(nextAnswers);

      // auto-advance after short delay
      if (currentQ < totalQuestions - 1) {
        setTimeout(() => {
          setDirection(1);
          setCurrentQ((q) => q + 1);
        }, 400);
      } else {
        // calculate result on last question
        setTimeout(() => {
          const r = calculateQuizResult(nextAnswers as number[]);
          setResult(r);
        }, 600);
      }
    },
    [answers, currentQ, totalQuestions],
  );

  /* handle retake */
  const handleRetake = useCallback(() => {
    setAnswers(Array(quizQuestions.length).fill(null));
    setCurrentQ(0);
    setDirection(1);
    setResult(null);
    setStarted(false);
  }, []);

  /* handle compare (placeholder for parent) */
  const handleCompare = useCallback((_course: Course) => {
    /* emit event or call parent — placeholder */
  }, []);

  /* ─── start screen ─── */
  if (!started) {
    return (
      <section id="quiz-section" className="w-full py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
              <Sparkles className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {t('找到最适合你的课程', 'Find the Perfect Programme for You')}
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              {t(
                '回答6个简单的问题，我们将根据你的兴趣和性格，为你推荐最适合的课程！',
                'Answer 6 simple questions and we\'ll recommend the best programmes based on your interests and personality!',
              )}
            </p>
            <Button
              size="lg"
              onClick={() => setStarted(true)}
              className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-6 rounded-xl cursor-pointer"
            >
              {t('开始测验', 'Start Quiz')}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  /* ─── result screen ─── */
  if (result) {
    return (
      <section id="quiz-section" className="w-full py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <Trophy className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {t('你的测验结果', 'Your Quiz Results')}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              {t('根据你的回答，你最适合以下方向：', 'Based on your answers, you best fit these areas:')}
            </p>
          </motion.div>

          {/* top 3 category badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {result.topCategories.map((cat, i) => {
              const label = categoryLabels[cat];
              if (!label) return null;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                >
                  <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 px-6 py-4 min-w-[120px]">
                    <span className="text-3xl">{label.emoji}</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {lang === 'zh' ? label.zh : label.en}
                    </span>
                    <span className="text-xs text-gray-500">{result.categoryScores[cat]} {t('分', 'pts')}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* recommended courses */}
          {recommendedCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                {t('为你推荐', 'Recommended for You')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {recommendedCourses.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.6 + i * 0.08 }}
                  >
                    <CourseResultCard course={c} onCompare={handleCompare} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* inquiry CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t('对推荐课程感兴趣？', 'Interested in these programmes?')}
            </p>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-5 rounded-xl cursor-pointer mr-3"
              onClick={() => {
                const el = document.getElementById('inquiry-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              {t('提交入学咨询', 'Submit Enquiry')}
            </Button>
          </motion.div>

          {/* retake button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-center"
          >
            <Button
              variant="ghost"
              onClick={handleRetake}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('重新测验', 'Retake Quiz')}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  /* ─── question screen ─── */
  return (
    <section id="quiz-section" className="w-full py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* progress area */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('问题', 'Question')} {currentQ + 1}/{totalQuestions}
            </span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* question card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-relaxed">
                  {lang === 'zh' ? question.question.zh : question.question.en}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map((opt, idx) => (
                    <OptionCard
                      key={opt.emoji + idx}
                      option={opt}
                      index={idx}
                      selected={answers[currentQ] === idx}
                      onSelect={() => handleSelect(idx)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* back button (if not first question) */}
        {currentQ > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDirection(-1);
                setCurrentQ((q) => q - 1);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            >
              ← {t('上一题', 'Previous')}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { courses, type Course } from '@/data/courses';
import { useComparison } from '@/store/use-comparison';
import { Navbar } from '@/components/navbar';
import HeroSection from '@/components/hero-section';
import CourseQuiz from '@/components/course-quiz';
import CourseCatalog from '@/components/course/course-catalog';
import CourseDetail from '@/components/course/course-detail';
import { CourseCompare } from '@/components/course/course-compare';
import { InquiryForm } from '@/components/inquiry-form';
import { Footer } from '@/components/footer';

export default function HomePage() {
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const handleViewDetail = useCallback((id: string) => {
    const course = courses.find((c) => c.id === id) || null;
    setDetailCourse(course);
    setDetailOpen(true);
  }, []);

  const scrollToQuiz = useCallback(() => {
    quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Listen for compare open event from catalog
  useEffect(() => {
    const handler = () => setCompareOpen(true);
    window.addEventListener('open-compare', handler);
    return () => window.removeEventListener('open-compare', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection onScrollToQuiz={scrollToQuiz} onScrollToCatalog={scrollToCatalog} />
        <div ref={quizRef}>
          <CourseQuiz />
        </div>
        <div ref={catalogRef}>
          <CourseCatalog onViewDetail={handleViewDetail} />
        </div>
        <InquiryForm />
      </main>
      <Footer />

      {/* Dialogs */}
      <CourseDetail
        course={detailCourse}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <CourseCompare
        open={compareOpen}
        onOpenChange={setCompareOpen}
      />
    </div>
  );
}

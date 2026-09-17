'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import CourseDetail from '@/components/course/course-detail';
import { CourseCompare } from '@/components/course/course-compare';
import { courses, type Course } from '@/data/courses';

interface CourseUiContextValue {
  openDetail: (id: string) => void;
  openCompare: () => void;
  detailViewCount: number;
}

const CourseUiContext = createContext<CourseUiContextValue | null>(null);

export function useCourseUi() {
  const ctx = useContext(CourseUiContext);
  if (!ctx) throw new Error('useCourseUi must be used within SiteLayout');
  return ctx;
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [detailViewCount, setDetailViewCount] = useState(0);

  const openDetail = useCallback((id: string) => {
    const course = courses.find((c) => c.id === id) ?? null;
    setDetailCourse(course);
    setDetailOpen(true);
    setDetailViewCount((n) => n + 1);
  }, []);

  const openCompare = useCallback(() => setCompareOpen(true), []);

  useEffect(() => {
    const handler = () => setCompareOpen(true);
    window.addEventListener('open-compare', handler);
    return () => window.removeEventListener('open-compare', handler);
  }, []);

  return (
    <CourseUiContext.Provider value={{ openDetail, openCompare, detailViewCount }}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <CourseDetail course={detailCourse} open={detailOpen} onOpenChange={setDetailOpen} />
        <CourseCompare open={compareOpen} onOpenChange={setCompareOpen} />
      </div>
    </CourseUiContext.Provider>
  );
}

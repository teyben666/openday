'use client';

import { Suspense } from 'react';
import CourseQuiz from '@/components/course-quiz';

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <CourseQuiz />
    </Suspense>
  );
}

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseCatalog from '@/components/course/course-catalog';
import { BrowseAdvisorPrompt } from '@/components/browse-advisor-prompt';
import { FoundationSection } from '@/components/foundation-section';
import { useLanguage } from '@/store/use-language';

function CoursesContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [consumed, setConsumed] = useState(false);

  return (
    <>
      <div className="px-4 md:px-8 pt-8 pb-4 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">{t('浏览课程', 'Browse Courses')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('浏览全部课程 · 比较 · 收藏', 'Browse all programmes · Compare · Shortlist')}
        </p>
      </div>
      <CourseCatalog
        initialCategoryFilter={consumed ? null : category}
        onCategoryFilterConsumed={() => setConsumed(true)}
      />
      <FoundationSection />
      <BrowseAdvisorPrompt />
    </>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <CoursesContent />
    </Suspense>
  );
}

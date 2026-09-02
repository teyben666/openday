'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, SlidersHorizontal, X, GraduationCap, GitCompareArrows } from 'lucide-react';
import { courses } from '@/data/courses';
import { useLanguage } from '@/store/use-language';
import { useComparison } from '@/store/use-comparison';
import CourseCard from '@/components/course/course-card';
import CourseDetail from '@/components/course/course-detail';
import type { Course, CourseType } from '@/data/courses';

interface CourseCatalogProps {
  onViewDetail: (id: string) => void;
}

type SortKey = 'tuition-asc' | 'tuition-desc' | 'duration-asc' | 'duration-desc' | 'name';

const TUITION_RANGES = [
  { label: { zh: '全部学费', en: 'All Tuition' }, value: 'all' },
  { label: { zh: 'RM 10,000 以下', en: 'Below RM 10k' }, value: '0-10000' },
  { label: { zh: 'RM 10k – 25k', en: 'RM 10k – 25k' }, value: '10000-25000' },
  { label: { zh: 'RM 25k – 40k', en: 'RM 25k – 40k' }, value: '25000-40000' },
  { label: { zh: 'RM 40k 以上', en: 'Above RM 40k' }, value: '40000-999999' },
];

const DURATION_OPTIONS = [
  { label: { zh: '全部学制', en: 'All Durations' }, value: 'all' },
  { label: { zh: '1年', en: '1 Year' }, value: '1' },
  { label: { zh: '2年', en: '2 Years' }, value: '2' },
  { label: { zh: '2.5年', en: '2.5 Years' }, value: '2.5' },
  { label: { zh: '3年', en: '3 Years' }, value: '3' },
  { label: { zh: '4年', en: '4 Years' }, value: '4' },
];

export default function CourseCatalog({ onViewDetail: onViewDetailProp }: CourseCatalogProps) {
  const { lang, t } = useLanguage();
  const { selectedIds, clear } = useComparison();

  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [tuitionFilter, setTuitionFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Detail dialog state
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = (id: string) => {
    const c = courses.find((c) => c.id === id) ?? null;
    setDetailCourse(c);
    setDetailOpen(true);
    onViewDetailProp(id);
  };

  // Unique departments
  const departments = useMemo(() => {
    const map = new Map<string, { zh: string; en: string }>();
    for (const c of courses) {
      const key = `${c.department.zh}|${c.department.en}`;
      if (!map.has(key)) map.set(key, c.department);
    }
    return Array.from(map.values());
  }, []);

  // Filtered & sorted courses
  const filtered = useMemo(() => {
    let result = [...courses];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.zh.toLowerCase().includes(q) ||
          c.name.en.toLowerCase().includes(q) ||
          c.department.zh.toLowerCase().includes(q) ||
          c.department.en.toLowerCase().includes(q) ||
          c.description.zh.toLowerCase().includes(q) ||
          c.description.en.toLowerCase().includes(q)
      );
    }

    // Type
    if (typeFilter !== 'all') {
      result = result.filter((c) => c.type === typeFilter);
    }

    // Department
    if (departmentFilter !== 'all') {
      result = result.filter(
        (c) => `${c.department.zh}|${c.department.en}` === departmentFilter
      );
    }

    // Duration
    if (durationFilter !== 'all') {
      const target = parseFloat(durationFilter);
      result = result.filter((c) => c.durationYears === target);
    }

    // Tuition range
    if (tuitionFilter !== 'all') {
      const [min, max] = tuitionFilter.split('-').map(Number);
      result = result.filter((c) => c.tuition >= min && c.tuition <= max);
    }

    // Sort
    switch (sortKey) {
      case 'tuition-asc':
        result.sort((a, b) => a.tuition - b.tuition);
        break;
      case 'tuition-desc':
        result.sort((a, b) => b.tuition - a.tuition);
        break;
      case 'duration-asc':
        result.sort((a, b) => a.durationYears - b.durationYears);
        break;
      case 'duration-desc':
        result.sort((a, b) => b.durationYears - a.durationYears);
        break;
      case 'name':
        result.sort((a, b) => a.name.en.localeCompare(b.name.en));
        break;
    }

    return result;
  }, [search, typeFilter, departmentFilter, durationFilter, tuitionFilter, sortKey]);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setDepartmentFilter('all');
    setDurationFilter('all');
    setTuitionFilter('all');
    setSortKey('name');
  };

  const hasActiveFilters =
    search !== '' ||
    typeFilter !== 'all' ||
    departmentFilter !== 'all' ||
    durationFilter !== 'all' ||
    tuitionFilter !== 'all';

  // Build the filter controls as a reusable render
  const renderFilters = () => (
    <div className="space-y-4">
      {/* Type filter toggle */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t('课程类型', 'Programme Type')}
        </label>
        <ToggleGroup
          type="single"
          value={typeFilter}
          onValueChange={(v) => {
            if (v) setTypeFilter(v);
          }}
          className="flex flex-wrap gap-1"
        >
          <ToggleGroupItem value="all" className="text-xs">
            {t('全部', 'All')}
          </ToggleGroupItem>
          <ToggleGroupItem value="bachelor" className="text-xs">
            {t('学士', 'Bachelor')}
          </ToggleGroupItem>
          <ToggleGroupItem value="diploma" className="text-xs">
            {t('文凭', 'Diploma')}
          </ToggleGroupItem>
          <ToggleGroupItem value="foundation" className="text-xs">
            {t('基础', 'Foundation')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Department filter */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t('院系', 'Department')}
        </label>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('选择院系', 'Select Department')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('全部院系', 'All Departments')}</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={`${dept.zh}|${dept.en}`} value={`${dept.zh}|${dept.en}`}>
                {dept[lang]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration filter */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t('学制', 'Duration')}
        </label>
        <Select value={durationFilter} onValueChange={setDurationFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('选择学制', 'Select Duration')} />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label[lang]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tuition range filter */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t('学费范围', 'Tuition Range')}
        </label>
        <Select value={tuitionFilter} onValueChange={setTuitionFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('选择学费范围', 'Select Tuition Range')} />
          </SelectTrigger>
          <SelectContent>
            {TUITION_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label[lang]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t('排序', 'Sort By')}
        </label>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('排序方式', 'Sort By')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t('名称', 'Name')}</SelectItem>
            <SelectItem value="tuition-asc">
              {t('学费：低 → 高', 'Tuition: Low → High')}
            </SelectItem>
            <SelectItem value="tuition-desc">
              {t('学费：高 → 低', 'Tuition: High → Low')}
            </SelectItem>
            <SelectItem value="duration-asc">
              {t('学制：短 → 长', 'Duration: Short → Long')}
            </SelectItem>
            <SelectItem value="duration-desc">
              {t('学制：长 → 短', 'Duration: Long → Short')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
          <X className="mr-1.5 h-3.5 w-3.5" />
          {t('重置筛选', 'Reset Filters')}
        </Button>
      )}
    </div>
  );

  return (
    <section id="catalog-section" className="relative">
      {/* Desktop filter bar */}
      <div className="mb-6 hidden gap-4 md:grid md:grid-cols-12 md:items-end">
        {/* Search - spans 4 cols */}
        <div className="col-span-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('搜索课程、院系...', 'Search programmes, departments...')}
              className="pl-9"
            />
          </div>
        </div>

        {/* Type toggle - spans 4 cols */}
        <div className="col-span-4">
          <ToggleGroup
            type="single"
            value={typeFilter}
            onValueChange={(v) => {
              if (v) setTypeFilter(v);
            }}
            className="flex flex-wrap"
          >
            <ToggleGroupItem value="all" className="text-xs">
              {t('全部', 'All')}
            </ToggleGroupItem>
            <ToggleGroupItem value="bachelor" className="text-xs">
              {t('学士', 'Bachelor')}
            </ToggleGroupItem>
            <ToggleGroupItem value="diploma" className="text-xs">
              {t('文凭', 'Diploma')}
            </ToggleGroupItem>
            <ToggleGroupItem value="foundation" className="text-xs">
              {t('基础', 'Foundation')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Department, Duration, Tuition, Sort as compact selects - 4 cols */}
        <div className="col-span-4 flex flex-wrap gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[120px] text-xs">
              <SelectValue placeholder={t('院系', 'Dept')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('全部院系', 'All Depts')}</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={`${dept.zh}|${dept.en}`} value={`${dept.zh}|${dept.en}`}>
                  {dept[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[100px] text-xs">
              <SelectValue placeholder={t('学制', 'Duration')} />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tuitionFilter} onValueChange={setTuitionFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[110px] text-xs">
              <SelectValue placeholder={t('学费', 'Tuition')} />
            </SelectTrigger>
            <SelectContent>
              {TUITION_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-9 w-auto min-w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t('名称', 'Name')}</SelectItem>
              <SelectItem value="tuition-asc">{t('学费↑', 'Fee ↑')}</SelectItem>
              <SelectItem value="tuition-desc">{t('学费↓', 'Fee ↓')}</SelectItem>
              <SelectItem value="duration-asc">{t('学制↑', 'Dur ↑')}</SelectItem>
              <SelectItem value="duration-desc">{t('学制↓', 'Dur ↓')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile: search + filter button */}
      <div className="mb-4 flex gap-2 md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('搜索课程...', 'Search programmes...')}
            className="pl-9"
          />
        </div>
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle>{t('筛选课程', 'Filter Programmes')}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto pb-4">{renderFilters()}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile active filters chips */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-1.5 md:hidden">
          {typeFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => setTypeFilter('all')}
            >
              {typeFilter === 'bachelor'
                ? t('学士', 'Bachelor')
                : typeFilter === 'diploma'
                  ? t('文凭', 'Diploma')
                  : t('基础', 'Foundation')}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {departmentFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => setDepartmentFilter('all')}
            >
              {departments.find((d) => `${d.zh}|${d.en}` === departmentFilter)?.[lang] ?? ''}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {durationFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => setDurationFilter('all')}
            >
              {DURATION_OPTIONS.find((d) => d.value === durationFilter)?.label[lang] ?? ''}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {tuitionFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => setTuitionFilter('all')}
            >
              {TUITION_RANGES.find((r) => r.value === tuitionFilter)?.label[lang] ?? ''}
              <X className="h-3 w-3" />
            </Badge>
          )}
          <Badge
            variant="outline"
            className="cursor-pointer"
            onClick={resetFilters}
          >
            {t('清除全部', 'Clear All')}
          </Badge>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t(`显示 ${filtered.length} 个课程`, `Showing ${filtered.length} programme${filtered.length !== 1 ? 's' : ''}`)}
        </p>
      </div>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onViewDetail={handleViewDetail}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
        >
          <GraduationCap className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            {t('没有找到匹配的课程', 'No matching programmes found')}
          </h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            {t(
              '请尝试调整筛选条件或搜索关键词',
              'Try adjusting your filters or search keywords'
            )}
          </p>
          <Button variant="outline" onClick={resetFilters}>
            <X className="mr-1.5 h-4 w-4" />
            {t('重置筛选', 'Reset Filters')}
          </Button>
        </motion.div>
      )}

      {/* Floating comparison bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
          >
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-2 text-sm">
                <GitCompareArrows className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">
                  {t(
                    `已选择 ${selectedIds.length} 个课程进行对比`,
                    `${selectedIds.length} programme${selectedIds.length !== 1 ? 's' : ''} selected for comparison`
                  )}
                </span>
                {selectedIds.length < 3 && (
                  <span className="text-xs text-muted-foreground">
                    ({t('最多3个', 'up to 3')})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clear}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  {t('清除', 'Clear')}
                </Button>
                <Button
                  size="sm"
                  disabled={selectedIds.length < 2}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-compare'));
                  }}
                >
                  {t('开始对比', 'Start Comparison')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail dialog */}
      <CourseDetail
        course={detailCourse}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </section>
  );
}

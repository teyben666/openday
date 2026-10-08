import type { Course, CourseType } from '@/data/courses';

export interface Faculty {
  key: string;
  zh: string;
  en: string;
  hex: string;
}

/** Keyed by `Course.color`, in display order. */
export const FACULTIES: Faculty[] = [
  { key: 'purple', zh: '计算机与创新技术学院', en: 'Faculty of Computing & Innovative Technology', hex: '#7c3aed' },
  { key: 'red', zh: '文学与社会科学院', en: 'Faculty of Arts & Social Sciences', hex: '#dc2626' },
  { key: 'blue', zh: '会计、管理与经济学院', en: 'Faculty of Accountancy, Management & Economics', hex: '#2563eb' },
  { key: 'yellow', zh: '教育学院', en: 'Faculty of Education', hex: '#ca8a04' },
  { key: 'darkcyan', zh: '艺术与表演学院', en: 'Faculty of Art & Performance', hex: '#0e7490' },
  { key: 'black', zh: '卫生、保安与环境管理学院', en: 'Faculty of Health, Safety & Environmental Management', hex: '#171717' },
  { key: 'peach', zh: '国际教育学院', en: 'School of International Education', hex: '#b86b5c' },
];

const FACULTY_ORDER: Record<string, number> = Object.fromEntries(FACULTIES.map((f, i) => [f.key, i]));

export function facultyOf(course: Course): Faculty | undefined {
  return FACULTIES.find((f) => f.key === course.color);
}

/** Diploma first, then degree (bachelor), then foundation */
export const TYPE_ORDER: Record<CourseType, number> = {
  diploma: 0,
  bachelor: 1,
  foundation: 2,
};

export function facultySort(a: Course, b: Course) {
  const byFaculty = (FACULTY_ORDER[a.color] ?? 99) - (FACULTY_ORDER[b.color] ?? 99);
  if (byFaculty !== 0) return byFaculty;
  const byType = (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
  if (byType !== 0) return byType;
  return a.name.en.localeCompare(b.name.en);
}

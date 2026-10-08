import { courses, type CourseType } from '@/data/courses';
import type { RequiredSubject } from '@/data/subjects';

export type { RequiredSubject } from '@/data/subjects';

export type QualificationKey = 'SPM' | 'IGCSE' | 'UEC' | 'STPM' | 'A-Level' | 'Diploma' | 'Foundation';

/** Qualifications entered as a CGPA rather than a subject table. */
export const CGPA_QUALIFICATIONS: QualificationKey[] = ['Diploma', 'Foundation'];

/** School-leaving certificates that cannot enter a bachelor degree directly. */
export const SECONDARY_ONLY_QUALIFICATIONS: QualificationKey[] = ['SPM', 'IGCSE'];

export interface CourseEntryRule {
  level: CourseType;
  requiresMath: boolean;
}

const MATH_COURSES = new Set(['BSE', 'BCS', 'BFI', 'DAC', 'DIT', 'DCS']);

export function getCourseEntryRule(courseId: string): CourseEntryRule {
  const course = courses.find((c) => c.id === courseId);
  return {
    level: course?.type ?? 'diploma',
    requiresMath: MATH_COURSES.has(courseId),
  };
}

/** Subject-table thresholds per course level. Bachelor via SPM/IGCSE is blocked elsewhere. */
export const SUBJECT_THRESHOLDS: Record<
  CourseType,
  Partial<Record<QualificationKey, { minCredits: number; requiredSubjects: RequiredSubject[] }>>
> = {
  bachelor: {
    UEC: { minCredits: 5, requiredSubjects: [] },
  },
  foundation: {
    SPM: { minCredits: 5, requiredSubjects: [] },
    IGCSE: { minCredits: 5, requiredSubjects: [] },
    UEC: { minCredits: 3, requiredSubjects: [] },
  },
  diploma: {
    SPM: { minCredits: 3, requiredSubjects: ['BM'] },
    IGCSE: { minCredits: 3, requiredSubjects: [] },
    UEC: { minCredits: 3, requiredSubjects: [] },
  },
};

export const BACHELOR_MIN_CGPA = 2.0;
export const BACHELOR_STPM_MIN_PASSES = 2;
export const BACHELOR_ALEVEL_MIN_PASSES = 2;

export const SPM_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'G', 'F'] as const;
export const IGCSE_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'] as const;
export const UEC_GRADES = ['A1', 'A2', 'B3', 'B4', 'B5', 'B6', 'C7', 'C8', 'F9'] as const;
export const STPM_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'] as const;
export const ALEVEL_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'] as const;

export const STPM_GRADE_POINTS: Record<string, number> = {
  A: 4.0, 'A-': 3.67, 'B+': 3.33, B: 3.0, 'B-': 2.67, 'C+': 2.33,
  C: 2.0, 'C-': 1.67, 'D+': 1.33, D: 1.0, F: 0,
};

export function gradesForQualification(q: QualificationKey): readonly string[] {
  switch (q) {
    case 'SPM':
      return SPM_GRADES;
    case 'IGCSE':
      return IGCSE_GRADES;
    case 'UEC':
      return UEC_GRADES;
    case 'STPM':
      return STPM_GRADES;
    case 'A-Level':
      return ALEVEL_GRADES;
    default:
      return [];
  }
}

/** Minimum subject rows the form asks for. */
export function minSubjectRows(q: QualificationKey | ''): number {
  if (q === 'STPM' || q === 'A-Level') return 2;
  if (q && CGPA_QUALIFICATIONS.includes(q)) return 0;
  return 3;
}

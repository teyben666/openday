export type QualificationKey = 'SPM' | 'IGCSE' | 'UEC' | 'STPM' | 'A-Level' | 'Diploma' | 'Foundation';

export type RequiredSubject = 'MATH' | 'BM';

export interface PathwayRule {
  /** Minimum credit / pass subjects */
  minCredits: number;
  /** Subjects that must appear and meet credit/pass grade */
  requiredSubjects: RequiredSubject[];
}

export interface CourseEntryRule {
  spm: PathwayRule;
  igcse: PathwayRule;
  uec: PathwayRule;
  /** Soft note for other quals — still allow apply */
  stpmMinCgpa?: number;
  aLevelMinPasses?: number;
}

const bachelorBase: CourseEntryRule = {
  spm: { minCredits: 5, requiredSubjects: ['BM'] },
  igcse: { minCredits: 5, requiredSubjects: [] },
  uec: { minCredits: 5, requiredSubjects: [] },
  stpmMinCgpa: 2.0,
  aLevelMinPasses: 2,
};

const bachelorMath: CourseEntryRule = {
  spm: { minCredits: 5, requiredSubjects: ['BM', 'MATH'] },
  igcse: { minCredits: 5, requiredSubjects: ['MATH'] },
  uec: { minCredits: 5, requiredSubjects: ['MATH'] },
  stpmMinCgpa: 2.0,
  aLevelMinPasses: 2,
};

const diplomaBase: CourseEntryRule = {
  spm: { minCredits: 3, requiredSubjects: ['BM'] },
  igcse: { minCredits: 3, requiredSubjects: [] },
  uec: { minCredits: 3, requiredSubjects: [] },
};

const diplomaMath: CourseEntryRule = {
  spm: { minCredits: 3, requiredSubjects: ['BM', 'MATH'] },
  igcse: { minCredits: 3, requiredSubjects: ['MATH'] },
  uec: { minCredits: 3, requiredSubjects: ['MATH'] },
};

const foundationBase: CourseEntryRule = {
  spm: { minCredits: 5, requiredSubjects: [] },
  igcse: { minCredits: 5, requiredSubjects: [] },
  uec: { minCredits: 3, requiredSubjects: [] },
};

/** Structured entry rules derived from each course's published requirements. */
export const courseEntryRules: Record<string, CourseEntryRule> = {
  // Bachelor
  BCP: bachelorBase,
  BBA: bachelorBase,
  BTCSL: bachelorBase,
  BECE: bachelorBase,
  BFA: bachelorBase,
  BCL: bachelorBase,
  BVC: bachelorBase,
  BSE: bachelorMath,
  BIM: bachelorBase,
  BCS: bachelorMath,
  BMS: bachelorBase,
  BIP: bachelorBase,
  BFI: bachelorMath,
  BCA: bachelorBase,
  // Foundation
  FCC: foundationBase,
  FIA: foundationBase,
  // Diploma
  DBA: diplomaBase,
  DAC: diplomaMath,
  DIT: diplomaMath,
  DMS: diplomaBase,
  DVA: diplomaBase,
  DGD: diplomaBase,
  DID: diplomaBase,
  TCSL: diplomaBase,
  ECE: diplomaBase,
  DIM: diplomaBase,
  DCS: diplomaMath,
  DMD: diplomaBase,
  DPA: diplomaBase,
  DECM: diplomaBase,
};

export function getCourseEntryRule(courseId: string): CourseEntryRule {
  return courseEntryRules[courseId] ?? diplomaBase;
}

export const SUBJECT_OPTIONS: { id: string; key?: RequiredSubject; zh: string; en: string }[] = [
  { id: 'MATH', key: 'MATH', zh: '数学 / Mathematics', en: 'Mathematics' },
  { id: 'BM', key: 'BM', zh: '马来文 / Bahasa Melayu', en: 'Bahasa Melayu' },
  { id: 'ENG', zh: '英文 / English', en: 'English' },
  { id: 'CHI', zh: '中文 / Chinese', en: 'Chinese' },
  { id: 'SCI', zh: '科学 / Science', en: 'Science' },
  { id: 'PHY', zh: '物理 / Physics', en: 'Physics' },
  { id: 'CHE', zh: '化学 / Chemistry', en: 'Chemistry' },
  { id: 'BIO', zh: '生物 / Biology', en: 'Biology' },
  { id: 'HIST', zh: '历史 / History (Sejarah)', en: 'History (Sejarah)' },
  { id: 'GEO', zh: '地理 / Geography', en: 'Geography' },
  { id: 'ACC', zh: '会计 / Accounting', en: 'Accounting' },
  { id: 'OTHER', zh: '其他 / Other', en: 'Other' },
];

export const SPM_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'G', 'F'] as const;
export const IGCSE_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'] as const;
export const UEC_GRADES = ['A1', 'A2', 'B3', 'B4', 'B5', 'B6', 'C7', 'C8', 'F9'] as const;
export const STPM_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'] as const;
export const ALEVEL_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'] as const;

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
      return SPM_GRADES;
  }
}

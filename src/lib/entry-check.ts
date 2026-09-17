import {
  type CourseEntryRule,
  type PathwayRule,
  type QualificationKey,
  type RequiredSubject,
  getCourseEntryRule,
} from '@/data/entry-rules';

export interface GradeRow {
  id: string;
  subjectId: string;
  subjectOther: string;
  grade: string;
}

export interface EntryCheckResult {
  ok: boolean;
  creditCount: number;
  minCredits: number;
  missingSubjects: RequiredSubject[];
  messages: { zh: string; en: string }[];
}

const SPM_CREDIT = new Set(['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C']);
const IGCSE_CREDIT = new Set(['A*', 'A', 'B', 'C']);
const UEC_B_OR_BETTER = new Set(['A1', 'A2', 'B3', 'B4', 'B5', 'B6']);
const STPM_PASS = new Set(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D']);
const ALEVEL_PASS = new Set(['A*', 'A', 'B', 'C', 'D', 'E']);

function isCreditGrade(qualification: QualificationKey, grade: string): boolean {
  if (!grade) return false;
  switch (qualification) {
    case 'SPM':
      return SPM_CREDIT.has(grade);
    case 'IGCSE':
      return IGCSE_CREDIT.has(grade);
    case 'UEC':
      return UEC_B_OR_BETTER.has(grade);
    case 'STPM':
      return STPM_PASS.has(grade);
    case 'A-Level':
      return ALEVEL_PASS.has(grade);
    default:
      return SPM_CREDIT.has(grade);
  }
}

function resolveSubjectKey(row: GradeRow): RequiredSubject | null {
  if (row.subjectId === 'MATH') return 'MATH';
  if (row.subjectId === 'BM') return 'BM';
  return null;
}

function pathwayFor(
  rule: CourseEntryRule,
  qualification: QualificationKey,
): PathwayRule | null {
  switch (qualification) {
    case 'SPM':
      return rule.spm;
    case 'IGCSE':
      return rule.igcse;
    case 'UEC':
      return rule.uec;
    default:
      return null;
  }
}

function subjectIdentity(row: GradeRow): string | null {
  if (!row.subjectId) return null;
  if (row.subjectId === 'OTHER') {
    const name = row.subjectOther.trim().toLowerCase();
    return name ? `OTHER:${name}` : null;
  }
  return row.subjectId;
}

/** Keep the first row for each subject so credits cannot be double-counted. */
export function uniqueSubjectRows(rows: GradeRow[]): GradeRow[] {
  const seen = new Set<string>();
  const out: GradeRow[] = [];
  for (const row of rows) {
    if (!row.subjectId || !row.grade) continue;
    const id = subjectIdentity(row);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
}

export function countCredits(qualification: QualificationKey, rows: GradeRow[]): number {
  return uniqueSubjectRows(rows).filter((r) => isCreditGrade(qualification, r.grade)).length;
}

export function checkEntryEligibility(
  courseId: string,
  qualification: QualificationKey,
  rows: GradeRow[],
): EntryCheckResult {
  const rule = getCourseEntryRule(courseId);
  const messages: { zh: string; en: string }[] = [];

  // Soft pathways: STPM / A-Level / prior diploma — remind only
  if (qualification === 'STPM') {
    const passes = countCredits(qualification, rows);
    const ok = passes >= 2;
    return {
      ok,
      creditCount: passes,
      minCredits: 2,
      missingSubjects: [],
      messages: ok
        ? [{ zh: 'STPM 科目已达基本通过数（最终以学校审核为准）', en: 'STPM passes look sufficient (final review by admissions)' }]
        : [{ zh: 'STPM 需至少 2 科及格后才能继续报名', en: 'STPM needs at least 2 passes before you can continue' }],
    };
  }

  if (qualification === 'A-Level') {
    const passes = countCredits(qualification, rows);
    const need = rule.aLevelMinPasses ?? 2;
    const ok = passes >= need;
    return {
      ok,
      creditCount: passes,
      minCredits: need,
      missingSubjects: [],
      messages: ok
        ? [{ zh: 'A-Level 及格科数看起来足够（最终以学校审核为准）', en: 'A-Level passes look sufficient (final review by admissions)' }]
        : [
            {
              zh: `A-Level 需至少 ${need} 科及格后才能继续报名`,
              en: `A-Level needs at least ${need} passes before you can continue`,
            },
          ],
    };
  }

  if (qualification === 'Diploma' || qualification === 'Foundation') {
    return {
      ok: rows.some((r) => r.subjectId && r.grade),
      creditCount: uniqueSubjectRows(rows).length,
      minCredits: 1,
      missingSubjects: [],
      messages: [
        {
          zh: '请填写主要科目成绩；同等学历将由招生团队人工审核',
          en: 'Enter key subject grades; equivalent quals will be reviewed manually',
        },
      ],
    };
  }

  const pathway = pathwayFor(rule, qualification);
  if (!pathway) {
    return {
      ok: true,
      creditCount: 0,
      minCredits: 0,
      missingSubjects: [],
      messages: [{ zh: '此学历将由招生团队人工审核', en: 'This qualification will be reviewed manually' }],
    };
  }

  const filled = uniqueSubjectRows(rows);
  const creditRows = filled.filter((r) => isCreditGrade(qualification, r.grade));
  const creditCount = creditRows.length;
  const minCredits = pathway.minCredits;

  if (creditCount < minCredits) {
    messages.push({
      zh: `目前 credit/达标科目：${creditCount}，本课程要求至少 ${minCredits} 科`,
      en: `Credits/qualifying subjects: ${creditCount}; this programme needs at least ${minCredits}`,
    });
  }

  const creditSubjectKeys = new Set(
    creditRows.map(resolveSubjectKey).filter((k): k is RequiredSubject => Boolean(k)),
  );

  const missingSubjects = pathway.requiredSubjects.filter((s) => !creditSubjectKeys.has(s));

  for (const s of missingSubjects) {
    if (s === 'MATH') {
      messages.push({
        zh: '本课程要求数学达到 credit / 合格等级',
        en: 'This programme requires Mathematics at credit/pass level',
      });
    }
    if (s === 'BM') {
      messages.push({
        zh: '本课程要求马来文达到 credit / 合格等级',
        en: 'This programme requires Bahasa Melayu at credit/pass level',
      });
    }
  }

  const ok = creditCount >= minCredits && missingSubjects.length === 0;
  if (ok) {
    messages.push({
      zh: '成绩看起来符合基本入学门槛（最终以学校审核为准）',
      en: 'Results appear to meet basic entry requirements (final review by admissions)',
    });
  } else {
    messages.push({
      zh: '尚未符合入学门槛，请补足 credit 或必考科目（如数学）后再继续',
      en: 'Entry requirements not met. Add enough credits or required subjects (e.g. Math) to continue',
    });
  }

  return { ok, creditCount, minCredits, missingSubjects, messages };
}

export function formatGradesResultJson(
  qualification: QualificationKey,
  rows: GradeRow[],
  check: EntryCheckResult,
): string {
  return JSON.stringify({
    qualification,
    subjects: rows
      .filter((r) => r.subjectId && r.grade)
      .map((r) => ({
        subjectId: r.subjectId,
        subject:
          r.subjectId === 'OTHER'
            ? r.subjectOther || 'Other'
            : r.subjectId,
        grade: r.grade,
      })),
    check: {
      ok: check.ok,
      creditCount: check.creditCount,
      minCredits: check.minCredits,
      missingSubjects: check.missingSubjects,
    },
  });
}

export function emptyGradeRows(count = 3): GradeRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i + 1}-${Math.random().toString(36).slice(2, 7)}`,
    subjectId: '',
    subjectOther: '',
    grade: '',
  }));
}

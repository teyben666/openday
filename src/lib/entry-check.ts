import {
  BACHELOR_ALEVEL_MIN_PASSES,
  BACHELOR_MIN_CGPA,
  BACHELOR_STPM_MIN_PASSES,
  CGPA_QUALIFICATIONS,
  SECONDARY_ONLY_QUALIFICATIONS,
  STPM_GRADE_POINTS,
  SUBJECT_THRESHOLDS,
  getCourseEntryRule,
  type QualificationKey,
  type RequiredSubject,
} from '@/data/entry-rules';
import { OTHER_SUBJECT_ID, findSubject } from '@/data/subjects';

export interface GradeRow {
  id: string;
  subjectId: string;
  subjectOther: string;
  grade: string;
}

type Msg = { zh: string; en: string };

export interface EntryCheckResult {
  ok: boolean;
  /** SPM / IGCSE applying for a bachelor degree. */
  blocked: boolean;
  creditCount: number;
  minCredits: number;
  missingSubjects: RequiredSubject[];
  cgpa?: number;
  /** One-line headline, e.g. "Credits 4 / 5" or "CGPA 2.85 / 2.00". */
  summary: Msg;
  messages: Msg[];
}

export interface EntryCheckExtras {
  /** For Diploma / Foundation holders. */
  cgpa?: number | null;
}

const SPM_CREDIT = new Set(['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C']);
const IGCSE_CREDIT = new Set(['A*', 'A', 'B', 'C']);
const UEC_B_OR_BETTER = new Set(['A1', 'A2', 'B3', 'B4', 'B5', 'B6']);
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
      return (STPM_GRADE_POINTS[grade] ?? 0) >= 1.0;
    case 'A-Level':
      return ALEVEL_PASS.has(grade);
    default:
      return false;
  }
}

function subjectIdentity(row: GradeRow): string | null {
  if (!row.subjectId) return null;
  if (row.subjectId === OTHER_SUBJECT_ID) {
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

function subjectMessages(missing: RequiredSubject[]): Msg[] {
  return missing.map((s) =>
    s === 'MATH'
      ? { zh: '本课程要求数学达到 credit / 合格等级', en: 'This programme requires Mathematics at credit/pass level' }
      : { zh: '本课程要求马来文达到 credit / 合格等级', en: 'This programme requires Bahasa Melayu at credit/pass level' },
  );
}

const FINAL_REVIEW: Msg = {
  zh: '成绩看起来符合基本入学门槛（最终以学校审核为准）',
  en: 'Results appear to meet basic entry requirements (final review by admissions)',
};

const MATH_VERIFY: Msg = {
  zh: '本课程另需 SPM / 同等数学 credit，招生团队会核对',
  en: 'This programme also needs an SPM-level Mathematics credit; admissions will verify it',
};

export function checkEntryEligibility(
  courseId: string,
  qualification: QualificationKey,
  rows: GradeRow[],
  extras: EntryCheckExtras = {},
): EntryCheckResult {
  const rule = getCourseEntryRule(courseId);
  const bachelor = rule.level === 'bachelor';
  const filled = uniqueSubjectRows(rows);

  const base = { blocked: false, missingSubjects: [] as RequiredSubject[] };

  // SPM / IGCSE are school-leaving certificates — degree entry needs a pre-university qualification.
  if (bachelor && SECONDARY_ONLY_QUALIFICATIONS.includes(qualification)) {
    return {
      ...base,
      ok: false,
      blocked: true,
      creditCount: 0,
      minCredits: 0,
      summary: {
        zh: `${qualification} 不能直接报读学士学位`,
        en: `${qualification} alone does not qualify for a bachelor degree`,
      },
      messages: [
        {
          zh: '学士学位需持有 STPM、UEC（5 科 B）、A-Level，或预科 / 文凭（CGPA 2.0 以上）。',
          en: 'Bachelor degrees need STPM, UEC (5 Bs), A-Level, or a Foundation / Diploma (CGPA 2.0+).',
        },
        {
          zh: `建议先报读预科或相关文凭课程，完成后可衔接本科。`,
          en: 'Consider a Foundation or related Diploma first — it leads on to the degree.',
        },
      ],
    };
  }

  // Diploma / Foundation holders: judged on CGPA.
  if (CGPA_QUALIFICATIONS.includes(qualification)) {
    const cgpa = typeof extras.cgpa === 'number' && Number.isFinite(extras.cgpa) ? extras.cgpa : undefined;
    const need = bachelor ? BACHELOR_MIN_CGPA : 0;
    const valid = cgpa !== undefined && cgpa >= 0 && cgpa <= 4;
    const ok = valid && cgpa >= need;
    const messages: Msg[] = [];
    if (!valid) {
      messages.push({ zh: '请填写 0.00 – 4.00 之间的 CGPA', en: 'Enter your CGPA between 0.00 and 4.00' });
    } else if (!ok) {
      messages.push({
        zh: `学士学位要求 CGPA 至少 ${need.toFixed(2)}`,
        en: `Bachelor entry needs a CGPA of at least ${need.toFixed(2)}`,
      });
    } else {
      if (bachelor && rule.requiresMath) messages.push(MATH_VERIFY);
      messages.push(FINAL_REVIEW);
    }
    return {
      ...base,
      ok,
      creditCount: 0,
      minCredits: 0,
      cgpa,
      summary: {
        zh: `CGPA：${valid ? cgpa.toFixed(2) : '—'}${need ? ` / 需 ${need.toFixed(2)}` : ''}`,
        en: `CGPA: ${valid ? cgpa.toFixed(2) : '—'}${need ? ` / need ${need.toFixed(2)}` : ''}`,
      },
      messages,
    };
  }

  if (qualification === 'STPM') {
    const points = filled
      .map((r) => STPM_GRADE_POINTS[r.grade])
      .filter((p): p is number => typeof p === 'number');
    const cgpa = points.length ? points.reduce((a, b) => a + b, 0) / points.length : 0;
    const principal = filled.filter((r) => (STPM_GRADE_POINTS[r.grade] ?? 0) >= 2.0).length;
    const passes = countCredits('STPM', rows);
    const need = bachelor ? BACHELOR_STPM_MIN_PASSES : 1;
    const counted = bachelor ? principal : passes;
    const cgpaOk = !bachelor || cgpa >= BACHELOR_MIN_CGPA;
    const ok = counted >= need && cgpaOk;
    const messages: Msg[] = [];
    if (counted < need) {
      messages.push(
        bachelor
          ? { zh: `学士学位需至少 ${need} 科 STPM 达 C 或以上`, en: `Bachelor entry needs at least ${need} STPM subjects at grade C or better` }
          : { zh: 'STPM 需至少 1 科及格', en: 'STPM needs at least 1 pass' },
      );
    }
    if (!cgpaOk) {
      messages.push({
        zh: `按所填成绩估算 CGPA ${cgpa.toFixed(2)}，学士学位要求至少 ${BACHELOR_MIN_CGPA.toFixed(2)}`,
        en: `Estimated CGPA ${cgpa.toFixed(2)} from your grades; bachelor entry needs ${BACHELOR_MIN_CGPA.toFixed(2)}`,
      });
    }
    if (ok) {
      if (bachelor && rule.requiresMath) messages.push(MATH_VERIFY);
      messages.push(FINAL_REVIEW);
    }
    return {
      ...base,
      ok,
      creditCount: counted,
      minCredits: need,
      cgpa,
      summary: bachelor
        ? { zh: `C 或以上：${counted} / 需 ${need} · CGPA ${cgpa.toFixed(2)}`, en: `Grade C+: ${counted} / need ${need} · CGPA ${cgpa.toFixed(2)}` }
        : { zh: `及格科目：${counted} / 需 ${need}`, en: `Passes: ${counted} / need ${need}` },
      messages,
    };
  }

  if (qualification === 'A-Level') {
    const passes = countCredits('A-Level', rows);
    const need = bachelor ? BACHELOR_ALEVEL_MIN_PASSES : 1;
    const ok = passes >= need;
    const messages: Msg[] = ok
      ? [...(bachelor && rule.requiresMath ? [MATH_VERIFY] : []), FINAL_REVIEW]
      : [{ zh: `A-Level 需至少 ${need} 科及格`, en: `A-Level needs at least ${need} pass${need > 1 ? 'es' : ''}` }];
    return {
      ...base,
      ok,
      creditCount: passes,
      minCredits: need,
      summary: { zh: `及格科目：${passes} / 需 ${need}`, en: `Passes: ${passes} / need ${need}` },
      messages,
    };
  }

  // SPM / IGCSE / UEC subject table.
  const threshold = SUBJECT_THRESHOLDS[rule.level][qualification];
  if (!threshold) {
    return {
      ...base,
      ok: true,
      creditCount: 0,
      minCredits: 0,
      summary: { zh: '人工审核', en: 'Manual review' },
      messages: [{ zh: '此学历将由招生团队人工审核', en: 'This qualification will be reviewed manually' }],
    };
  }

  const required: RequiredSubject[] = [
    ...threshold.requiredSubjects,
    ...(rule.requiresMath && !threshold.requiredSubjects.includes('MATH') ? (['MATH'] as const) : []),
  ];

  const creditRows = filled.filter((r) => isCreditGrade(qualification, r.grade));
  const creditCount = creditRows.length;
  const minCredits = threshold.minCredits;
  const creditKeys = new Set(creditRows.map((r) => findSubject(r.subjectId)?.key).filter(Boolean));
  const missingSubjects = required.filter((s) => !creditKeys.has(s));
  const ok = creditCount >= minCredits && missingSubjects.length === 0;

  const creditWord = qualification === 'UEC'
    ? { zh: 'B 或以上', en: 'Grade B or better' }
    : { zh: 'Credit', en: 'Credits' };

  const messages: Msg[] = [];
  if (creditCount < minCredits) {
    messages.push({
      zh: `目前 ${creditWord.zh} 科目：${creditCount}，本课程要求至少 ${minCredits} 科`,
      en: `${creditWord.en}: ${creditCount}; this programme needs at least ${minCredits}`,
    });
  }
  messages.push(...subjectMessages(missingSubjects));
  messages.push(
    ok
      ? FINAL_REVIEW
      : {
          zh: '尚未符合入学门槛，请补足科目或必考科目（如数学）后再继续',
          en: 'Entry requirements not met. Add enough qualifying or required subjects (e.g. Math) to continue',
        },
  );

  return {
    ...base,
    ok,
    creditCount,
    minCredits,
    missingSubjects,
    summary: {
      zh: `${creditWord.zh}：${creditCount} / 需 ${minCredits}`,
      en: `${creditWord.en}: ${creditCount} / need ${minCredits}`,
    },
    messages,
  };
}

export function formatGradesResultJson(
  qualification: QualificationKey,
  rows: GradeRow[],
  check: EntryCheckResult,
  extras: EntryCheckExtras = {},
): string {
  return JSON.stringify({
    qualification,
    ...(typeof extras.cgpa === 'number' ? { cgpa: extras.cgpa } : {}),
    subjects: rows
      .filter((r) => r.subjectId && r.grade)
      .map((r) => {
        const option = findSubject(r.subjectId);
        return {
          subjectId: r.subjectId,
          subject:
            r.subjectId === OTHER_SUBJECT_ID
              ? r.subjectOther || 'Other'
              : option
                ? `${option.code ? `${option.code} ` : ''}${option.native ?? option.en}`
                : r.subjectId,
          grade: r.grade,
        };
      }),
    check: {
      ok: check.ok,
      blocked: check.blocked,
      creditCount: check.creditCount,
      minCredits: check.minCredits,
      missingSubjects: check.missingSubjects,
      ...(typeof check.cgpa === 'number' ? { cgpa: Number(check.cgpa.toFixed(2)) } : {}),
      summary: check.summary.en,
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

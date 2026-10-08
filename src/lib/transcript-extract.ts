/**
 * Turns raw MiniCPM-V output into rows the application form understands.
 *
 * Handles the messy reality of Malaysian result slips: subject names appear in
 * Malay, English or Chinese, and grading scales differ per qualification
 * (SPM / IGCSE / UEC / STPM / A-Level).
 */

import {
  SPM_GRADES,
  IGCSE_GRADES,
  UEC_GRADES,
  STPM_GRADES,
  ALEVEL_GRADES,
  type QualificationKey,
} from '@/data/entry-rules';
import {
  OTHER_SUBJECT_ID,
  findSubject,
  subjectsFor,
  type SubjectOption,
} from '@/data/subjects';
import type { GradeRow } from '@/lib/entry-check';

/** Shape MiniCPM-V is asked to return. */
export interface RawExtraction {
  qualification?: string;
  candidate_name?: string;
  school?: string;
  exam_year?: string;
  subjects?: { subject?: string; grade?: string }[];
}

export interface ExtractedSubject {
  /** Text exactly as the model read it off the page. */
  rawSubject: string;
  rawGrade: string;
  /** Mapped to a SUBJECT_OPTIONS id, or 'OTHER'. */
  subjectId: string;
  subjectOther: string;
  /** Normalised to the qualification's grading scale, '' when unrecognised. */
  grade: string;
  /** Display label for the UI. */
  label: { zh: string; en: string };
  matched: boolean;
}

export interface TranscriptExtraction {
  qualification: QualificationKey | null;
  rawQualification: string;
  candidateName: string;
  school: string;
  examYear: string;
  subjects: ExtractedSubject[];
  /** Subjects the model read but we could not map to a grade. */
  unresolved: number;
}

/* ------------------------------------------------------------------ */
/* Subject matching                                                     */
/* ------------------------------------------------------------------ */

// Additional Mathematics is a separate catalogue entry without the MATH key, so it
// can never satisfy a core-Mathematics entry requirement.

const CATALOG_ORDER = ['SPM', 'IGCSE', 'UEC', 'STPM', 'A-Level'] as const;

interface CatalogIndex {
  byCode: Map<string, SubjectOption>;
  /** Longest pattern first so "additional mathematics" beats "mathematics". */
  patterns: { option: SubjectOption; pattern: string }[];
}

const indexCache = new Map<string, CatalogIndex>();

function catalogFor(qualification: QualificationKey | null): SubjectOption[] {
  const own = subjectsFor(qualification);
  return own.length ? own : CATALOG_ORDER.flatMap((q) => subjectsFor(q));
}

function buildIndex(qualification: QualificationKey | null): CatalogIndex {
  const cacheKey = qualification ?? '*';
  const cached = indexCache.get(cacheKey);
  if (cached) return cached;

  const byCode = new Map<string, SubjectOption>();
  const patterns: CatalogIndex['patterns'] = [];
  for (const option of catalogFor(qualification)) {
    const codes = [option.code, ...(option.aliases ?? []).filter((a) => /^\d{4}$/.test(a))];
    for (const code of codes) {
      if (code && !byCode.has(code.toUpperCase())) byCode.set(code.toUpperCase(), option);
    }
    const names = [option.native, option.en, option.zh, ...(option.aliases ?? [])]
      .filter((v): v is string => Boolean(v) && !/^\d{4}$/.test(v as string))
      .map((v) => normaliseText(v).toLowerCase());
    for (const pattern of new Set(names)) patterns.push({ option, pattern });
  }
  patterns.sort((a, b) => b.pattern.length - a.pattern.length);

  const index = { byCode, patterns };
  indexCache.set(cacheKey, index);
  return index;
}

/** "0580", "1103", "4MA1", "WMA11" — the syllabus / paper code printed on the slip. */
function extractCodes(value: string): string[] {
  const matches = normaliseText(value).toUpperCase().match(/\b(\d{4}|\d[A-Z]{2}\d|W[A-Z]{2}\d{1,2})\b/g);
  return matches ? [...new Set(matches)] : [];
}

function patternHits(key: string, pattern: string): boolean {
  // Short Latin aliases ("bm", "bi", "ict") must match a whole word.
  if (pattern.length <= 3 && /^[a-z]+$/.test(pattern)) {
    return new RegExp(`(^|[^a-z])${pattern}([^a-z]|$)`).test(key);
  }
  return key.includes(pattern);
}

function nameMatch(index: CatalogIndex, keys: string[]): SubjectOption | undefined {
  for (const { option, pattern } of index.patterns) {
    if (keys.some((k) => patternHits(k, pattern))) return option;
  }
  return undefined;
}

function optionMatchesName(option: SubjectOption, keys: string[]): boolean {
  return [option.native, option.en, option.zh, ...(option.aliases ?? [])]
    .filter((v): v is string => Boolean(v))
    .map((v) => normaliseText(v).toLowerCase())
    .some((p) => keys.some((k) => patternHits(k, p)));
}

function labelOf(option: SubjectOption): { zh: string; en: string } {
  const code = option.code ? `${option.code} ` : '';
  return { zh: `${code}${option.zh}`, en: `${code}${option.native ?? option.en}` };
}

function normaliseText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[（）]/g, (m) => (m === '（' ? '(' : ')'))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Name keys with the leading paper code / numbering removed, e.g.
 * "1103 BAHASA MELAYU" -> "bahasa melayu". Returned both with and without
 * bracketed text so "Matematik (T)" and "高级数学(II)" still match precisely.
 */
function subjectKeys(value: string): string[] {
  const full = normaliseText(value)
    .toLowerCase()
    .replace(/\b(\d{4}|\d[a-z]{2}\d|w[a-z]{2}\d{1,2})\b\s*[-.):/]?\s*/g, ' ')
    .replace(/^\d+\s*[.)]\s*/, '')
    .replace(/[*_|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const bare = full.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  return [...new Set([full, bare].filter(Boolean))];
}

export function matchSubject(
  raw: string,
  qualification: QualificationKey | null = null,
): {
  subjectId: string;
  subjectOther: string;
  label: { zh: string; en: string };
} {
  const display = normaliseText(raw);
  const index = buildIndex(qualification);
  const keys = subjectKeys(raw);

  const byCode = extractCodes(raw)
    .map((c) => index.byCode.get(c))
    .find((o): o is SubjectOption => Boolean(o));
  const byName = keys.length ? nameMatch(index, keys) : undefined;

  // Trust the code unless the printed name clearly belongs to a different subject
  // (i.e. the code was probably misread).
  const option =
    byCode && (!byName || byName.id === byCode.id || optionMatchesName(byCode, keys))
      ? byCode
      : byName ?? byCode;

  if (option) {
    return { subjectId: option.id, subjectOther: '', label: labelOf(option) };
  }

  return {
    subjectId: OTHER_SUBJECT_ID,
    subjectOther: display,
    label: { zh: display, en: display },
  };
}

/* ------------------------------------------------------------------ */
/* Grade normalisation                                                  */
/* ------------------------------------------------------------------ */

/** Pre-2009 SPM numeric-letter codes still show up on older slips. */
const LEGACY_SPM: Record<string, string> = {
  '1A': 'A+', '2A': 'A', '3B': 'B+', '4B': 'B', '5C': 'C+',
  '6C': 'C', '7D': 'D', '8E': 'E', '9G': 'G',
};

/** IGCSE 9–1 numeric scale -> legacy letters used by this form. */
const IGCSE_NUMERIC: Record<string, string> = {
  '9': 'A*', '8': 'A*', '7': 'A', '6': 'B', '5': 'B',
  '4': 'C', '3': 'D', '2': 'E', '1': 'F',
};

function cleanGrade(raw: string): string {
  return normaliseText(raw)
    .toUpperCase()
    .replace(/[＊✳]/g, '*')
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, '')
    .replace(/^GRED|^GRADE|^GRED:|^GRADE:/, '')
    .trim();
}

function allowedGrades(q: QualificationKey): readonly string[] {
  switch (q) {
    case 'SPM': return SPM_GRADES;
    case 'IGCSE': return IGCSE_GRADES;
    case 'UEC': return UEC_GRADES;
    case 'STPM': return STPM_GRADES;
    case 'A-Level': return ALEVEL_GRADES;
    default: return SPM_GRADES;
  }
}

export function normaliseGrade(
  qualification: QualificationKey | null,
  raw: string,
): string {
  const value = cleanGrade(raw);
  if (!value) return '';

  const q = qualification || 'SPM';
  const allowed = allowedGrades(q);

  if ((allowed as readonly string[]).includes(value)) return value;

  if (q === 'SPM') {
    if (LEGACY_SPM[value]) return LEGACY_SPM[value];
    // "A1"/"A2" on an SPM slip is really a UEC-style read; treat as plain A.
    if (/^A[12]$/.test(value)) return 'A';
  }

  if (q === 'IGCSE') {
    if (IGCSE_NUMERIC[value]) return IGCSE_NUMERIC[value];
    if (value === 'A+') return 'A*';
  }

  if (q === 'UEC') {
    // Models sometimes drop the digit: "B" -> ambiguous, keep unresolved.
    if (/^[AB][1-6]$/.test(value) || /^C[78]$/.test(value) || value === 'F9') {
      return (allowed as readonly string[]).includes(value) ? value : '';
    }
  }

  if (q === 'STPM' || q === 'A-Level') {
    if (value === 'A+') return q === 'A-Level' ? 'A*' : 'A';
  }

  // Trailing noise like "A(CREDIT)" or "B+ " already stripped; try first token.
  const token = value.match(/^[A-G][*+-]?\d?/)?.[0] || '';
  if (token && (allowed as readonly string[]).includes(token)) return token;

  return '';
}

/* ------------------------------------------------------------------ */
/* Qualification detection                                              */
/* ------------------------------------------------------------------ */

export function normaliseQualification(raw: string): QualificationKey | null {
  const value = normaliseText(raw).toLowerCase();
  if (!value) return null;
  if (/spm|sijil pelajaran malaysia/.test(value)) return 'SPM';
  if (/uec|unified examination|统考|独中统考/.test(value)) return 'UEC';
  if (/igcse|o-?\s?level|gce o/.test(value)) return 'IGCSE';
  if (/stpm|sijil tinggi/.test(value)) return 'STPM';
  if (/a-?\s?level|gce a/.test(value)) return 'A-Level';
  if (/diploma/.test(value)) return 'Diploma';
  if (/foundation|asasi/.test(value)) return 'Foundation';
  return null;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                   */
/* ------------------------------------------------------------------ */

/**
 * Rows that are NOT subjects, even though they sit inside the results table.
 *
 * The prompt already tells the model to skip these, but weaker vision models
 * include them anyway — and "JUMLAH = 9" then looks exactly like a subject with
 * a grade. Dropping them here is the last line of defence, because a bogus row
 * would otherwise be compared against the student's form as a real subject.
 */
const NON_SUBJECT_PATTERNS: RegExp[] = [
  /^jumlah\b/i, // total
  /^gred\s*purata/i, // grade average
  /^purata\b/i,
  /^(gpa|cgpa|pngk|pnga)\b/i,
  /^nama\b/i, // candidate name
  /^(no|nombor|angka)\s*(giliran|kad|pengenalan|calon)/i,
  /^(name|candidate|index|ic|id)\b/i,
  /^(sekolah|school|pusat|centre|center)\b/i,
  /^(tarikh|date|tahun|year)\b/i,
  /^(keputusan|result|status|pangkat|rank|kedudukan)\b/i,
  /^(jumlah\s*)?(kredit|credit)s?\b/i,
  /^(bilangan|number|count|total)\b/i,
  /^(tandatangan|signature|pengetua|principal)\b/i,
  /^(gred|grade)$/i, // a bare column header
  /^(subjek|subject|mata\s*pelajaran)$/i,
  /^(kehadiran|attendance|kokurikulum|co-?curricul)/i,
];

function isNonSubjectRow(name: string): boolean {
  const n = name.trim();
  if (!n) return true;
  // A row that is only digits/punctuation is a code or a total, not a subject.
  if (!/[a-z\u4e00-\u9fff]/i.test(n)) return true;
  return NON_SUBJECT_PATTERNS.some((re) => re.test(n));
}

export function buildExtraction(
  raw: RawExtraction,
  /** Qualification the student already picked — wins over the model's guess. */
  preferredQualification?: QualificationKey | null,
): TranscriptExtraction {
  const detected = normaliseQualification(raw.qualification || '');
  const qualification = preferredQualification || detected;

  const seen = new Set<string>();
  const subjects: ExtractedSubject[] = [];

  for (const entry of raw.subjects || []) {
    const rawSubject = normaliseText(entry?.subject || '');
    const rawGrade = normaliseText(entry?.grade || '');
    if (!rawSubject) continue;
    // Totals, averages, names and headers are not subjects.
    if (isNonSubjectRow(rawSubject)) continue;

    const match = matchSubject(rawSubject, qualification);
    const grade = normaliseGrade(qualification, rawGrade);

    // De-duplicate: a subject can only be counted once by the entry checker.
    const identity =
      match.subjectId === OTHER_SUBJECT_ID
        ? `OTHER:${match.subjectOther.toLowerCase()}`
        : match.subjectId;
    if (seen.has(identity)) continue;
    seen.add(identity);

    subjects.push({
      rawSubject,
      rawGrade,
      subjectId: match.subjectId,
      subjectOther: match.subjectOther,
      grade,
      label: match.label,
      matched: Boolean(grade),
    });
  }

  return {
    qualification,
    rawQualification: normaliseText(raw.qualification || ''),
    candidateName: normaliseText(raw.candidate_name || ''),
    school: normaliseText(raw.school || ''),
    examYear: normaliseText(raw.exam_year || ''),
    subjects,
    unresolved: subjects.filter((s) => !s.matched).length,
  };
}

/** Convert an extraction into form rows (only usable subject+grade pairs). */
export function extractionToGradeRows(extraction: TranscriptExtraction): GradeRow[] {
  return extraction.subjects
    .filter((s) => s.matched)
    .map((s, i) => ({
      id: `ocr-${Date.now()}-${i}`,
      subjectId: s.subjectId,
      subjectOther: s.subjectId === 'OTHER' ? s.subjectOther : '',
      grade: s.grade,
    }));
}

/* ------------------------------------------------------------------ */
/* Verification against what the student typed                          */
/* ------------------------------------------------------------------ */

export type VerdictKind = 'match' | 'mismatch' | 'missing_in_form' | 'missing_on_proof';

export interface VerificationItem {
  subjectId: string;
  label: { zh: string; en: string };
  formGrade: string;
  proofGrade: string;
  kind: VerdictKind;
}

export interface VerificationResult {
  checked: boolean;
  items: VerificationItem[];
  matches: number;
  mismatches: number;
  /** Subjects typed by the student but absent from the uploaded proof. */
  unverified: number;
}

function rowIdentity(subjectId: string, subjectOther: string): string {
  return subjectId === 'OTHER'
    ? `OTHER:${subjectOther.trim().toLowerCase()}`
    : subjectId;
}

function labelFor(subjectId: string, subjectOther: string): { zh: string; en: string } {
  if (subjectId === OTHER_SUBJECT_ID) {
    const text = subjectOther || 'Other';
    return { zh: text, en: text };
  }
  const option = findSubject(subjectId);
  return option ? labelOf(option) : { zh: subjectId, en: subjectId };
}

/** Compare form rows with the AI reading of the uploaded slip. */
export function verifyAgainstRows(
  extraction: TranscriptExtraction,
  rows: GradeRow[],
): VerificationResult {
  const filled = rows.filter((r) => r.subjectId && r.grade);
  if (!filled.length || !extraction.subjects.length) {
    return { checked: false, items: [], matches: 0, mismatches: 0, unverified: 0 };
  }

  const proof = new Map<string, ExtractedSubject>();
  for (const s of extraction.subjects) {
    if (s.matched) proof.set(rowIdentity(s.subjectId, s.subjectOther), s);
  }

  const items: VerificationItem[] = [];
  const usedProofKeys = new Set<string>();

  for (const row of filled) {
    const key = rowIdentity(row.subjectId, row.subjectOther);
    const hit = proof.get(key);
    if (!hit) {
      items.push({
        subjectId: row.subjectId,
        label: labelFor(row.subjectId, row.subjectOther),
        formGrade: row.grade,
        proofGrade: '',
        kind: 'missing_on_proof',
      });
      continue;
    }
    usedProofKeys.add(key);
    items.push({
      subjectId: row.subjectId,
      label: labelFor(row.subjectId, row.subjectOther),
      formGrade: row.grade,
      proofGrade: hit.grade,
      kind: hit.grade === row.grade ? 'match' : 'mismatch',
    });
  }

  for (const [key, s] of proof) {
    if (usedProofKeys.has(key)) continue;
    items.push({
      subjectId: s.subjectId,
      label: s.label,
      formGrade: '',
      proofGrade: s.grade,
      kind: 'missing_in_form',
    });
  }

  return {
    checked: true,
    items,
    matches: items.filter((i) => i.kind === 'match').length,
    mismatches: items.filter((i) => i.kind === 'mismatch').length,
    unverified: items.filter((i) => i.kind === 'missing_on_proof').length,
  };
}

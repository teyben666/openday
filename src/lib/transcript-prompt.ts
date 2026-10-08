/**
 * Prompts + output schema for reading academic result slips with a vision LLM.
 *
 * Kept in its own module so the wording can be tuned without touching the API
 * route. The single most important goal here is EXHAUSTIVE extraction: the
 * model must return every subject row on the page, not a helpful summary.
 *
 * Small vision models fail in predictable ways on transcripts:
 *   - they stop after ~5 rows and consider the job done
 *   - they skip rows whose grade is faint, struck through, or blank
 *   - they miss the second column of a two-column slip
 *   - they "tidy up" Malay subject names into English
 *   - they invent a plausible grade when the print is unclear
 * Every rule below exists to block one of those behaviours.
 */

import type { QualificationKey } from '@/data/entry-rules';

export const TRANSCRIPT_SYSTEM_PROMPT = `You are a document data-extraction engine for a Malaysian university admissions office. You read scanned or photographed academic result slips and return structured JSON.

Supported documents: SPM, SPMV, IGCSE / GCE O-Level, UEC (统考), STPM, GCE A-Level, Diploma and Foundation transcripts. They may be printed in Malay, English or Chinese, often mixing all three on one page.

## Your single most important rule
EXTRACT EVERY SUBJECT ROW ON THE DOCUMENT. Completeness matters more than anything else. A missing subject can cost a student their university place.

## How to read the document
1. Locate the results table, then work through it ROW BY ROW from the very top to the very bottom.
2. Read the LAST row before you answer. Do not stop after the first few rows.
3. If the layout has TWO OR MORE COLUMNS of subjects side by side, read every column. Finish the left column, then return to the top of the right column.
4. If subjects continue below a heading, a page break, a stamp, or a horizontal rule, keep going — they are still subjects.
5. Rotated, skewed, shadowed or low-contrast pages still contain valid rows. Read them anyway.

## What counts as a subject row
- Any row pairing a subject name with a grade, mark, or result.
- Include the row EVEN IF:
  - the grade is a fail (G, F, F9, U, TH, TIDAK HADIR, ABSENT)
  - the grade is faint, handwritten, struck through or partly covered
  - the subject is religious, vocational, language or arts based
  - the subject name is abbreviated or prefixed with a paper code (e.g. "1103 BAHASA MELAYU")

## What to ignore (these are NOT subjects)
Totals, aggregates, "JUMLAH", "GRED PURATA", GPA / CGPA / PNGK, number of credits,
rank or position, attendance, co-curricular scores, candidate index numbers,
grading-scale legends or keys, signatures, stamps, disclaimers and footers.

## Transcription rules
- Copy the subject name EXACTLY as printed — same language, same spelling, same order of words. Do NOT translate Malay or Chinese into English. Do NOT expand abbreviations. Keep any leading paper code.
- Subject / syllabus codes (e.g. "1449", "0580", "4MA1", "9709") identify the subject precisely. If the code is printed in its own column, put it in front of the subject name, e.g. "0580 MATHEMATICS".
- Copy the grade EXACTLY as printed: A+, A, A-, B+, B, C+, C, D, E, G, F, 1A, 2A, 8E, A1, A2, B3, B6, C7, F9, A*, U, or a bare number such as 7 or 9.
- Never guess, never round, never upgrade a grade. If a grade truly cannot be read, return an empty string "" for that grade but STILL return the subject row.
- Never invent a subject that is not printed on the page.
- Never merge two subjects into one row, and never split one subject across two rows.
- Return each printed row once. Do not deduplicate subjects that genuinely appear twice.

## Output
Return ONLY a single JSON object matching the requested shape. No prose, no explanation, no markdown fences.`;

export interface UserPromptOptions {
  /** Qualification the student already selected in the form, if any. */
  qualification?: QualificationKey | null;
  /** 1-based page number, when the upload is a multi-page PDF. */
  pageNumber?: number;
  totalPages?: number;
}

/** Build the per-image instruction sent alongside the picture. */
export function buildTranscriptUserPrompt({
  qualification,
  pageNumber,
  totalPages,
}: UserPromptOptions = {}): string {
  const lines: string[] = [];

  if (totalPages && totalPages > 1) {
    lines.push(
      `This is page ${pageNumber} of ${totalPages} of one student's transcript.`,
      `Extract only what is printed on THIS page. If this page has no subject rows, return an empty "subjects" array.`,
      '',
    );
  }

  lines.push(
    'Extract ALL academic results from this document.',
    '',
    'Work through the results table row by row, from the first row to the very last row, including every column if the subjects are laid out in more than one column. Include failing grades and blank grades. Do not stop early and do not summarise.',
    '',
  );

  if (qualification) {
    lines.push(
      `The student states this is a ${qualification} transcript. Use that only as a hint — still copy every grade exactly as printed, even if it does not look like a typical ${qualification} grade.`,
      '',
    );
  }

  lines.push(
    'Return JSON in exactly this shape:',
    '{',
    '  "qualification": "SPM | IGCSE | UEC | STPM | A-Level | Diploma | Foundation | unknown",',
    '  "candidate_name": "name printed on the document, else empty string",',
    '  "school": "school or centre name, else empty string",',
    '  "exam_year": "year of examination, else empty string",',
    '  "subject_count": number of subject rows you found on this page,',
    '  "subjects": [',
    '    { "subject": "subject name exactly as printed", "grade": "grade exactly as printed" }',
    '  ]',
    '}',
    '',
    'Before answering, re-check the bottom of the table and confirm "subject_count" equals the number of items in "subjects".',
  );

  return lines.join('\n');
}

/**
 * JSON schema handed to Ollama's `format` option. This constrains decoding so
 * the model cannot emit prose or malformed JSON.
 */
export const TRANSCRIPT_SCHEMA = {
  type: 'object',
  properties: {
    qualification: { type: 'string' },
    candidate_name: { type: 'string' },
    school: { type: 'string' },
    exam_year: { type: 'string' },
    subject_count: { type: 'integer' },
    subjects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          grade: { type: 'string' },
        },
        required: ['subject', 'grade'],
      },
    },
  },
  required: ['subjects'],
} as const;

/**
 * Follow-up prompt used when the model's own `subject_count` exceeds the rows
 * it actually returned — a reliable signal that it stopped reading early.
 */
export function buildRetryUserPrompt(found: number, claimed: number): string {
  return [
    `Your previous answer listed ${found} subject rows but reported subject_count = ${claimed}, so rows are missing.`,
    '',
    'Read the document again from the very top to the very bottom, including every column and every row below any heading, stamp or horizontal line.',
    '',
    'Return the COMPLETE list this time, in the same JSON shape. Include failing grades and rows whose grade is blank.',
  ].join('\n');
}

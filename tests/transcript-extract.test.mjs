/**
 * Unit tests for transcript parsing (no Ollama needed).
 * Run: node --import ./tests/ts-loader-hook.mjs --test tests/transcript-extract.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
const {
  buildExtraction,
  matchSubject,
  normaliseGrade,
  normaliseQualification,
  verifyAgainstRows,
  extractionToGradeRows,
} = await import('../src/lib/transcript-extract.ts');

test('matches Malay SPM subject names to catalogue ids', () => {
  assert.equal(matchSubject('BAHASA MELAYU', 'SPM').subjectId, 'SPM-BM');
  assert.equal(matchSubject('1103 Bahasa Melayu', 'SPM').subjectId, 'SPM-BM');
  assert.equal(matchSubject('Matematik', 'SPM').subjectId, 'SPM-MATH');
  assert.equal(matchSubject('SEJARAH', 'SPM').subjectId, 'SPM-SEJ');
  assert.equal(matchSubject('Prinsip Perakaunan', 'SPM').subjectId, 'SPM-PA');
  assert.equal(matchSubject('Bahasa Inggeris', 'SPM').subjectId, 'SPM-BI');
  assert.equal(matchSubject('SAINS KOMPUTER', 'SPM').subjectId, 'SPM-CS');
  assert.equal(matchSubject('PENDIDIKAN MORAL', 'SPM').subjectId, 'SPM-PM');
});

test('matches Chinese subject names', () => {
  assert.equal(matchSubject('华文', 'SPM').subjectId, 'SPM-BC');
  assert.equal(matchSubject('数学', 'UEC').subjectId, 'UEC-MATH');
  assert.equal(matchSubject('国文', 'UEC').subjectId, 'UEC-BM');
  assert.equal(matchSubject('高级数学(II)', 'UEC').subjectId, 'UEC-AM2');
});

test('Additional Mathematics is NOT treated as core Mathematics', () => {
  assert.equal(matchSubject('Matematik Tambahan', 'SPM').subjectId, 'SPM-AMATH');
  assert.equal(matchSubject('3472 MATEMATIK TAMBAHAN', 'SPM').subjectId, 'SPM-AMATH');
  assert.equal(matchSubject('0606 Additional Mathematics', 'IGCSE').subjectId, 'IG-0606');
  assert.equal(matchSubject('高级数学', 'UEC').subjectId, 'UEC-AM1');
});

test('IGCSE subjects are matched by syllabus code first', () => {
  assert.equal(matchSubject('0580 MATHEMATICS', 'IGCSE').subjectId, 'IG-0580');
  assert.equal(matchSubject('0980 Mathematics (9-1)', 'IGCSE').subjectId, 'IG-0980');
  assert.equal(matchSubject('Physics 0625', 'IGCSE').subjectId, 'IG-0625');
  assert.equal(matchSubject('4MA1 Mathematics A', 'IGCSE').subjectId, 'IG-4MA1');
  assert.equal(matchSubject('0511 ENGLISH AS A SECOND LANGUAGE', 'IGCSE').subjectId, 'IG-0511');
  // A misread code loses to a clearly different printed name.
  assert.equal(matchSubject('0625 CHEMISTRY', 'IGCSE').subjectId, 'IG-0620');
});

test('A-Level and STPM subjects', () => {
  assert.equal(matchSubject('9709 Mathematics', 'A-Level').subjectId, 'AL-9709');
  assert.equal(matchSubject('Matematik (T)', 'STPM').subjectId, 'STPM-MT');
  assert.equal(matchSubject('Pengajian Am', 'STPM').subjectId, 'STPM-PA');
});

test('unknown subjects fall back to OTHER with the printed text', () => {
  const m = matchSubject('Underwater Basket Weaving', 'SPM');
  assert.equal(m.subjectId, 'OTHER');
  assert.equal(m.subjectOther, 'Underwater Basket Weaving');
});

test('normalises grades per qualification', () => {
  assert.equal(normaliseGrade('SPM', 'A+'), 'A+');
  assert.equal(normaliseGrade('SPM', '1A'), 'A+'); // legacy slip
  assert.equal(normaliseGrade('SPM', ' b+ '), 'B+');
  assert.equal(normaliseGrade('IGCSE', '7'), 'A'); // 9-1 scale
  assert.equal(normaliseGrade('IGCSE', 'A*'), 'A*');
  assert.equal(normaliseGrade('UEC', 'B4'), 'B4');
  assert.equal(normaliseGrade('A-Level', 'E'), 'E');
  assert.equal(normaliseGrade('SPM', 'ZZ'), ''); // unreadable stays empty
});

test('detects qualification from slip text', () => {
  assert.equal(normaliseQualification('Sijil Pelajaran Malaysia'), 'SPM');
  assert.equal(normaliseQualification('统考'), 'UEC');
  assert.equal(normaliseQualification('GCE O-Level'), 'IGCSE');
  assert.equal(normaliseQualification('nonsense'), null);
});

test('builds extraction and de-duplicates subjects', () => {
  const extraction = buildExtraction({
    qualification: 'SPM',
    candidate_name: 'Tan Wei Ming',
    exam_year: '2024',
    subjects: [
      { subject: 'BAHASA MELAYU', grade: 'A' },
      { subject: 'Bahasa Melayu', grade: 'B' }, // duplicate, dropped
      { subject: 'MATEMATIK', grade: 'A+' },
      { subject: 'SEJARAH', grade: 'C' },
      { subject: 'Pendidikan Seni', grade: '???' }, // unreadable grade
    ],
  });

  assert.equal(extraction.qualification, 'SPM');
  assert.equal(extraction.candidateName, 'Tan Wei Ming');
  assert.equal(extraction.subjects.length, 4);
  assert.equal(extraction.unresolved, 1);

  const rows = extractionToGradeRows(extraction);
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows.map((r) => [r.subjectId, r.grade]),
    [['SPM-BM', 'A'], ['SPM-MATH', 'A+'], ['SPM-SEJ', 'C']],
  );
});

test('student-selected qualification overrides the model guess', () => {
  const extraction = buildExtraction(
    { qualification: 'SPM', subjects: [{ subject: 'Mathematics', grade: 'B4' }] },
    'UEC',
  );
  assert.equal(extraction.qualification, 'UEC');
  assert.equal(extraction.subjects[0].subjectId, 'UEC-MATH');
  assert.equal(extraction.subjects[0].grade, 'B4');
});

test('verification flags mismatched grades', () => {
  const extraction = buildExtraction({
    qualification: 'SPM',
    subjects: [
      { subject: 'Bahasa Melayu', grade: 'A' },
      { subject: 'Matematik', grade: 'C' },
      { subject: 'Sejarah', grade: 'B' },
    ],
  });

  const rows = [
    { id: '1', subjectId: 'SPM-BM', subjectOther: '', grade: 'A' },
    { id: '2', subjectId: 'SPM-MATH', subjectOther: '', grade: 'A+' }, // student inflated
    { id: '3', subjectId: 'SPM-PHY', subjectOther: '', grade: 'B' }, // not on slip
  ];

  const result = verifyAgainstRows(extraction, rows);
  assert.equal(result.checked, true);
  assert.equal(result.matches, 1);
  assert.equal(result.mismatches, 1);
  assert.equal(result.unverified, 1);

  const mathRow = result.items.find((i) => i.subjectId === 'SPM-MATH');
  assert.equal(mathRow.kind, 'mismatch');
  assert.equal(mathRow.formGrade, 'A+');
  assert.equal(mathRow.proofGrade, 'C');

  // Sejarah was on the slip but missing from the form.
  assert.ok(result.items.some((i) => i.kind === 'missing_in_form'));
});

test('verification is skipped when nothing to compare', () => {
  const empty = buildExtraction({ subjects: [] });
  assert.equal(verifyAgainstRows(empty, []).checked, false);
});

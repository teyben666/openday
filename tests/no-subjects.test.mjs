/**
 * Regression tests for "No subjects could be read from that document".
 *
 * That error used to be a dead end: it discarded the model's reply, so there
 * was no way to tell a blurry photo from a wrong model from a truncated JSON.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { parseJsonLoose } = await import('../src/lib/ollama.ts');
const { buildExtraction } = await import('../src/lib/transcript-extract.ts');
const { NoSubjectsError } = await import('../src/lib/transcript-scan.ts');

test('non-subject rows are dropped, real subjects kept', () => {
  const out = buildExtraction(
    {
      qualification: 'SPM',
      subjects: [
        { subject: 'BAHASA MELAYU', grade: 'A' },
        { subject: 'JUMLAH', grade: '9' },
        { subject: 'GRED PURATA', grade: '2.5' },
        { subject: 'MATEMATIK', grade: 'A+' },
        { subject: 'NAMA CALON', grade: '' },
        { subject: 'BILANGAN KREDIT', grade: '7' },
        { subject: 'SEJARAH', grade: 'C' },
      ],
    },
    'SPM',
  );
  const names = out.subjects.map((s) => s.rawSubject);
  assert.deepEqual(names, ['BAHASA MELAYU', 'MATEMATIK', 'SEJARAH']);
});

test('a numeric-only row is never treated as a subject', () => {
  const out = buildExtraction(
    { subjects: [{ subject: '1103', grade: 'A' }, { subject: '2025', grade: 'B' }] },
    'SPM',
  );
  assert.equal(out.subjects.length, 0);
});

test('a subject with a paper-code prefix is still kept', () => {
  // "1103 BAHASA MELAYU" is a real row — only bare codes should be dropped.
  const out = buildExtraction(
    { subjects: [{ subject: '1103 BAHASA MELAYU', grade: 'A' }] },
    'SPM',
  );
  assert.equal(out.subjects.length, 1);
});

test('Chinese subject names survive the non-subject filter', () => {
  const out = buildExtraction({ subjects: [{ subject: '华文', grade: 'A' }] }, 'UEC');
  assert.equal(out.subjects.length, 1);
});

test('truncated JSON salvages the complete rows', () => {
  // Reply cut off mid-object: the first row is whole, the second is not.
  const truncated =
    '{"qualification":"SPM","subject_count":9,"subjects":[' +
    '{"subject":"BAHASA MELAYU","grade":"A"},{"subject":"MATEMA';
  const parsed = parseJsonLoose(truncated);
  assert.ok(parsed, 'should salvage rather than return null');
  assert.equal(parsed.subjects.length, 1);
  assert.equal(parsed.subjects[0].subject, 'BAHASA MELAYU');
  assert.equal(parsed.subjects[0].grade, 'A');
});

test('salvage never invents a grade for a half-written row', () => {
  const truncated = '{"subjects":[{"subject":"MATEMATIK","gra';
  assert.equal(parseJsonLoose(truncated), null);
});

test('valid JSON is unaffected by the salvage path', () => {
  const good = '{"subjects":[{"subject":"FIZIK","grade":"B+"}]}';
  assert.equal(parseJsonLoose(good).subjects[0].grade, 'B+');
});

test('prose replies still fail, but are distinguishable', () => {
  assert.equal(parseJsonLoose('I cannot read this image clearly.'), null);
});

test('NoSubjectsError carries the reason and the evidence', () => {
  const e = new NoSubjectsError('all_unmatched', { rawSubjects: ['JUMLAH = 9'] });
  assert.equal(e.reason, 'all_unmatched');
  assert.deepEqual(e.rawSubjects, ['JUMLAH = 9']);

  const u = new NoSubjectsError('unparseable', { sample: 'I cannot read...' });
  assert.equal(u.reason, 'unparseable');
  assert.match(u.sample, /cannot read/);
  // Distinct messages so the log says which failure happened.
  assert.notEqual(u.message, e.message);
});

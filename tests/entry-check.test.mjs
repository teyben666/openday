/**
 * Entry-requirement rules (no Ollama needed).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
const { checkEntryEligibility } = await import('../src/lib/entry-check.ts');

const rows = (pairs) =>
  pairs.map(([subjectId, grade], i) => ({ id: String(i), subjectId, subjectOther: '', grade }));

const strongSpm = rows([
  ['SPM-BM', 'A'], ['SPM-BI', 'A'], ['SPM-MATH', 'A'], ['SPM-SEJ', 'B'], ['SPM-PHY', 'A'], ['SPM-CHE', 'B+'],
]);

test('SPM cannot enter a bachelor degree, however good the grades', () => {
  const r = checkEntryEligibility('BBA', 'SPM', strongSpm);
  assert.equal(r.ok, false);
  assert.equal(r.blocked, true);
});

test('IGCSE cannot enter a bachelor degree', () => {
  const r = checkEntryEligibility('BCS', 'IGCSE', rows([['IG-0580', 'A*'], ['IG-0625', 'A'], ['IG-0620', 'A'], ['IG-0610', 'A'], ['IG-0500', 'A']]));
  assert.equal(r.blocked, true);
});

test('SPM still qualifies for Foundation and Diploma', () => {
  assert.equal(checkEntryEligibility('FCC', 'SPM', strongSpm).ok, true);
  assert.equal(checkEntryEligibility('DBA', 'SPM', strongSpm).ok, true);
});

test('Diploma with Maths requirement needs core Maths, not Add Maths', () => {
  const noCoreMaths = rows([['SPM-BM', 'A'], ['SPM-AMATH', 'A'], ['SPM-BI', 'A']]);
  const r = checkEntryEligibility('DIT', 'SPM', noCoreMaths);
  assert.equal(r.ok, false);
  assert.deepEqual(r.missingSubjects, ['MATH']);
});

test('UEC 5 Bs qualifies for a bachelor degree', () => {
  const uec = rows([['UEC-CHI', 'A2'], ['UEC-BM', 'B5'], ['UEC-ENG', 'B4'], ['UEC-MATH', 'B3'], ['UEC-PHY', 'B6']]);
  assert.equal(checkEntryEligibility('BBA', 'UEC', uec).ok, true);
  assert.equal(checkEntryEligibility('BCS', 'UEC', uec).ok, true);
  const four = uec.slice(0, 4);
  assert.equal(checkEntryEligibility('BBA', 'UEC', four).ok, false);
});

test('UEC bachelor with Maths requirement needs UEC Mathematics', () => {
  const uec = rows([['UEC-CHI', 'A2'], ['UEC-BM', 'B5'], ['UEC-ENG', 'B4'], ['UEC-AM1', 'B3'], ['UEC-PHY', 'B6']]);
  assert.equal(checkEntryEligibility('BCS', 'UEC', uec).ok, false);
});

test('STPM bachelor needs 2 subjects at C and CGPA 2.0', () => {
  assert.equal(checkEntryEligibility('BBA', 'STPM', rows([['STPM-PA', 'B'], ['STPM-EKO', 'C+']])).ok, true);
  assert.equal(checkEntryEligibility('BBA', 'STPM', rows([['STPM-PA', 'C-'], ['STPM-EKO', 'D']])).ok, false);
});

test('A-Level bachelor needs 2 passes', () => {
  assert.equal(checkEntryEligibility('BBA', 'A-Level', rows([['AL-9709', 'C'], ['AL-9708', 'E']])).ok, true);
  assert.equal(checkEntryEligibility('BBA', 'A-Level', rows([['AL-9709', 'C'], ['AL-9708', 'U']])).ok, false);
});

test('Diploma / Foundation holders enter a degree with CGPA 2.0+', () => {
  assert.equal(checkEntryEligibility('BBA', 'Diploma', [], { cgpa: 2.5 }).ok, true);
  assert.equal(checkEntryEligibility('BBA', 'Foundation', [], { cgpa: 1.8 }).ok, false);
  assert.equal(checkEntryEligibility('BBA', 'Diploma', [], {}).ok, false);
});

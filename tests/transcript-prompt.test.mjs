/**
 * Tests for the extraction prompt builder.
 * Run: npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  TRANSCRIPT_SYSTEM_PROMPT,
  TRANSCRIPT_SCHEMA,
  buildTranscriptUserPrompt,
  buildRetryUserPrompt,
} = await import('../src/lib/transcript-prompt.ts');

test('system prompt demands exhaustive extraction', () => {
  const p = TRANSCRIPT_SYSTEM_PROMPT;
  assert.match(p, /EVERY SUBJECT ROW/i);
  assert.match(p, /row by row/i);
  // Must explicitly keep failing and blank grades.
  assert.match(p, /\bG\b|\bF9\b|fail/i);
  // Must handle multi-column layouts.
  assert.match(p, /column/i);
  // Must forbid translating Malay/Chinese subject names.
  assert.match(p, /do not translate/i);
  // Must forbid inventing data.
  assert.match(p, /never invent/i);
  // Must list the things that are not subjects.
  assert.match(p, /GPA|CGPA|aggregate/i);
});

test('system prompt names every supported qualification', () => {
  for (const q of ['SPM', 'IGCSE', 'UEC', 'STPM', 'A-Level']) {
    assert.ok(
      TRANSCRIPT_SYSTEM_PROMPT.includes(q),
      `system prompt should mention ${q}`,
    );
  }
});

test('user prompt asks for all rows and a self-check count', () => {
  const p = buildTranscriptUserPrompt();
  assert.match(p, /ALL academic results/i);
  assert.match(p, /subject_count/);
  assert.match(p, /do not stop early/i);
  assert.match(p, /"subjects"/);
});

test('user prompt includes the qualification hint when known', () => {
  const p = buildTranscriptUserPrompt({ qualification: 'UEC' });
  assert.match(p, /UEC transcript/);
  // ...but still insists on verbatim grades.
  assert.match(p, /exactly as printed/i);
});

test('user prompt omits the hint when qualification is unknown', () => {
  const p = buildTranscriptUserPrompt({ qualification: null });
  assert.ok(!/states this is a/.test(p));
});

test('multi-page prompts scope the model to one page', () => {
  const p = buildTranscriptUserPrompt({ pageNumber: 2, totalPages: 3 });
  assert.match(p, /page 2 of 3/);
  assert.match(p, /THIS page/);
  assert.match(p, /empty "subjects" array/);

  // Single-page uploads should not mention pages at all.
  const single = buildTranscriptUserPrompt({ pageNumber: 1, totalPages: 1 });
  assert.ok(!/page 1 of 1/.test(single));
});

test('retry prompt states the shortfall explicitly', () => {
  const p = buildRetryUserPrompt(4, 9);
  assert.match(p, /4 subject rows/);
  assert.match(p, /subject_count = 9/);
  assert.match(p, /rows are missing/);
});

test('schema constrains output to the expected shape', () => {
  assert.equal(TRANSCRIPT_SCHEMA.type, 'object');
  assert.deepEqual(TRANSCRIPT_SCHEMA.required, ['subjects']);
  const item = TRANSCRIPT_SCHEMA.properties.subjects.items;
  assert.deepEqual(item.required, ['subject', 'grade']);
  assert.equal(TRANSCRIPT_SCHEMA.properties.subject_count.type, 'integer');
});

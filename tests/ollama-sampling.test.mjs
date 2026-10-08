/**
 * Regression tests for the "token repeat limit reached" fix.
 *
 * Ollama aborts a prediction when a model loops on repeated tokens — a known
 * failure when OCR-ing documents with dotted leader lines. Greedy decoding
 * (temperature 0) cannot escape the loop, so we escalate sampling and retry.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { SAMPLING_PROFILES, isRepeatLoopError, OllamaError } = await import(
  '../src/lib/ollama.ts'
);

test('detects Ollama repeat-loop aborts', () => {
  assert.ok(isRepeatLoopError('prediction aborted, token repeat limit reached'));
  assert.ok(isRepeatLoopError('token repeat limit reached'));
  assert.ok(isRepeatLoopError('Prediction Aborted')); // case-insensitive
  // Must not swallow unrelated failures.
  assert.ok(!isRepeatLoopError('model not found'));
  assert.ok(!isRepeatLoopError('context canceled'));
  assert.ok(!isRepeatLoopError(''));
});

test('first profile stays deterministic for best accuracy', () => {
  const first = SAMPLING_PROFILES[0];
  assert.equal(first.temperature, 0);
  assert.equal(first.seed, 1, 'seed makes the default pass reproducible');
});

test('later profiles loosen sampling so a loop can break', () => {
  assert.ok(SAMPLING_PROFILES.length >= 3, 'need retries to recover');

  for (let i = 1; i < SAMPLING_PROFILES.length; i++) {
    const prev = SAMPLING_PROFILES[i - 1];
    const cur = SAMPLING_PROFILES[i];
    assert.ok(
      cur.temperature > prev.temperature,
      `profile ${i} must raise temperature (${prev.temperature} -> ${cur.temperature})`,
    );
    assert.ok(
      cur.repeatPenalty > prev.repeatPenalty,
      `profile ${i} must raise repeat penalty`,
    );
    assert.ok(cur.repeatLastN >= prev.repeatLastN);
  }
});

test('repeat penalties stay gentle so real repeated grades survive', () => {
  // A transcript legitimately contains many identical grades (A, A, A).
  // An aggressive penalty makes the model invent different grades to avoid
  // repeating itself — worse than the loop being fixed.
  for (const p of SAMPLING_PROFILES) {
    assert.ok(
      p.repeatPenalty <= 1.2,
      `repeat_penalty ${p.repeatPenalty} is too aggressive for grade lists`,
    );
  }
});

test('every profile caps generation length', () => {
  for (const p of SAMPLING_PROFILES) {
    assert.ok(p.numPredict > 0, 'num_predict must bound a runaway generation');
    assert.ok(p.numPredict <= 4096);
  }
});

test('repeat_loop is a distinct, retryable error code', () => {
  const err = new OllamaError('looped', 'repeat_loop', 'retry');
  assert.equal(err.code, 'repeat_loop');
  assert.equal(err.name, 'OllamaError');
  // Distinct from terminal failures, which must NOT be retried.
  assert.notEqual(err.code, 'model_missing');
  assert.notEqual(err.code, 'unreachable');
});

test('vision capability is part of the health verdict', async () => {
  const { checkOllama } = await import('../src/lib/ollama.ts');
  // Contract check: the health shape must expose visionCapable so routes can
  // distinguish "not installed" from "installed but cannot see".
  const health = await checkOllama('definitely-not-a-real-model');
  assert.ok('visionCapable' in health);
  assert.equal(health.ok, false);
});

test('not_vision is a distinct error code', async () => {
  const { OllamaError } = await import('../src/lib/ollama.ts');
  const err = new OllamaError('nope', 'not_vision', 'pull a vision model');
  assert.equal(err.code, 'not_vision');
  // Must not be conflated with a missing model — the remedies differ.
  assert.notEqual(err.code, 'model_missing');
});

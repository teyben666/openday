/**
 * Diagnose the local Ollama setup.
 *
 *   node tests/diagnose.mjs
 *
 * Checks, in order: can we reach Ollama, is the configured model installed,
 * can it actually see images, and does a real inference succeed. Prints the
 * underlying Ollama error rather than just a status code.
 */
import fs from 'node:fs';
import path from 'node:path';

// Read .env without a dependency.
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const BASE = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
const MODEL = process.env.OLLAMA_VISION_MODEL || 'minicpm-v4.6';

const ok = (m) => console.log(`  \x1b[32mOK\x1b[0m    ${m}`);
const bad = (m) => console.log(`  \x1b[31mFAIL\x1b[0m  ${m}`);
const warn = (m) => console.log(`  \x1b[33mWARN\x1b[0m  ${m}`);
const info = (m) => console.log(`        ${m}`);

console.log(`\nOllama diagnostics\n  base URL: ${BASE}\n  model:    ${MODEL}\n`);

// 1. Reachable?
let tags;
try {
  const res = await fetch(`${BASE}/api/tags`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  tags = await res.json();
  ok('Ollama is reachable');
} catch (e) {
  bad(`Cannot reach Ollama at ${BASE} (${e.message})`);
  info('Start it with:  ollama serve');
  process.exit(1);
}

// 2. Installed?
const installed = (tags.models || []).map((m) => m.name || m.model).filter(Boolean);
info(`installed: ${installed.join(', ') || '(none)'}`);
const base = (s) => (s.includes(':') ? s.split(':')[0] : s);
const found = installed.find((m) => m === MODEL || base(m) === base(MODEL));
if (found) ok(`"${MODEL}" is installed (as ${found})`);
else {
  bad(`"${MODEL}" is NOT installed`);
  info(`Fix:  ollama pull ${MODEL}`);
  process.exit(1);
}

// 3. Vision-capable? This is the silent killer: a text-only model does not
//    error on image input, it just ignores the image and invents an answer.
let caps = null;
try {
  const res = await fetch(`${BASE}/api/show`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL }),
    signal: AbortSignal.timeout(5000),
  });
  if (res.ok) caps = (await res.json()).capabilities || null;
} catch {
  /* older Ollama */
}

if (caps === null) {
  warn('Ollama did not report capabilities (older version) — cannot verify vision');
} else if (caps.includes('vision')) {
  ok(`model reports vision support (${caps.join(', ')})`);
} else {
  bad(`"${MODEL}" has NO vision capability (${caps.join(', ')})`);
  info('It will ignore the image and invent grades. Pick a vision model:');
  for (const m of installed) {
    try {
      const r = await fetch(`${BASE}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m }),
      });
      const c = r.ok ? (await r.json()).capabilities || [] : [];
      if (c.includes('vision')) info(`  - ${m}`);
    } catch {
      /* ignore */
    }
  }
  info('Or:  ollama pull minicpm-v4.6');
  process.exit(1);
}

// 4. Real inference on a tiny generated image.
console.log('\n  running a real inference (first run loads the model, be patient)...');
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAIAAAC2sZ/WAAAAY0lEQVR4nO3QMQEAAAjDMMC/56EB' +
    'BxqhQs7WBQDwYwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAB4bQEZlgABm2LvxQAAAABJRU5ErkJggg==',
  'base64',
);

const started = Date.now();
try {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages: [
        { role: 'user', content: 'Reply with the word OK.', images: [png.toString('base64')] },
      ],
      options: { temperature: 0, num_predict: 16 },
    }),
    signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS || 120000)),
  });

  const text = await res.text();
  const secs = ((Date.now() - started) / 1000).toFixed(1);

  if (!res.ok) {
    bad(`inference failed after ${secs}s — HTTP ${res.status}`);
    info(text.slice(0, 400));
    if (/more system memory|insufficient memory|out of memory/i.test(text)) {
      info('');
      info('This model does not fit in your available memory.');
      info('Fix:  ollama pull minicpm-v4.6   (1.6GB, the smallest good option)');
      info('Also: close other apps, or run  ollama stop <other-model>');
    }
    if (/token repeat limit|prediction aborted/i.test(text)) {
      info('Repeat-loop abort — the app retries this automatically.');
    }
    process.exit(1);
  }

  const data = JSON.parse(text);
  ok(`inference succeeded in ${secs}s`);
  info(`reply: ${JSON.stringify(data.message?.content?.slice(0, 80) || '')}`);
  console.log('\n  Everything looks good.\n');
} catch (e) {
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  bad(`inference failed after ${secs}s: ${e.message}`);
  if (e.name === 'TimeoutError' || /timeout/i.test(e.message)) {
    info('The model is too slow on this hardware, or too big to load.');
    info('Try a smaller model:  ollama pull minicpm-v4.6');
    info('Or raise OLLAMA_TIMEOUT_MS in .env');
  }
  process.exit(1);
}

// 5. Can it actually EXTRACT from a result slip? A model can pass step 4 and
//    still return prose or an empty list on a real document — which surfaces
//    as "No subjects could be read from that document".
const slip = process.argv[2];
if (!slip) {
  console.log('  Tip: test a real document with');
  console.log('       node tests/diagnose.mjs /path/to/your-slip.jpg\n');
  process.exit(0);
}

if (!fs.existsSync(slip)) {
  bad(`file not found: ${slip}`);
  process.exit(1);
}

console.log(`\n  extracting from ${slip} ...`);
const { default: sharp } = await import('sharp');
const prepared = await sharp(fs.readFileSync(slip), { failOn: 'none' })
  .rotate()
  .resize({ width: 1536, height: 1536, fit: 'inside' })
  .greyscale()
  .normalise()
  .sharpen()
  .jpeg({ quality: 92 })
  .toBuffer();

const { TRANSCRIPT_SYSTEM_PROMPT, buildTranscriptUserPrompt, TRANSCRIPT_SCHEMA } =
  await import('../src/lib/transcript-prompt.ts');

const t0 = Date.now();
const r = await fetch(`${BASE}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: MODEL,
    stream: false,
    format: TRANSCRIPT_SCHEMA,
    messages: [
      { role: 'system', content: TRANSCRIPT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildTranscriptUserPrompt({}),
        images: [prepared.toString('base64')],
      },
    ],
    options: { temperature: 0, num_ctx: 16384, num_predict: 2048, repeat_penalty: 1.05 },
  }),
  signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS || 120000)),
});

const secs = ((Date.now() - t0) / 1000).toFixed(1);
const body = await r.text();
if (!r.ok) {
  bad(`extraction failed after ${secs}s — HTTP ${r.status}`);
  info(body.slice(0, 300));
  process.exit(1);
}

const out = JSON.parse(body);
const reply = out.message?.content || '';
info(`took ${secs}s, prompt_eval_count=${out.prompt_eval_count ?? '?'}`);

if (out.prompt_eval_count && out.prompt_eval_count >= 16384 - 8) {
  warn('prompt filled the whole context — the system prompt was likely truncated');
}

// Use the app's own parser so the diagnostic matches real behaviour
// (including salvaging complete rows from a truncated reply).
const { parseJsonLoose } = await import('../src/lib/ollama.ts');
const parsed = parseJsonLoose(reply);
let truncatedJson = false;
try {
  JSON.parse(reply);
} catch {
  truncatedJson = Boolean(parsed);
}

if (truncatedJson) {
  warn('reply was cut off mid-JSON — complete rows were salvaged');
  info('If rows are missing, raise num_predict or use a stronger model.');
}

if (!parsed) {
  bad('model did not return JSON — this is what causes "No subjects could be read"');
  info(`reply: ${reply.slice(0, 300)}`);
  info('');
  info('Usually means the model is too weak for structured OCR.');
  info('Try:  ollama pull qwen2.5vl:7b   (much stronger on documents)');
  process.exit(1);
}

const subs = parsed.subjects || [];
if (!subs.length) {
  bad('model returned valid JSON but found ZERO subjects');
  info(`reply: ${reply.slice(0, 300)}`);
  info('');
  info('Either the image is unreadable, or the model cannot see it properly.');
  info('Check the photo is sharp and the results table fills the frame.');
  process.exit(1);
}

ok(`extracted ${subs.length} subject rows`);
for (const s2 of subs.slice(0, 15)) {
  info(`  ${String(s2.subject || '').padEnd(32)} ${s2.grade || '(blank)'}`);
}
console.log('\n  Extraction works.\n');

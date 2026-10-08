/**
 * Mock Ollama server for local end-to-end testing WITHOUT pulling the model.
 * Mimics /api/tags and /api/chat for minicpm-v4.6.
 *
 *   node tests/mock-ollama.mjs                 # normal: returns a full reading
 *   MOCK_TRUNCATE=1 node tests/mock-ollama.mjs # first reply stops early,
 *                                              # to exercise the retry pass
 */
import http from 'node:http';

const PORT = Number(process.env.MOCK_OLLAMA_PORT || 11434);
const TRUNCATE = process.env.MOCK_TRUNCATE === '1';

const HEADER = {
  qualification: 'SPM',
  candidate_name: 'TAN WEI MING',
  school: 'SMK BANDAR UTAMA',
  exam_year: '2024',
};

// A plausible SPM slip reading, including messy real-world cases:
// legacy "1A" grade, Malay names, Additional Maths, a fail, an unreadable grade.
const ALL_SUBJECTS = [
  { subject: 'BAHASA MELAYU', grade: 'A' },
  { subject: 'BAHASA INGGERIS', grade: 'B+' },
  { subject: 'MATEMATIK', grade: 'A+' },
  { subject: 'MATEMATIK TAMBAHAN', grade: 'B' },
  { subject: 'SEJARAH', grade: 'C' },
  { subject: 'FIZIK', grade: '1A' },
  { subject: 'KIMIA', grade: 'B' },
  { subject: 'BIOLOGI', grade: 'G' }, // a fail must still be returned
  { subject: 'PENDIDIKAN SENI VISUAL', grade: '' }, // unreadable grade
];

let chatCalls = 0;

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/tags') {
      res.end(
        JSON.stringify({
          models: [{ name: 'minicpm-v4.6:latest', model: 'minicpm-v4.6:latest' }],
        }),
      );
      return;
    }

    if (req.url === '/api/chat') {
      chatCalls++;
      const parsed = JSON.parse(body || '{}');
      const text = JSON.stringify(parsed.messages || '');
      const isRetry = text.includes('rows are missing');
      const hasImage = Boolean(parsed.messages?.some((m) => m.images?.length));

      // Simulate a model that stops halfway on its first pass, then complies
      // when told rows are missing.
      const truncate = TRUNCATE && !isRetry;
      const subjects = truncate ? ALL_SUBJECTS.slice(0, 4) : ALL_SUBJECTS;

      console.log(
        `[mock] call#${chatCalls} image=${hasImage} schema=${Boolean(parsed.format)} ` +
          `retry=${isRetry} returned=${subjects.length}/${ALL_SUBJECTS.length}`,
      );

      res.end(
        JSON.stringify({
          model: parsed.model,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              ...HEADER,
              // Always claim the true count so a short list is detectable.
              subject_count: ALL_SUBJECTS.length,
              subjects,
            }),
          },
          eval_count: 210,
          done: true,
        }),
      );
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not found' }));
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    `[mock] Ollama stub on http://127.0.0.1:${PORT}` +
      (TRUNCATE ? ' (truncating first reply)' : ''),
  );
});

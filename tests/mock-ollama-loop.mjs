/**
 * Mock Ollama that reproduces the "token repeat limit reached" abort.
 *
 * Real trigger: dotted leader lines on a result slip ("MATEMATIK ....... A+")
 * make a vision model emit the same token until Ollama gives up and returns
 * HTTP 500 {"error":"prediction aborted, token repeat limit reached"}.
 *
 *   node tests/mock-ollama-loop.mjs              # fails while temperature is 0,
 *                                                # succeeds once sampling loosens
 *   FAIL_ALWAYS=1 node tests/mock-ollama-loop.mjs  # never recovers
 */
import http from 'node:http';

const PORT = Number(process.env.MOCK_OLLAMA_PORT || 11434);
const FAIL_ALWAYS = process.env.FAIL_ALWAYS === '1';

const SUBJECTS = [
  { subject: 'BAHASA MELAYU', grade: 'A' },
  { subject: 'BAHASA INGGERIS', grade: 'B+' },
  { subject: 'MATEMATIK', grade: 'A+' },
  { subject: 'SEJARAH', grade: 'C' },
  { subject: 'FIZIK', grade: '1A' },
];

let calls = 0;

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/tags') {
      return res.end(
        JSON.stringify({
          models: [{ name: 'minicpm-v4.6:latest', model: 'minicpm-v4.6:latest' }],
        }),
      );
    }

    if (req.url === '/api/chat') {
      calls++;
      const parsed = JSON.parse(body || '{}');
      const opts = parsed.options || {};
      const temp = opts.temperature ?? 0;
      const penalty = opts.repeat_penalty ?? 1;

      // Mimic the real failure: greedy decoding loops, looser sampling escapes.
      const willLoop = FAIL_ALWAYS || temp === 0;

      console.log(
        `[mock] call#${calls} temp=${temp} repeat_penalty=${penalty} ` +
          `num_predict=${opts.num_predict} -> ${willLoop ? 'REPEAT LOOP (500)' : 'ok'}`,
      );

      if (willLoop) {
        res.statusCode = 500;
        return res.end(
          JSON.stringify({ error: 'prediction aborted, token repeat limit reached' }),
        );
      }

      return res.end(
        JSON.stringify({
          model: parsed.model,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              qualification: 'SPM',
              candidate_name: 'TAN WEI MING',
              exam_year: '2024',
              subject_count: SUBJECTS.length,
              subjects: SUBJECTS,
            }),
          },
          done: true,
        }),
      );
    }

    res.statusCode = 404;
    res.end('{}');
  });
});

server.listen(PORT, '127.0.0.1', () =>
  console.log(
    `[mock] loop-simulating Ollama on :${PORT}` +
      (FAIL_ALWAYS ? ' (never recovers)' : ' (recovers when temperature > 0)'),
  ),
);

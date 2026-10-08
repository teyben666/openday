# AI Result Scanner — MiniCPM-V 4.6 via Ollama

Reads a student's uploaded result slip on **step 4** of `/apply`, auto-fills the
grade table on step 3, and flags any grade that doesn't match the proof.

Everything runs locally through [Ollama](https://ollama.com) with
[`minicpm-v4.6`](https://ollama.com/library/minicpm-v4.6) (1.6 GB, vision).
**No transcript ever leaves your server** — important, since these are personal
records of minors in many cases.

---

## 1. Setup

```bash
# Install Ollama: https://ollama.com/download
ollama pull minicpm-v4.6     # ~1.6 GB
ollama serve                 # usually already running as a service
```

Config lives in `.env` (defaults shown — you only need these if you change them):

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_VISION_MODEL=minicpm-v4.6
OLLAMA_TIMEOUT_MS=120000
```

Then:

```bash
npm install
npm run db:push     # adds the Application.proofCheck column
npm run dev
```

Open <http://localhost:3000/apply>.

### Verify the model is wired up

```bash
curl http://localhost:3000/api/ocr/transcript
# {"ok":true,"reachable":true,"modelReady":true,"model":"minicpm-v4.6",...}
```

If `ok:false`, the UI still works — scanning just shows a friendly message and
students type grades manually. It never blocks an application.

---

## 2. How a student experiences it

1. Steps 1–3 as before (details → programme → grades).
2. **Step 4**: they upload the result slip. The scan starts **automatically**.
3. The panel shows every subject the model read, with the raw text it saw
   (`FIZIK · 1A`) next to the normalised value (`Physics → A+`).
4. **"Fill my grades"** writes the reading into the step-3 table.
5. If what they typed disagrees with the slip, an amber warning names the
   subject and both grades.

Students can always edit afterwards — the AI never has the final say.

---

## 3. What was added

| File | Purpose |
|---|---|
| `src/lib/ollama.ts` | Ollama client: health check, vision chat, structured JSON output, typed errors |
| `src/lib/transcript-extract.ts` | Maps messy slip text → the app's subject/grade model |
| `src/lib/pdf-raster.ts` | Best-effort PDF → PNG (poppler / ImageMagick / MuPDF) |
| `src/app/api/ocr/transcript/route.ts` | `POST` scan, `GET` health |
| `src/components/transcript-scan-panel.tsx` | The step-4 UI (bilingual) |

Modified: `application-form.tsx` (scan flow), `api/application/route.ts` +
`prisma/schema.prisma` (persist `proofCheck`), `admin/applications/page.tsx`
(reviewer view), `next.config.ts` (`allowedDevOrigins` — see §6).

---

## 4. The parsing layer (the part that actually matters)

A raw vision model gives you text, not a valid application. This layer handles
the real-world messiness of Malaysian slips:

- **Trilingual subjects** — `BAHASA MELAYU`, `Bahasa Melayu`, `马来文` → `BM`.
- **Paper codes stripped** — `1103 BAHASA MELAYU` → `BM`.
- **Legacy SPM grades** — `1A` → `A+`, `2A` → `A` (pre-2009 slips).
- **IGCSE 9–1 scale** — `7` → `A`, `9`/`8` → `A*`.
- **Additional Mathematics is NOT Mathematics.** Entry rules require *core*
  Maths; students sit both papers. Add Maths is kept as `OTHER` so a student
  can't accidentally satisfy a Maths requirement with the wrong subject.
- **De-duplication** — a subject can't be counted twice for credits.
- **Unreadable grades stay empty** rather than being guessed, and are listed
  for manual entry.
- **The student's chosen qualification wins** over the model's guess, so an
  SPM/UEC misread doesn't silently change the grading scale.

Grades are constrained to each qualification's real scale via Ollama's
structured-output `format` schema plus post-validation.

---

## 5. Anti-fraud: the proof check

`verifyAgainstRows()` compares typed grades against the slip and stores a JSON
summary in `Application.proofCheck`. Admins see it at `/admin/applications`:

> **AI proof check · minicpm-v4.6** — 1 grade(s) differ from the uploaded slip
>
> | Subject | Form | Slip |
> |---|---|---|
> | History (Sejarah) | A | C |

Mismatched rows are highlighted. This is a **review aid, not an auto-reject** —
OCR misreads happen, so a human still decides.

---

## 6. `next.config.ts` fix (unrelated but important)

Next.js 16 blocks cross-origin `/_next/*` dev requests by default. When the app
was opened via `127.0.0.1` or a tunnel instead of `localhost`, **React never
hydrated** — every button on the apply form was dead. Added:

```ts
allowedDevOrigins: ["127.0.0.1", "localhost", "*.e2b.app"]
```

Dev-only; no effect on production builds.

---

## 7. Testing

```bash
npm test          # 9 unit tests for subject/grade parsing — no Ollama needed
```

End-to-end without pulling the model:

```bash
node tests/mock-ollama.mjs      # stub Ollama on :11434
node tests/e2e-scan.mjs         # drives the real form in Chromium
```

`tests/e2e-scan.mjs` deliberately types a **wrong** History grade to confirm the
mismatch warning fires, then checks the grades land in step 3.

---

## 8. Notes & limits

- **First scan is slow** (10–60 s) while the model loads into RAM; later scans
  are a few seconds. The UI says so.
- **PDFs** need `poppler-utils` (`pdftoppm`), ImageMagick + Ghostscript, or
  MuPDF on the server. Without one, students get a clear "upload a photo"
  message. Only page 1 is read.
- Images are downscaled to 1536 px, greyscaled and normalised before inference —
  this measurably improves OCR on phone photos.
- `minicpm-v4.6` is a 1B model. It's fast and good at OCR, but **always keep the
  human review step**. For higher accuracy on hard scans, try a larger vision
  model — just change `OLLAMA_VISION_MODEL`, no code changes needed.
- Uploaded proofs stay in `public/uploads/proofs/` (git-ignored). For production,
  move these behind an authenticated route — right now anyone with the URL can
  read a student's transcript.

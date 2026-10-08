/**
 * Shared transcript scanning pipeline.
 *
 * Used by BOTH entry points so a student-side scan and an admin re-scan always
 * produce identical results:
 *   - POST /api/ocr/transcript          (student, during application)
 *   - POST /api/admin/applications/scan (admin, on a stored proof)
 */

import sharp from 'sharp';
import {
  ollamaVision,
  parseJsonLoose,
  OllamaError,
  SAMPLING_PROFILES,
  type VisionResponse,
} from '@/lib/ollama';
import {
  buildExtraction,
  type RawExtraction,
  type TranscriptExtraction,
} from '@/lib/transcript-extract';
import {
  TRANSCRIPT_SYSTEM_PROMPT,
  TRANSCRIPT_SCHEMA,
  buildTranscriptUserPrompt,
  buildRetryUserPrompt,
} from '@/lib/transcript-prompt';
import { rasterizePdf, MAX_PDF_PAGES } from '@/lib/pdf-raster';
import type { QualificationKey } from '@/data/entry-rules';

/** MiniCPM-V handles high resolution well, but cap it to keep CPU runs sane. */
const MAX_EDGE = 1536;

/**
 * Upscale anything smaller than this before inference.
 *
 * Phone cameras and chat apps often hand us a ~640px JPEG. At that size the
 * grade column ("A+", "B") is only a few pixels tall and the model guesses —
 * which is exactly how a scan comes back confident and wrong. Enlarging does
 * not add information, but it does give the vision encoder enough pixels per
 * glyph to resolve them.
 */
const MIN_EDGE = 1000;

export const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Normalise an image into something the vision model reads reliably.
 * Greyscale + normalise measurably improves OCR on phone photos of slips.
 */
async function prepareImage(buffer: Buffer): Promise<Buffer> {
  const upright = await sharp(buffer, { failOn: 'none' })
    .rotate() // honour EXIF orientation from phone cameras
    .toBuffer();

  const meta = await sharp(upright).metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);

  let pipeline = sharp(upright, { failOn: 'none' });

  if (longest > MAX_EDGE) {
    // Too big: shrink to keep CPU inference tractable.
    pipeline = pipeline.resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
    });
  } else if (longest > 0 && longest < MIN_EDGE) {
    // Too small: enlarge so the grade column is legible to the encoder.
    const scale = MIN_EDGE / longest;
    pipeline = pipeline.resize({
      width: Math.round((meta.width || 0) * scale),
      height: Math.round((meta.height || 0) * scale),
      kernel: 'lanczos3', // sharper on text than the default on upscale
    });
  }

  return pipeline
    .greyscale()
    .normalise() // stretch contrast: helps faded thermal-printed slips
    .sharpen() // recover edge definition lost to JPEG compression/upscaling
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();
}

/** Turn an upload into one prepared JPEG per page. */
export async function toPageImages(buffer: Buffer, mime: string): Promise<Buffer[]> {
  if (mime === 'application/pdf') {
    const pages = await rasterizePdf(buffer, MAX_PDF_PAGES);
    return Promise.all(pages.map(prepareImage));
  }
  return [await prepareImage(buffer)];
}

interface PageResult {
  raw: RawExtraction;
  tookMs: number;
  retried: boolean;
  /** True when a repeat-loop abort forced a different sampling profile. */
  recoveredFromLoop: boolean;
}

/** A page the model answered but we could not turn into rows. */
interface PageFailure {
  pageNumber: number;
  /** Raw assistant text, truncated — the only way to debug a bad reading. */
  sample: string;
}

/**
 * Run one vision call, retrying with looser sampling if the model falls into a
 * token-repeat loop.
 *
 * Result slips are a known trigger: dotted leader lines ("......") between a
 * subject and its grade make the model emit the same token until Ollama aborts
 * with "token repeat limit reached". Greedy decoding cannot escape that, so we
 * escalate temperature/repeat-penalty and try again.
 */
async function visionWithLoopRecovery(args: {
  imageBase64: string;
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
}): Promise<{ response: VisionResponse; recoveredFromLoop: boolean; tookMs: number }> {
  let lastError: unknown;
  let tookMs = 0;

  for (let attempt = 0; attempt < SAMPLING_PROFILES.length; attempt++) {
    try {
      const response = await ollamaVision({
        ...args,
        sampling: SAMPLING_PROFILES[attempt],
      });
      tookMs += response.tookMs;
      return { response, recoveredFromLoop: attempt > 0, tookMs };
    } catch (error) {
      lastError = error;
      // Only a repeat loop is worth retrying — everything else is terminal.
      if (!(error instanceof OllamaError) || error.code !== 'repeat_loop') {
        throw error;
      }
      console.warn(
        `[transcript-scan] repeat loop on attempt ${attempt + 1}/${SAMPLING_PROFILES.length}` +
          (attempt + 1 < SAMPLING_PROFILES.length ? ' — retrying with looser sampling' : ''),
      );
    }
  }

  throw lastError;
}

/**
 * Read one page. If the model reports more rows than it returned, ask again —
 * small vision models often stop halfway down a long results table.
 */
async function readPage(
  imageBase64: string,
  qualification: QualificationKey | null,
  pageNumber: number,
  totalPages: number,
): Promise<{ page: PageResult | null; failure: PageFailure | null }> {
  const prompt = buildTranscriptUserPrompt({
    qualification,
    pageNumber,
    totalPages,
  });

  const first = await visionWithLoopRecovery({
    imageBase64,
    system: TRANSCRIPT_SYSTEM_PROMPT,
    prompt,
    schema: TRANSCRIPT_SCHEMA as unknown as Record<string, unknown>,
  });

  let raw = parseJsonLoose<RawExtraction & { subject_count?: number }>(
    first.response.content,
  );
  let tookMs = first.tookMs;
  let retried = false;
  const recoveredFromLoop = first.recoveredFromLoop;

  if (!raw) {
    // Keep the reply: "no subjects" with no sample is impossible to debug.
    return {
      page: null,
      failure: {
        pageNumber,
        sample: first.response.content.slice(0, 500),
      },
    };
  }

  const found = Array.isArray(raw.subjects) ? raw.subjects.length : 0;
  const claimed = typeof raw.subject_count === 'number' ? raw.subject_count : found;

  // The model told us it saw more rows than it listed — give it one more pass.
  if (claimed > found) {
    retried = true;
    try {
      const second = await visionWithLoopRecovery({
        imageBase64,
        system: TRANSCRIPT_SYSTEM_PROMPT,
        prompt: `${prompt}\n\n${buildRetryUserPrompt(found, claimed)}`,
        schema: TRANSCRIPT_SCHEMA as unknown as Record<string, unknown>,
      });
      const retryRaw = parseJsonLoose<RawExtraction & { subject_count?: number }>(
        second.response.content,
      );
      tookMs += second.tookMs;
      // Keep whichever attempt actually produced more rows.
      if (retryRaw?.subjects && retryRaw.subjects.length > found) {
        raw = retryRaw;
      }
    } catch {
      // Retry is best-effort; fall back to the first reading.
    }
  }

  return {
    page: { raw, tookMs, retried, recoveredFromLoop },
    failure:
      (raw.subjects?.length ?? 0) === 0
        ? { pageNumber, sample: first.response.content.slice(0, 500) }
        : null,
  };
}

/** Merge per-page readings into one document-level result. */
function mergePages(pages: PageResult[]): RawExtraction {
  const merged: RawExtraction = {
    qualification: '',
    candidate_name: '',
    school: '',
    exam_year: '',
    subjects: [],
  };

  for (const { raw } of pages) {
    merged.qualification ||= raw.qualification || '';
    merged.candidate_name ||= raw.candidate_name || '';
    merged.school ||= raw.school || '';
    merged.exam_year ||= raw.exam_year || '';
    if (Array.isArray(raw.subjects)) {
      merged.subjects!.push(...raw.subjects);
    }
  }

  return merged;
}

export interface ScanMeta {
  model: string;
  tookMs: number;
  pages: number;
  retried: boolean;
  /** A repeat-loop abort happened but looser sampling recovered it. */
  recoveredFromLoop: boolean;
  subjectCount: number;
  unresolved: number;
}

export interface ScanOutcome {
  extraction: TranscriptExtraction;
  meta: ScanMeta;
}

/** Thrown when the document was readable but contained no usable subjects. */
export class NoSubjectsError extends Error {
  /** Why it failed, so the log/response can say something useful. */
  reason: 'unparseable' | 'empty_subjects' | 'all_unmatched';
  /** First slice of what the model actually replied — the key debug clue. */
  sample?: string;
  /** Subject names the model returned that we could not map to a form row. */
  rawSubjects?: string[];

  constructor(
    reason: NoSubjectsError['reason'] = 'empty_subjects',
    detail?: { sample?: string; rawSubjects?: string[] },
  ) {
    super(
      reason === 'unparseable'
        ? 'Model did not return usable JSON'
        : reason === 'all_unmatched'
          ? 'Model returned rows but none could be matched to a subject'
          : 'No subjects could be read from that document',
    );
    this.name = 'NoSubjectsError';
    this.reason = reason;
    this.sample = detail?.sample;
    this.rawSubjects = detail?.rawSubjects;
  }
}

/**
 * Full pipeline: prepared images -> vision model -> normalised extraction.
 * Throws NoSubjectsError, OllamaError or PdfRasterUnavailableError.
 */
export async function scanTranscriptBuffer(
  buffer: Buffer,
  mime: string,
  qualification: QualificationKey | null,
  modelName: string,
): Promise<ScanOutcome> {
  const images = await toPageImages(buffer, mime);

  const pages: PageResult[] = [];
  const failures: PageFailure[] = [];
  for (let i = 0; i < images.length; i++) {
    const { page, failure } = await readPage(
      images[i].toString('base64'),
      qualification,
      i + 1,
      images.length,
    );
    if (page) pages.push(page);
    if (failure) failures.push(failure);
  }

  const anySubjects = pages.some((p) => (p.raw.subjects?.length ?? 0) > 0);
  if (!pages.length || !anySubjects) {
    const sample = failures[0]?.sample ?? '';
    // Distinguish "the model emitted junk" from "the model read an empty page".
    throw new NoSubjectsError(pages.length ? 'empty_subjects' : 'unparseable', {
      sample,
    });
  }

  const merged = mergePages(pages);
  const extraction = buildExtraction(merged, qualification);
  if (extraction.subjects.length === 0) {
    // The model DID return rows, but none survived normalisation — usually a
    // non-transcript document, or subject names we have no mapping for.
    throw new NoSubjectsError('all_unmatched', {
      rawSubjects: (merged.subjects || [])
        .map((r) => `${r.subject ?? ''} = ${r.grade ?? ''}`)
        .slice(0, 12),
    });
  }

  return {
    extraction,
    meta: {
      model: modelName,
      tookMs: pages.reduce((sum, p) => sum + p.tookMs, 0),
      pages: images.length,
      retried: pages.some((p) => p.retried),
      recoveredFromLoop: pages.some((p) => p.recoveredFromLoop),
      subjectCount: extraction.subjects.length,
      unresolved: extraction.unresolved,
    },
  };
}

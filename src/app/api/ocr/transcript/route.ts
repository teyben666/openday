import { NextRequest, NextResponse } from 'next/server';
import {
  checkOllama,
  OllamaError,
  OLLAMA_VISION_MODEL,
} from '@/lib/ollama';
import {
  scanTranscriptBuffer,
  NoSubjectsError,
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
} from '@/lib/transcript-scan';
import { PdfRasterUnavailableError } from '@/lib/pdf-raster';
import type { QualificationKey } from '@/data/entry-rules';

export const runtime = 'nodejs';
// Vision inference is slow on CPU, and a multi-page PDF runs once per page.
export const maxDuration = 300;

export async function GET() {
  const health = await checkOllama();
  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const qualificationInput = form.get('qualification');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file', code: 'no_file' },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type', code: 'bad_type' },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large', code: 'too_large' },
        { status: 400 },
      );
    }

    // Fail fast with an actionable message instead of a 120s timeout.
    const health = await checkOllama();
    if (!health.ok) {
      // A model that is installed but text-only is a config mistake, not an
      // outage: it would silently "succeed" with invented grades, so stop here.
      const code = !health.reachable
        ? 'unreachable'
        : health.visionCapable === false
          ? 'not_vision'
          : 'model_missing';
      return NextResponse.json(
        {
          success: false,
          code,
          error:
            code === 'unreachable'
              ? 'Cannot reach Ollama'
              : code === 'not_vision'
                ? `Model "${health.model}" cannot read images`
                : `Model "${health.model}" is not installed`,
          hint: health.hint,
          model: health.model,
          baseUrl: health.baseUrl,
          ...(health.visionModels?.length
            ? { visionModels: health.visionModels }
            : {}),
        },
        { status: code === 'not_vision' ? 500 : 503 },
      );
    }

    const preferred =
      typeof qualificationInput === 'string' && qualificationInput
        ? (qualificationInput as QualificationKey)
        : null;

    const { extraction, meta } = await scanTranscriptBuffer(
      Buffer.from(await file.arrayBuffer()),
      file.type,
      preferred,
      OLLAMA_VISION_MODEL,
    );

    return NextResponse.json({ success: true, extraction, meta });
  } catch (error) {
    // Always log the real cause: the browser only ever sees a status code,
    // so a bare 503 in the terminal is impossible to diagnose without this.
    if (error instanceof OllamaError) {
      console.error(
        `[scan] ${error.code}: ${error.message}${error.hint ? ` — ${error.hint}` : ''}`,
      );
    } else if (error instanceof NoSubjectsError) {
      // Log what the model actually said — "no subjects" alone is undebuggable.
      console.error(`[scan] no_subjects (${error.reason}): ${error.message}`);
      if (error.sample) {
        console.error(`[scan] model replied: ${error.sample}`);
      }
      if (error.rawSubjects?.length) {
        console.error(`[scan] unmatched rows: ${error.rawSubjects.join(' | ')}`);
      }
    } else {
      console.error('[scan] unexpected failure:', error);
    }

    if (error instanceof PdfRasterUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          code: 'pdf_unsupported',
          error: 'This server cannot convert PDF pages to images',
          hint: 'Upload a photo/screenshot of the slip, or install poppler-utils on the server.',
        },
        { status: 415 },
      );
    }
    if (error instanceof NoSubjectsError) {
      return NextResponse.json(
        {
          success: false,
          code: 'no_subjects',
          reason: error.reason,
          error: error.message,
          hint:
            error.reason === 'all_unmatched'
              ? 'The document was read, but nothing on it looks like a results table. Is this the right file?'
              : error.reason === 'unparseable'
                ? 'The AI could not produce a usable reading. Try a sharper photo, or a different model.'
                : 'Make sure the whole slip is visible, in focus and well lit.',
          ...(error.rawSubjects?.length ? { rawSubjects: error.rawSubjects } : {}),
        },
        { status: 422 },
      );
    }
    if (error instanceof OllamaError) {
      if (error.code === 'repeat_loop') {
        return NextResponse.json(
          {
            success: false,
            code: 'repeat_loop',
            error: 'The AI could not read this document reliably',
            hint: 'Try a sharper, more tightly cropped photo of just the results table.',
          },
          { status: 422 },
        );
      }
      // OOM / wrong-model are server config problems (500), not outages (503).
      const status =
        error.code === 'timeout'
          ? 504
          : error.code === 'out_of_memory' || error.code === 'not_vision'
            ? 500
            : 503;
      return NextResponse.json(
        { success: false, code: error.code, error: error.message, hint: error.hint },
        { status },
      );
    }
    console.error('[ocr/transcript]', error);
    return NextResponse.json(
      {
        success: false,
        code: 'server_error',
        error: 'Server error while scanning the document',
        model: OLLAMA_VISION_MODEL,
      },
      { status: 500 },
    );
  }
}

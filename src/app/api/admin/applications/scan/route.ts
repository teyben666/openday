/**
 * Admin-triggered re-scan of an application's stored proof.
 *
 * Lets reviewers get an AI reading for applications that were submitted while
 * Ollama was offline, or re-check an old application after the model changed.
 * Reads the proof straight off disk — the student is long gone.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { checkOllama, OllamaError, OLLAMA_VISION_MODEL } from '@/lib/ollama';
import {
  scanTranscriptBuffer,
  NoSubjectsError,
  ALLOWED_MIME,
} from '@/lib/transcript-scan';
import { PdfRasterUnavailableError } from '@/lib/pdf-raster';
import { verifyAgainstRows } from '@/lib/transcript-extract';
import type { GradeRow } from '@/lib/entry-check';
import type { QualificationKey } from '@/data/entry-rules';

export const runtime = 'nodejs';
export const maxDuration = 300;

const bodySchema = z.object({ id: z.string().min(1) });

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

/** Rebuild the student's submitted grades so we can diff against the slip. */
function gradeRowsFromStored(raw: string | null): {
  rows: GradeRow[];
  qualification: QualificationKey | null;
} {
  if (!raw) return { rows: [], qualification: null };
  try {
    const parsed = JSON.parse(raw) as {
      qualification?: string;
      subjects?: { subjectId?: string; subject?: string; grade?: string }[];
    };
    const rows: GradeRow[] = (parsed.subjects || []).map((s, i) => ({
      id: `stored-${i}`,
      subjectId: s.subjectId || s.subject || '',
      subjectOther:
        (s.subjectId || s.subject) === 'OTHER' ? s.subject || '' : '',
      grade: s.grade || '',
    }));
    return {
      rows,
      qualification: (parsed.qualification as QualificationKey) || null,
    };
  } catch {
    return { rows: [], qualification: null };
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let applicationId: string;
  try {
    applicationId = bodySchema.parse(await request.json()).id;
  } catch {
    return NextResponse.json(
      { success: false, code: 'bad_request', error: 'Invalid request' },
      { status: 400 },
    );
  }

  const application = await db.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    return NextResponse.json(
      { success: false, code: 'not_found', error: 'Application not found' },
      { status: 404 },
    );
  }

  if (!application.proofPath) {
    return NextResponse.json(
      {
        success: false,
        code: 'no_proof',
        error: 'This application has no uploaded proof to scan',
      },
      { status: 400 },
    );
  }

  const health = await checkOllama();
  if (!health.ok) {
    // Installed-but-text-only is a misconfiguration, not an outage. Refuse
    // rather than record a "verified" proof check built on invented grades.
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
        ...(health.visionModels?.length ? { visionModels: health.visionModels } : {}),
      },
      { status: code === 'not_vision' ? 500 : 503 },
    );
  }

  // Resolve the stored public path to a file on disk, refusing traversal.
  const relative = application.proofPath.replace(/^\/+/, '');
  const publicDir = path.join(process.cwd(), 'public');
  const filePath = path.resolve(publicDir, relative);
  if (!filePath.startsWith(path.join(publicDir, 'uploads'))) {
    return NextResponse.json(
      { success: false, code: 'bad_path', error: 'Invalid proof path' },
      { status: 400 },
    );
  }

  const mime = MIME_BY_EXT[path.extname(filePath).toLowerCase()];
  if (!mime || !ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      { success: false, code: 'bad_type', error: 'Unsupported proof file type' },
      { status: 415 },
    );
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: 'proof_missing',
        error: 'The stored proof file could not be found on disk',
      },
      { status: 404 },
    );
  }

  try {
    const { rows, qualification } = gradeRowsFromStored(application.gradesResult);
    const preferred =
      (application.qualification as QualificationKey) || qualification;

    const { extraction, meta } = await scanTranscriptBuffer(
      buffer,
      mime,
      preferred,
      OLLAMA_VISION_MODEL,
    );

    const verification = verifyAgainstRows(extraction, rows);

    const needsManualReview =
      verification.mismatches > 0 || verification.unverified > 0;
    const reviewStatus = needsManualReview
      ? 'needs_review'
      : verification.matches > 0
        ? 'verified'
        : 'unverified';

    // Persist in the same shape the student-side flow writes, so the page
    // renders re-scans and original scans identically.
    const proofCheck = {
      model: meta.model,
      qualification: extraction.qualification,
      candidateName: extraction.candidateName,
      examYear: extraction.examYear,
      matches: verification.matches,
      mismatches: verification.mismatches,
      unverified: verification.unverified,
      needsManualReview,
      reviewStatus,
      items: verification.items.map((i) => ({
        subject: i.label.en,
        form: i.formGrade,
        proof: i.proofGrade,
        kind: i.kind,
      })),
      // Extra context that only the admin view shows.
      scannedAt: new Date().toISOString(),
      scannedBy: 'admin',
      pages: meta.pages,
      unreadable: extraction.subjects
        .filter((s) => !s.matched)
        .map((s) => s.rawSubject),
    };

    await db.application.update({
      where: { id: application.id },
      data: { proofCheck: JSON.stringify(proofCheck) },
    });

    return NextResponse.json({ success: true, proofCheck, meta });
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
          hint: 'Install poppler-utils on the server to scan PDF proofs.',
        },
        { status: 415 },
      );
    }
    if (error instanceof NoSubjectsError) {
      return NextResponse.json(
        {
          success: false,
          code: 'no_subjects',
          error: 'No grades could be read from the uploaded proof',
          hint: 'The scan may be too blurry or cropped.',
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
            error: 'The AI could not read this proof reliably',
            hint: 'The model kept repeating itself on this image, even after retrying. The scan is probably too blurry or low-contrast.',
          },
          { status: 422 },
        );
      }
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
    console.error('[admin/applications/scan]', error);
    return NextResponse.json(
      { success: false, code: 'server_error', error: 'Scan failed' },
      { status: 500 },
    );
  }
}

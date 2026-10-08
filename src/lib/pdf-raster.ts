/**
 * Best-effort PDF -> PNG rasterisation.
 *
 * Students often upload a PDF result slip, but the vision model needs pixels.
 * sharp/libvips only reads PDFs when built with poppler, which is uncommon, so
 * we shell out to whichever converter exists on the host and degrade with a
 * clear message when none do.
 *
 * Transcripts regularly run to two pages (subjects continue overleaf), so we
 * rasterise SEVERAL pages rather than just the first.
 */

import { execFile } from 'child_process';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { promisify } from 'util';

const run = promisify(execFile);

/** Safety cap — a result slip is never 30 pages, and each page costs inference. */
export const MAX_PDF_PAGES = 5;

export class PdfRasterUnavailableError extends Error {
  constructor() {
    super('No PDF rasteriser available on this host');
    this.name = 'PdfRasterUnavailableError';
  }
}

async function has(bin: string): Promise<boolean> {
  try {
    await run('which', [bin]);
    return true;
  } catch {
    return false;
  }
}

/** Natural sort so page-10 doesn't land between page-1 and page-2. */
function byPageOrder(a: string, b: string): number {
  const num = (s: string) => Number(s.match(/(\d+)(?=\.\w+$)/)?.[1] ?? 0);
  return num(a) - num(b);
}

/**
 * Render up to `maxPages` pages of a PDF to PNG buffers at ~150 DPI.
 * Returns at least one buffer, or throws PdfRasterUnavailableError.
 */
export async function rasterizePdf(
  pdf: Buffer,
  maxPages = MAX_PDF_PAGES,
): Promise<Buffer[]> {
  // 1) sharp/libvips with poppler support (fastest, no subprocess).
  try {
    const sharp = (await import('sharp')).default;
    if (sharp.format.pdf?.input?.buffer) {
      const meta = await sharp(pdf).metadata();
      const total = Math.min(meta.pages ?? 1, maxPages);
      const pages: Buffer[] = [];
      for (let i = 0; i < total; i++) {
        pages.push(
          await sharp(pdf, { density: 150, page: i, pages: 1 }).png().toBuffer(),
        );
      }
      if (pages.length) return pages;
    }
  } catch {
    // fall through to CLI tools
  }

  const dir = await mkdtemp(path.join(tmpdir(), 'neuc-pdf-'));
  const src = path.join(dir, 'input.pdf');

  const collect = async (prefix: string): Promise<Buffer[]> => {
    const files = (await readdir(dir))
      .filter((f) => f.startsWith(prefix) && f.endsWith('.png'))
      .sort(byPageOrder)
      .slice(0, maxPages);
    return Promise.all(files.map((f) => readFile(path.join(dir, f))));
  };

  try {
    await writeFile(src, pdf);

    // 2) poppler-utils — the most reliable option.
    if (await has('pdftoppm')) {
      await run('pdftoppm', [
        '-png', '-r', '150', '-f', '1', '-l', String(maxPages),
        src, path.join(dir, 'page'),
      ]);
      const pages = await collect('page');
      if (pages.length) return pages;
    }

    // 3) ImageMagick (needs a working Ghostscript delegate)
    for (const bin of ['magick', 'convert']) {
      if (!(await has(bin))) continue;
      try {
        await run(bin, [
          '-density', '150',
          `${src}[0-${maxPages - 1}]`,
          '-background', 'white', '-flatten',
          path.join(dir, 'im-%d.png'),
        ]);
        const pages = await collect('im-');
        if (pages.length) return pages;
      } catch {
        // Ghostscript delegate missing — try the next candidate.
      }
    }

    // 4) mutool (MuPDF)
    if (await has('mutool')) {
      try {
        await run('mutool', [
          'draw', '-o', path.join(dir, 'mu-%d.png'),
          '-r', '150', '-F', 'png', src, `1-${maxPages}`,
        ]);
        const pages = await collect('mu-');
        if (pages.length) return pages;
      } catch {
        // fall through
      }
    }

    throw new PdfRasterUnavailableError();
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Convenience wrapper kept for callers that only need page 1. */
export async function rasterizePdfFirstPage(pdf: Buffer): Promise<Buffer> {
  const [first] = await rasterizePdf(pdf, 1);
  return first;
}

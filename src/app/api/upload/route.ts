import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'Too large' }, { status: 400 });
    }

    const ext =
      file.type === 'application/pdf'
        ? 'pdf'
        : file.type === 'image/png'
          ? 'png'
          : file.type === 'image/webp'
            ? 'webp'
            : 'jpg';

    const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'proofs');
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);

    const publicPath = `/uploads/proofs/${name}`;
    return NextResponse.json({ success: true, path: publicPath });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

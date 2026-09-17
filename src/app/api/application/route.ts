import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { isValidPhone, sanitizePhoneInput } from '@/lib/phone';
import { checkEntryEligibility, type GradeRow } from '@/lib/entry-check';
import type { QualificationKey } from '@/data/entry-rules';

const applicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  qualification: z.string().optional(),
  gradesResult: z.string().min(1),
  programme: z.string().min(1),
  documents: z.string().optional(),
  proofPath: z.string().optional(),
  fromDiscovery: z.boolean().optional(),
  discoveryProfile: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = applicationSchema.parse(body);

    const phone = sanitizePhoneInput(data.phone);
    if (!isValidPhone(phone)) {
      return NextResponse.json({ success: false, error: 'Invalid phone' }, { status: 400 });
    }

    let gradesPayload: {
      qualification?: string;
      subjects?: { subjectId?: string; subject?: string; grade?: string }[];
    };
    try {
      gradesPayload = JSON.parse(data.gradesResult);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid grades' }, { status: 400 });
    }

    const qualification = (data.qualification || gradesPayload.qualification) as QualificationKey | undefined;
    if (!qualification) {
      return NextResponse.json({ success: false, error: 'Missing qualification' }, { status: 400 });
    }

    const rows: GradeRow[] = (gradesPayload.subjects || []).map((s, i) => ({
      id: `api-${i}`,
      subjectId: s.subjectId || s.subject || '',
      subjectOther: s.subjectId === 'OTHER' ? s.subject || '' : '',
      grade: s.grade || '',
    }));

    const check = checkEntryEligibility(data.programme, qualification, rows);
    if (!check.ok) {
      return NextResponse.json(
        { success: false, error: 'Entry requirements not met', check },
        { status: 400 },
      );
    }

    const app = await db.application.create({
      data: {
        name: data.name,
        email: data.email,
        phone,
        qualification,
        gradesResult: data.gradesResult,
        programme: data.programme,
        documentNotes: data.documents || null,
        proofPath: data.proofPath || null,
        fromDiscovery: data.fromDiscovery ?? false,
        discoveryProfile: data.discoveryProfile || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: app.id,
      referenceId: app.referenceId,
    });
  } catch (error) {
    console.error('Application submission error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

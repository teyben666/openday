import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  programme: z.string().optional(),
  message: z.string().optional(),
  quizResult: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inquirySchema.parse(body);

    await db.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        programme: data.programme || null,
        message: data.message || null,
        quizResult: data.quizResult || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

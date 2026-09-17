import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { z } from 'zod';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applications = await db.application.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: applications });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'contacted', 'reviewing', 'accepted', 'rejected']),
});

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = patchSchema.parse(await request.json());
    const updated = await db.application.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

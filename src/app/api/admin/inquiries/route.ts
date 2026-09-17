import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: inquiries });
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [inquiryCount, applicationCount, pendingApps, recentInquiries, recentApps] =
    await Promise.all([
      db.inquiry.count(),
      db.application.count(),
      db.application.count({ where: { status: 'pending' } }),
      db.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      db.application.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

  return NextResponse.json({
    success: true,
    data: {
      inquiryCount,
      applicationCount,
      pendingApps,
      recentInquiries,
      recentApps,
    },
  });
}

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { courses } from '@/data/courses';

function courseName(id: string) {
  const c = courses.find((x) => x.id === id);
  return c ? c.name.zh : id;
}

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const [inquiryCount, applicationCount, pendingApps, recentInquiries, recentApps] =
    await Promise.all([
      db.inquiry.count(),
      db.application.count(),
      db.application.count({ where: { status: 'pending' } }),
      db.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      db.application.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inquiryCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applicationCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending apps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{pendingApps}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-emerald-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="rounded-lg border bg-white divide-y">
            {recentInquiries.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No inquiries yet</p>
            )}
            {recentInquiries.map((row) => (
              <div key={row.id} className="p-3 text-sm">
                <p className="font-medium">{row.name}</p>
                <p className="text-muted-foreground">
                  {row.email}
                  {row.phone ? ` · ${row.phone}` : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent applications</h2>
            <Link href="/admin/applications" className="text-sm text-emerald-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="rounded-lg border bg-white divide-y">
            {recentApps.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No applications yet</p>
            )}
            {recentApps.map((row) => (
              <div key={row.id} className="p-3 text-sm">
                <p className="font-medium">{row.name}</p>
                <p className="text-muted-foreground">
                  {courseName(row.programme)} · {row.status}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

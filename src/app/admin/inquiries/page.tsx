import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin/admin-shell';
import { courses } from '@/data/courses';

function courseName(id: string | null) {
  if (!id) return '—';
  const c = courses.find((x) => x.id === id);
  return c ? c.name.zh : id;
}

function parseQuiz(quizResult: string | null) {
  if (!quizResult) return null;
  try {
    const data = JSON.parse(quizResult) as {
      mainDirection?:
        | string
        | { dimensions?: string[]; label?: { zh?: string; en?: string } };
    };
    const md = data.mainDirection;
    if (!md) return null;
    if (typeof md === 'string') return md;
    return md.label?.zh || md.label?.en || md.dimensions?.join(' + ') || null;
  } catch {
    return null;
  }
}

export default async function AdminInquiriesPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-2">Inquiries / Leads</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Discovery lead captures and enquiry submissions ({inquiries.length})
      </p>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Contact</th>
              <th className="px-3 py-2 font-medium">Programme / Direction</th>
              <th className="px-3 py-2 font-medium">Message</th>
              <th className="px-3 py-2 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  No inquiries yet
                </td>
              </tr>
            )}
            {inquiries.map((row) => {
              const direction = parseQuiz(row.quizResult);
              return (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-3 font-medium">{row.name}</td>
                  <td className="px-3 py-3">
                    <div>{row.email}</div>
                    <div className="text-muted-foreground">{row.phone || '—'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div>{courseName(row.programme)}</div>
                    {direction && (
                      <div className="text-xs text-emerald-700 mt-0.5">Quiz: {direction}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 max-w-xs text-muted-foreground">
                    {row.message || '—'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

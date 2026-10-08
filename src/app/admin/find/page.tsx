import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin/admin-shell';
import { QuickFindSearch } from '@/components/admin/quick-find-search';
import { ReviewStatusBadge } from '@/components/admin/review-status-badge';
import { courses } from '@/data/courses';
import {
  buildQuickFindApplicationWhere,
  buildQuickFindInquiryWhere,
  firstParam,
} from '@/lib/admin-filters';
import {
  parseProofCheckJson,
  resolveReviewStatus,
} from '@/lib/proof-review';
import {
  GraduationCap,
  MessageSquare,
  Phone,
  Mail,
  Hash,
  Clock,
  ExternalLink,
} from 'lucide-react';

function courseName(id: string | null | undefined) {
  if (!id) return '—';
  const c = courses.find((x) => x.id === id);
  return c ? `${c.code} · ${c.name.zh}` : id;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminQuickFindPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? '';

  const [applications, inquiries] = q
    ? await Promise.all([
        db.application.findMany({
          where: buildQuickFindApplicationWhere(q),
          orderBy: { createdAt: 'desc' },
          take: 40,
        }),
        db.inquiry.findMany({
          where: buildQuickFindInquiryWhere(q),
          orderBy: { createdAt: 'desc' },
          take: 40,
        }),
      ])
    : [[], []];

  const total = applications.length + inquiries.length;

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Open Day Find</h1>
        <p className="text-sm text-muted-foreground">
          Quick lookup for walk-ups — search by phone, name, email, or application
          reference ID.
        </p>
      </div>

      <div className="mb-8 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
        <QuickFindSearch initialQ={q} />
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: phone works best at the booth (digits only is fine).
        </p>
      </div>

      {!q && (
        <div className="rounded-lg border border-dashed bg-white px-4 py-12 text-center text-muted-foreground">
          <p className="text-base">Type a name or phone number to find a student</p>
          <p className="mt-1 text-sm">Results show applications and inquiry leads together</p>
        </div>
      )}

      {q && total === 0 && (
        <div className="rounded-lg border bg-white px-4 py-12 text-center text-muted-foreground">
          No matches for <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>
        </div>
      )}

      {q && total > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          {total} result{total === 1 ? '' : 's'}
          {applications.length > 0 &&
            ` · ${applications.length} application${applications.length === 1 ? '' : 's'}`}
          {inquiries.length > 0 &&
            ` · ${inquiries.length} inquir${inquiries.length === 1 ? 'y' : 'ies'}`}
        </p>
      )}

      {applications.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <GraduationCap className="h-4 w-4" />
            Applications
          </h2>
          <ul className="space-y-3">
            {applications.map((row) => {
              const review = resolveReviewStatus(
                parseProofCheckJson(row.proofCheck),
                Boolean(row.proofPath),
              );
              return (
                <li
                  key={row.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold truncate">{row.name}</h3>
                        <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-medium text-white capitalize">
                          {row.status}
                        </span>
                        <ReviewStatusBadge status={review} />
                      </div>
                      <p className="font-medium text-emerald-800">
                        {courseName(row.programme)}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {row.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <a
                              href={`tel:${row.phone}`}
                              className="text-foreground hover:underline"
                            >
                              {row.phone}
                            </a>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {row.email}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                          <Hash className="h-3.5 w-3.5" />
                          {row.referenceId}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(row.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {row.qualification && (
                        <p className="text-xs text-muted-foreground">
                          Qualification: {row.qualification}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/admin/applications?q=${encodeURIComponent(row.referenceId)}`}
                      className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
                    >
                      Open in Applications
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {inquiries.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <MessageSquare className="h-4 w-4" />
            Inquiries / Leads
          </h2>
          <ul className="space-y-3">
            {inquiries.map((row) => (
              <li key={row.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold truncate">{row.name}</h3>
                      <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900">
                        Lead
                      </span>
                    </div>
                    <p className="font-medium text-slate-700">
                      {courseName(row.programme)}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {row.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          <a
                            href={`tel:${row.phone}`}
                            className="text-foreground hover:underline"
                          >
                            {row.phone}
                          </a>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {row.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(row.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {row.message && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {row.message}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/admin/inquiries?q=${encodeURIComponent(row.email || row.name)}`}
                    className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
                  >
                    Open in Inquiries
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AdminShell>
  );
}

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminListFilters } from '@/components/admin/admin-list-filters';
import { ApplicationStatusSelect } from '@/components/admin/application-status-select';
import { ProofScanPanel, type ProofCheck } from '@/components/admin/proof-scan-panel';
import { ReviewStatusBadge } from '@/components/admin/review-status-badge';
import { courses } from '@/data/courses';
import {
  buildApplicationWhere,
  firstParam,
  parseDateRange,
} from '@/lib/admin-filters';
import {
  parseProofCheckJson,
  resolveReviewStatus,
  type ReviewStatus,
} from '@/lib/proof-review';

function courseName(id: string) {
  const c = courses.find((x) => x.id === id);
  return c ? c.name.zh : id;
}

function parseGrades(raw: string | null) {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as {
      qualification?: string;
      cgpa?: number;
      subjects?: { subject: string; grade: string }[];
      check?: {
        ok?: boolean;
        creditCount?: number;
        minCredits?: number;
        missingSubjects?: string[];
        summary?: string;
      };
    };
    if (!data.subjects) {
      return { plain: raw };
    }
    return data;
  } catch {
    return { plain: raw };
  }
}

function parseProofCheck(raw: string | null): ProofCheck | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProofCheck;
  } catch {
    return null;
  }
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? '';
  const status = firstParam(sp.status) || 'all';
  const programme = firstParam(sp.programme) || 'all';
  const discovery = firstParam(sp.discovery) || 'all';
  const review = firstParam(sp.review) || 'all';
  const range = parseDateRange(firstParam(sp.range));

  const where = buildApplicationWhere({ q, status, programme, discovery, range });

  const rows = await db.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 400,
  });

  const applications = rows
    .map((row) => {
      const proofCheck = parseProofCheck(row.proofCheck);
      const reviewJson = parseProofCheckJson(row.proofCheck);
      const reviewStatus = resolveReviewStatus(reviewJson, Boolean(row.proofPath));
      return { row, proofCheck, reviewStatus };
    })
    .filter((item) =>
      review === 'all' ? true : item.reviewStatus === (review as ReviewStatus),
    )
    .slice(0, 200);

  const programmes = courses.map((c) => ({
    id: c.id,
    label: `${c.code} · ${c.name.zh}`,
  }));

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-2">Applications</h1>
      <p className="text-sm text-muted-foreground mb-6">Online applications</p>

      <AdminListFilters
        variant="applications"
        basePath="/admin/applications"
        q={q}
        status={status}
        programme={programme}
        discovery={discovery}
        review={review}
        range={range}
        programmes={programmes}
        resultCount={applications.length}
      />

      <div className="space-y-4">
        {applications.length === 0 && (
          <p className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
            No applications match these filters
          </p>
        )}

        {applications.map(({ row, proofCheck, reviewStatus }) => {
          const grades = parseGrades(row.gradesResult);
          return (
            <article key={row.id} className="rounded-lg border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-base">{row.name}</h2>
                    <ReviewStatusBadge
                      status={reviewStatus}
                      gradesEditedAfterScan={Boolean(proofCheck?.gradesEditedAfterScan)}
                    />
                  </div>
                  <p className="text-muted-foreground">
                    {row.email}
                    {row.phone ? ` · ${row.phone}` : ''}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">{courseName(row.programme)}</span>
                    {row.fromDiscovery && (
                      <span className="ml-2 text-xs text-emerald-700">via Discovery</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ApplicationStatusSelect id={row.id} status={row.status} />
                  <p className="text-xs font-mono text-muted-foreground">{row.referenceId}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Qualification</dt>
                  <dd>
                    {grades && 'qualification' in grades && grades.qualification
                      ? grades.qualification
                      : row.qualification || '—'}
                  </dd>
                </div>
                {grades && 'check' in grades && grades.check && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Entry pre-check</dt>
                    <dd>
                      {grades.check.ok ? (
                        <span className="text-emerald-700">Pass</span>
                      ) : (
                        <span className="text-amber-700">Review needed</span>
                      )}
                      {grades.check.summary ? (
                        <span className="text-muted-foreground"> · {grades.check.summary}</span>
                      ) : (
                        typeof grades.check.creditCount === 'number' && (
                          <span className="text-muted-foreground">
                            {' '}
                            · {grades.check.creditCount}/{grades.check.minCredits} credits
                          </span>
                        )
                      )}
                      {grades.check.missingSubjects && grades.check.missingSubjects.length > 0 && (
                        <span className="text-amber-700">
                          {' '}
                          · missing {grades.check.missingSubjects.join(', ')}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Academic results</dt>
                  <dd className="mt-1">
                    {grades && 'cgpa' in grades && typeof grades.cgpa === 'number' ? (
                      <span className="font-medium">CGPA {grades.cgpa.toFixed(2)}</span>
                    ) : grades && 'subjects' in grades && grades.subjects ? (
                      <table className="w-full max-w-md text-xs border rounded overflow-hidden">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left px-2 py-1">Subject</th>
                            <th className="text-left px-2 py-1">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.subjects.map((s, i) => (
                            <tr key={`${s.subject}-${i}`} className="border-t">
                              <td className="px-2 py-1">{s.subject}</td>
                              <td className="px-2 py-1 font-medium">{s.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span className="whitespace-pre-wrap">
                        {grades && 'plain' in grades ? grades.plain : row.gradesResult || '—'}
                      </span>
                    )}
                  </dd>
                </div>
                <ProofScanPanel
                  applicationId={row.id}
                  hasProof={Boolean(row.proofPath)}
                  proofCheck={proofCheck}
                />
                {row.documentNotes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Notes</dt>
                    <dd className="whitespace-pre-wrap mt-0.5">{row.documentNotes}</dd>
                  </div>
                )}
                {row.proofPath && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Proof</dt>
                    <dd className="mt-1">
                      {row.proofPath.endsWith('.pdf') ? (
                        <a
                          href={row.proofPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline"
                        >
                          Open PDF
                        </a>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.proofPath}
                          alt="Academic proof"
                          className="max-h-48 rounded border object-contain"
                        />
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}

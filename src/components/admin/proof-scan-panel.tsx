'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ServerOff,
} from 'lucide-react';

export interface ProofCheckItem {
  subject: string;
  form: string;
  proof: string;
  kind: string;
}

export interface ProofCheck {
  model?: string;
  qualification?: string | null;
  candidateName?: string;
  examYear?: string;
  matches?: number;
  mismatches?: number;
  unverified?: number;
  items?: ProofCheckItem[];
  scannedAt?: string;
  scannedBy?: string;
  pages?: number;
  unreadable?: string[];
  gradesEditedAfterScan?: boolean;
  needsManualReview?: boolean;
  reviewStatus?: 'verified' | 'needs_review' | 'unverified';
}

interface ProofScanPanelProps {
  applicationId: string;
  hasProof: boolean;
  proofCheck: ProofCheck | null;
}

const KIND_LABEL: Record<string, string> = {
  match: 'match',
  mismatch: 'differs',
  missing_in_form: 'not in form',
  missing_on_proof: 'not on slip',
};

export function ProofScanPanel({
  applicationId,
  hasProof,
  proofCheck,
}: ProofScanPanelProps) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  async function runScan() {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/applications/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError({ message: data.error || 'Scan failed', hint: data.hint });
        toast.error(data.error || 'Scan failed');
        return;
      }

      const mismatches = data.proofCheck?.mismatches ?? 0;
      toast.success(
        mismatches
          ? `Scan complete — ${mismatches} grade(s) differ from the slip`
          : 'Scan complete — grades match the slip',
      );
      router.refresh();
    } catch {
      setError({ message: 'Could not reach the server' });
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  }

  if (!hasProof) {
    return (
      <div className="sm:col-span-2">
        <dt className="text-xs text-muted-foreground">AI proof check</dt>
        <dd className="mt-0.5 text-muted-foreground">
          No proof uploaded — nothing to scan.
        </dd>
      </div>
    );
  }

  const items = proofCheck?.items ?? [];
  const mismatches = proofCheck?.mismatches ?? 0;

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          AI proof check
          {proofCheck?.model ? ` · ${proofCheck.model}` : ''}
          {proofCheck?.scannedBy === 'admin' ? ' · re-scanned by admin' : ''}
        </dt>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={scanning}
          onClick={runScan}
        >
          {scanning ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1.5" />
              {proofCheck ? 'Re-scan proof' : 'Scan now'}
            </>
          )}
        </Button>
      </div>

      <dd className="mt-1.5">
        {scanning && (
          <p className="text-xs text-muted-foreground">
            Reading the slip with the local model — the first run can take
            10–60 s while the model loads.
          </p>
        )}

        {error && !scanning && (
          <div className="rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs">
            <p className="flex items-center gap-1.5 font-medium text-amber-900">
              <ServerOff className="h-3.5 w-3.5" />
              {error.message}
            </p>
            {error.hint && <p className="mt-0.5 text-amber-800/80">{error.hint}</p>}
          </div>
        )}

        {!proofCheck && !scanning && !error && (
          <p className="text-muted-foreground">
            Not scanned yet. Click <strong>Scan now</strong> to read the uploaded
            proof and compare it with the submitted grades.
          </p>
        )}

        {proofCheck && !scanning && (
          <>
            {(proofCheck.needsManualReview ||
              proofCheck.gradesEditedAfterScan ||
              (proofCheck.mismatches ?? 0) > 0) && (
              <p className="mb-2 flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900">
                <AlertTriangle className="h-3.5 w-3.5" />
                Needs manual review
                {proofCheck.gradesEditedAfterScan ? ' — student edited grades after AI fill' : ''}
              </p>
            )}
            <p
              className={`flex items-center gap-1.5 ${
                mismatches ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {mismatches ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {mismatches
                ? `${mismatches} grade(s) differ from the uploaded slip`
                : `${proofCheck.matches ?? 0} grade(s) match the uploaded slip`}
              {proofCheck.unverified
                ? ` · ${proofCheck.unverified} not found on slip`
                : ''}
            </p>

            {items.length > 0 && (
              <table className="mt-1 w-full max-w-md text-xs border rounded overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-2 py-1">Subject</th>
                    <th className="text-left px-2 py-1">Form</th>
                    <th className="text-left px-2 py-1">Slip</th>
                    <th className="text-left px-2 py-1">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr
                      key={`${item.subject}-${i}`}
                      className={`border-t ${
                        item.kind === 'mismatch' ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="px-2 py-1">{item.subject}</td>
                      <td className="px-2 py-1 font-medium">{item.form || '—'}</td>
                      <td className="px-2 py-1 font-medium">{item.proof || '—'}</td>
                      <td
                        className={`px-2 py-1 ${
                          item.kind === 'mismatch'
                            ? 'text-amber-700 font-medium'
                            : item.kind === 'match'
                              ? 'text-emerald-700'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {KIND_LABEL[item.kind] || item.kind}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {proofCheck.unreadable && proofCheck.unreadable.length > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                Could not read a grade for: {proofCheck.unreadable.join(', ')}
              </p>
            )}

            <p className="mt-1 text-xs text-muted-foreground">
              {proofCheck.candidateName
                ? `Name on slip: ${proofCheck.candidateName}`
                : 'No name read from slip'}
              {proofCheck.examYear ? ` · ${proofCheck.examYear}` : ''}
              {proofCheck.pages && proofCheck.pages > 1
                ? ` · ${proofCheck.pages} pages`
                : ''}
              {proofCheck.scannedAt
                ? ` · scanned ${new Date(proofCheck.scannedAt).toLocaleString()}`
                : ''}
            </p>
          </>
        )}
      </dd>
    </div>
  );
}

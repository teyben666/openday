import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import {
  REVIEW_STATUS_LABEL,
  type ReviewStatus,
} from '@/lib/proof-review';
import { cn } from '@/lib/utils';

export function ReviewStatusBadge({
  status,
  gradesEditedAfterScan,
  className,
}: {
  status: ReviewStatus;
  gradesEditedAfterScan?: boolean;
  className?: string;
}) {
  const meta = REVIEW_STATUS_LABEL[status];
  const Icon =
    status === 'verified'
      ? CheckCircle2
      : status === 'needs_review'
        ? AlertTriangle
        : HelpCircle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium',
        meta.className,
        className,
      )}
      title={meta.detail}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {meta.short}
      {gradesEditedAfterScan && status === 'needs_review' ? ' · edited' : ''}
    </span>
  );
}

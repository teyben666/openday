export type ReviewStatus = 'verified' | 'needs_review' | 'unverified';

export interface ProofReviewSummary {
  reviewStatus: ReviewStatus;
  needsManualReview: boolean;
  gradesEditedAfterScan?: boolean;
  mismatches?: number;
  unverified?: number;
  matches?: number;
}

/** Derive staff-facing review status from saved proofCheck JSON + whether a file exists. */
export function resolveReviewStatus(
  proofCheck: ProofReviewSummary | Record<string, unknown> | null | undefined,
  hasProof: boolean,
): ReviewStatus {
  if (!proofCheck || typeof proofCheck !== 'object') {
    return hasProof ? 'unverified' : 'unverified';
  }

  const explicit = proofCheck.reviewStatus;
  if (explicit === 'verified' || explicit === 'needs_review' || explicit === 'unverified') {
    return explicit;
  }

  if (proofCheck.needsManualReview === true) return 'needs_review';
  if (proofCheck.gradesEditedAfterScan === true) return 'needs_review';

  const mismatches = Number(proofCheck.mismatches ?? 0);
  const unverified = Number(proofCheck.unverified ?? 0);
  const matches = Number(proofCheck.matches ?? 0);

  if (mismatches > 0 || unverified > 0) return 'needs_review';
  if (matches > 0 && mismatches === 0 && unverified === 0) return 'verified';

  return 'unverified';
}

export function computeSubmitReview(opts: {
  hasProof: boolean;
  gradesEditedAfterScan: boolean;
  verification: {
    checked: boolean;
    matches: number;
    mismatches: number;
    unverified: number;
  } | null;
}): { reviewStatus: ReviewStatus; needsManualReview: boolean } {
  const { hasProof, gradesEditedAfterScan, verification } = opts;

  if (verification?.checked) {
    if (
      gradesEditedAfterScan ||
      verification.mismatches > 0 ||
      verification.unverified > 0
    ) {
      return { reviewStatus: 'needs_review', needsManualReview: true };
    }
    return { reviewStatus: 'verified', needsManualReview: false };
  }

  // Uploaded but not scanned, or fully manual entry — staff should glance at it.
  if (hasProof || gradesEditedAfterScan) {
    return { reviewStatus: 'unverified', needsManualReview: true };
  }

  return { reviewStatus: 'unverified', needsManualReview: true };
}

export function parseProofCheckJson(
  raw: string | null | undefined,
): (ProofReviewSummary & Record<string, unknown>) | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProofReviewSummary & Record<string, unknown>;
  } catch {
    return null;
  }
}

export const REVIEW_STATUS_LABEL: Record<
  ReviewStatus,
  { short: string; detail: string; className: string }
> = {
  verified: {
    short: 'Verified',
    detail: 'Grades match the uploaded slip',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  needs_review: {
    short: 'Needs manual review',
    detail: 'Grades were edited or do not match the slip',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  unverified: {
    short: 'Unverified',
    detail: 'No AI proof check — manual entry or scan missing',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

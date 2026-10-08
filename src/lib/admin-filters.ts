import type { Prisma } from '@prisma/client';

export const ADMIN_STATUSES = [
  'pending',
  'contacted',
  'reviewing',
  'accepted',
  'rejected',
] as const;

export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export const ADMIN_DATE_RANGES = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
] as const;

export type AdminDateRange = (typeof ADMIN_DATE_RANGES)[number]['value'];

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseDateRange(raw: string | undefined): AdminDateRange {
  if (raw === 'today' || raw === '7d' || raw === '30d') return raw;
  return 'all';
}

export function createdAtFilter(
  range: AdminDateRange,
): { createdAt: { gte: Date } } | undefined {
  if (range === 'all') return undefined;
  const start = new Date();
  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return { createdAt: { gte: start } };
}

/** SQLite has no case-insensitive mode; match original / lower / upper variants. */
export function textSearchOr(
  fields: string[],
  q: string,
): Array<Record<string, { contains: string }>> | undefined {
  const trimmed = q.trim();
  if (!trimmed) return undefined;
  const variants = Array.from(
    new Set([trimmed, trimmed.toLowerCase(), trimmed.toUpperCase()]),
  );
  return fields.flatMap((field) =>
    variants.map((v) => ({ [field]: { contains: v } })),
  );
}

/** Digits-only slice for walk-up phone lookup (e.g. "012-345 6789"). */
export function digitsOnly(q: string): string {
  return q.replace(/\D/g, '');
}

export function buildQuickFindApplicationWhere(q: string): Prisma.ApplicationWhereInput {
  const trimmed = q.trim();
  if (!trimmed) return { id: '__never__' };

  const or = textSearchOr(['name', 'email', 'phone', 'referenceId'], trimmed) ?? [];
  const digits = digitsOnly(trimmed);
  if (digits.length >= 4) {
    or.push({ phone: { contains: digits } });
  }

  return { OR: or as Prisma.ApplicationWhereInput[] };
}

export function buildQuickFindInquiryWhere(q: string): Prisma.InquiryWhereInput {
  const trimmed = q.trim();
  if (!trimmed) return { id: '__never__' };

  const or = textSearchOr(['name', 'email', 'phone', 'message'], trimmed) ?? [];
  const digits = digitsOnly(trimmed);
  if (digits.length >= 4) {
    or.push({ phone: { contains: digits } });
  }

  return { OR: or as Prisma.InquiryWhereInput[] };
}

export function buildInquiryWhere(params: {
  q?: string;
  programme?: string;
  quiz?: string;
  range?: AdminDateRange;
}): Prisma.InquiryWhereInput {
  const and: Prisma.InquiryWhereInput[] = [];

  const search = textSearchOr(['name', 'email', 'phone', 'message'], params.q ?? '');
  if (search?.length) and.push({ OR: search as Prisma.InquiryWhereInput[] });

  if (params.programme && params.programme !== 'all') {
    and.push({ programme: params.programme });
  }

  if (params.quiz === 'yes') {
    and.push({
      AND: [{ quizResult: { not: null } }, { NOT: { quizResult: '' } }],
    });
  } else if (params.quiz === 'no') {
    and.push({
      OR: [{ quizResult: null }, { quizResult: '' }],
    });
  }

  const date = createdAtFilter(params.range ?? 'all');
  if (date) and.push(date);

  return and.length ? { AND: and } : {};
}

export function buildApplicationWhere(params: {
  q?: string;
  status?: string;
  programme?: string;
  discovery?: string;
  range?: AdminDateRange;
}): Prisma.ApplicationWhereInput {
  const and: Prisma.ApplicationWhereInput[] = [];

  const search = textSearchOr(
    ['name', 'email', 'phone', 'referenceId'],
    params.q ?? '',
  );
  if (search?.length) and.push({ OR: search as Prisma.ApplicationWhereInput[] });

  if (
    params.status &&
    params.status !== 'all' &&
    (ADMIN_STATUSES as readonly string[]).includes(params.status)
  ) {
    and.push({ status: params.status });
  }

  if (params.programme && params.programme !== 'all') {
    and.push({ programme: params.programme });
  }

  if (params.discovery === 'yes') {
    and.push({ fromDiscovery: true });
  } else if (params.discovery === 'no') {
    and.push({ fromDiscovery: false });
  }

  const date = createdAtFilter(params.range ?? 'all');
  if (date) and.push(date);

  return and.length ? { AND: and } : {};
}

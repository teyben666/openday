'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  ADMIN_DATE_RANGES,
  ADMIN_STATUSES,
  type AdminDateRange,
} from '@/lib/admin-filters';

export type ProgrammeOption = { id: string; label: string };

type CommonProps = {
  basePath: string;
  q: string;
  programme: string;
  range: AdminDateRange;
  programmes: ProgrammeOption[];
  resultCount: number;
};

type InquiriesProps = CommonProps & {
  variant: 'inquiries';
  quiz: string;
};

type ApplicationsProps = CommonProps & {
  variant: 'applications';
  status: string;
  discovery: string;
  review: string;
};

type Props = InquiriesProps | ApplicationsProps;

function buildHref(
  basePath: string,
  entries: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (!value) continue;
    if (key === 'q') {
      if (value.trim()) params.set(key, value.trim());
      continue;
    }
    if (value !== 'all') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function AdminListFilters(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (entries: Record<string, string | undefined>) => {
      startTransition(() => {
        router.push(buildHref(props.basePath, entries));
      });
    },
    [props.basePath, router],
  );

  function currentEntries(form: HTMLFormElement): Record<string, string | undefined> {
    const data = new FormData(form);
    const get = (name: string) => {
      const v = data.get(name);
      return typeof v === 'string' ? v : undefined;
    };
    if (props.variant === 'inquiries') {
      return {
        q: get('q'),
        programme: get('programme'),
        quiz: get('quiz'),
        range: get('range'),
      };
    }
    return {
      q: get('q'),
      status: get('status'),
      programme: get('programme'),
      discovery: get('discovery'),
      review: get('review'),
      range: get('range'),
    };
  }

  const active =
    Boolean(props.q.trim()) ||
    props.programme !== 'all' ||
    props.range !== 'all' ||
    (props.variant === 'inquiries'
      ? props.quiz !== 'all'
      : props.status !== 'all' ||
        props.discovery !== 'all' ||
        props.review !== 'all');

  const formKey =
    props.variant === 'inquiries'
      ? [props.q, props.programme, props.quiz, props.range].join('|')
      : [
          props.q,
          props.status,
          props.programme,
          props.discovery,
          props.review,
          props.range,
        ].join('|');

  const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

  return (
    <form
      key={formKey}
      className="mb-6 space-y-3 rounded-lg border bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(currentEntries(e.currentTarget));
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={props.q}
            placeholder={
              props.variant === 'applications'
                ? 'Search name, email, phone, or reference ID…'
                : 'Search name, email, phone, or message…'
            }
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            Search
          </Button>
          {active && (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={props.basePath}>
                <X className="mr-1 h-3.5 w-3.5" />
                Clear
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {props.variant === 'applications' && (
          <select
            name="status"
            defaultValue={props.status}
            className={selectClass}
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              navigate({ ...currentEntries(form), status: e.target.value });
            }}
          >
            <option value="all">All statuses</option>
            {ADMIN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        <select
          name="programme"
          defaultValue={props.programme}
          className={selectClass}
          onChange={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;
            navigate({ ...currentEntries(form), programme: e.target.value });
          }}
        >
          <option value="all">All programmes</option>
          {props.programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {props.variant === 'inquiries' && (
          <select
            name="quiz"
            defaultValue={props.quiz}
            className={selectClass}
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              navigate({ ...currentEntries(form), quiz: e.target.value });
            }}
          >
            <option value="all">Quiz: any</option>
            <option value="yes">Has quiz result</option>
            <option value="no">No quiz result</option>
          </select>
        )}

        {props.variant === 'applications' && (
          <select
            name="discovery"
            defaultValue={props.discovery}
            className={selectClass}
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              navigate({ ...currentEntries(form), discovery: e.target.value });
            }}
          >
            <option value="all">Discovery: any</option>
            <option value="yes">Via Discovery</option>
            <option value="no">Not via Discovery</option>
          </select>
        )}

        {props.variant === 'applications' && (
          <select
            name="review"
            defaultValue={props.review}
            className={selectClass}
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              navigate({ ...currentEntries(form), review: e.target.value });
            }}
          >
            <option value="all">Review: any</option>
            <option value="needs_review">Needs manual review</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        )}

        <select
          name="range"
          defaultValue={props.range}
          className={selectClass}
          onChange={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;
            navigate({ ...currentEntries(form), range: e.target.value });
          }}
        >
          {ADMIN_DATE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <p className="ml-auto text-sm text-muted-foreground">
          {props.resultCount} result{props.resultCount === 1 ? '' : 's'}
          {pending ? '…' : ''}
        </p>
      </div>
    </form>
  );
}

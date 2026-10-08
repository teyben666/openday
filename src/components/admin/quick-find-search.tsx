'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';

export function QuickFindSearch({
  initialQ,
  basePath = '/admin/find',
}: {
  initialQ: string;
  basePath?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(q: string) {
    const trimmed = q.trim();
    startTransition(() => {
      router.push(trimmed ? `${basePath}?q=${encodeURIComponent(trimmed)}` : basePath);
    });
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const q = typeof data.get('q') === 'string' ? (data.get('q') as string) : '';
        submit(q);
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          name="q"
          defaultValue={initialQ}
          placeholder="Name, phone, email, or reference ID…"
          className="h-12 pl-10 text-base"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="h-12 px-6" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Find
        </Button>
        {initialQ && (
          <Button
            type="button"
            variant="outline"
            className="h-12"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = '';
              submit('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

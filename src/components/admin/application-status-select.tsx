'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const STATUSES = ['pending', 'contacted', 'reviewing', 'accepted', 'rejected'] as const;

export function ApplicationStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function onChange(next: string) {
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) throw new Error('failed');
      toast.success('Status updated');
      router.refresh();
    } catch {
      setValue(status);
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={saving}>
      <SelectTrigger className="h-8 w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

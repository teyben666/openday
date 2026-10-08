'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  OTHER_SUBJECT_ID,
  findSubject,
  subjectKeywords,
  subjectLabel,
  type SubjectOption,
} from '@/data/subjects';
import { cn } from '@/lib/utils';

interface SubjectPickerProps {
  options: SubjectOption[];
  value: string;
  onChange: (id: string) => void;
  /** Subject ids already used in other rows. */
  takenIds: Set<string>;
  lang: 'zh' | 'en';
  disabled?: boolean;
}

export function SubjectPicker({ options, value, onChange, takenIds, lang, disabled }: SubjectPickerProps) {
  const [open, setOpen] = useState(false);
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: SubjectOption[] }>();
    for (const option of options) {
      const label = lang === 'zh' ? option.group.zh : option.group.en;
      const entry = map.get(label) ?? { label, items: [] };
      entry.items.push(option);
      map.set(label, entry);
    }
    return [...map.values()];
  }, [options, lang]);

  const selected = findSubject(value);
  const triggerText =
    value === OTHER_SUBJECT_ID
      ? t('其他（自行填写）', 'Other (type it in)')
      : selected
        ? subjectLabel(selected, lang)
        : '';

  function pick(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-9 w-full justify-between px-3 font-normal"
        >
          <span className={cn('truncate', !triggerText && 'text-muted-foreground')}>
            {triggerText || t('搜索或选择科目', 'Search or pick a subject')}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(26rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('输入科目名称或代码，例如 0580、数学', 'Type a name or code, e.g. 0580, Maths')} />
          <CommandList className="max-h-72">
            <CommandEmpty>{t('找不到，可选「其他」自行填写', 'Not found — choose “Other” to type it in')}</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((option) => {
                  const taken = option.id !== value && takenIds.has(option.id);
                  const primary = option.native ?? option.en;
                  const secondary = lang === 'zh' ? option.zh : option.native ? option.en : '';
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      keywords={subjectKeywords(option)}
                      disabled={taken}
                      onSelect={() => pick(option.id)}
                    >
                      <Check className={cn('h-4 w-4', value === option.id ? 'opacity-100' : 'opacity-0')} />
                      {option.code && (
                        <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground">{option.code}</span>
                      )}
                      <span className="truncate">
                        {primary}
                        {secondary && secondary !== primary && (
                          <span className="text-muted-foreground"> · {secondary}</span>
                        )}
                      </span>
                      {taken && <span className="ml-auto text-xs text-muted-foreground">{t('已填', 'added')}</span>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            <CommandGroup heading={t('找不到？', 'Not listed?')}>
              <CommandItem
                value={OTHER_SUBJECT_ID}
                keywords={['other', '其他', 'lain-lain']}
                onSelect={() => pick(OTHER_SUBJECT_ID)}
              >
                <Check className={cn('h-4 w-4', value === OTHER_SUBJECT_ID ? 'opacity-100' : 'opacity-0')} />
                {t('其他（自行填写）', 'Other (type it in)')}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

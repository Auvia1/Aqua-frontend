import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { DateField } from '@/components/ui/DateField';
import { CATEGORIES } from '@/data/categories';
import { ponds } from '@/data/farm';
import { categoryLabel, displayPondName } from '@/i18n';
import { useT } from '@/hooks/useT';
import { cn } from '@/lib/cn';
import type { CategoryId, DatePreset, LedgerStatus } from '@/types';

export function DateRangeSheet({
  open,
  preset,
  from,
  to,
  onClose,
  onChange,
}: {
  open: boolean;
  preset: DatePreset;
  from: string;
  to: string;
  onClose: () => void;
  onChange: (preset: DatePreset, from: string, to: string) => void;
}) {
  const [draftPreset, setDraftPreset] = useState(preset);
  const [draftFrom, setDraftFrom] = useState(from);
  const { t } = useT();
  const [draftTo, setDraftTo] = useState(to);
  const presets: { value: DatePreset; label: string }[] = [
    { value: 'today', label: t('today') },
    { value: '7d', label: t('last7') },
    { value: 'month', label: t('thisMonth') },
    { value: 'lastMonth', label: t('lastMonth') },
    { value: 'cycle', label: t('thisCycle') },
    { value: 'custom', label: t('custom') },
  ];

  useEffect(() => {
    if (!open) return;
    setDraftPreset(preset);
    setDraftFrom(from);
    setDraftTo(to);
  }, [open, preset, from, to]);

  return (
    <BottomSheet open={open} onClose={onClose} title={t('date')}>
      <div className="space-y-2 pb-2">
        {presets.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setDraftPreset(option.value)}
            className={cn(
              'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
              draftPreset === option.value ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
            )}
          >
            {option.label}
          </button>
        ))}
        {draftPreset === 'custom' ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <DateField label={t('from')} value={draftFrom} onChange={setDraftFrom} />
            <DateField label={t('to')} value={draftTo} onChange={setDraftTo} />
          </div>
        ) : null}
        <Button
          className="mt-2"
          onClick={() => {
            onChange(draftPreset, draftFrom, draftTo);
            onClose();
          }}
        >
          {t('apply')}
        </Button>
      </div>
    </BottomSheet>
  );
}

export function PondFilterSheet({
  open,
  value,
  onClose,
  onChange,
}: {
  open: boolean;
  value: string[];
  onClose: () => void;
  onChange: (ids: string[]) => void;
}) {
  const { t, lang } = useT();
  const options = [
    ...ponds.map((pond) => ({ id: pond.id, label: displayPondName(lang, pond.id, pond.name) })),
    { id: 'common', label: t('common') },
  ];
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const toggle = (id: string) => {
    setDraft((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('pondsTitle')}>
      <div className="space-y-1 pb-2">
        {options.map((option) => {
          const on = draft.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(option.id)}
              className="pressable flex min-h-touch w-full items-center gap-3 rounded-input px-3 text-body text-ink"
            >
              <Check on={on} />
              {option.label}
            </button>
          );
        })}
      </div>
      <Button
        onClick={() => {
          onChange(draft);
          onClose();
        }}
      >
        {t('apply')}
      </Button>
    </BottomSheet>
  );
}

export function CategoryFilterSheet({
  open,
  value,
  onClose,
  onChange,
}: {
  open: boolean;
  value: CategoryId[];
  onClose: () => void;
  onChange: (ids: CategoryId[]) => void;
}) {
  const { t, lang } = useT();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const toggle = (id: CategoryId) => {
    setDraft((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('category')}>
      <div className="space-y-1 pb-2">
        {CATEGORIES.filter((item) => item.id !== 'revenue').map((item) => {
          const on = draft.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(item.id)}
              className="pressable flex min-h-touch w-full items-center gap-3 rounded-input px-3 text-left text-body text-ink"
            >
              <Check on={on} />
              <CategoryIcon category={item.id} size="sm" />
              {categoryLabel(lang, item.id, item.label)}
            </button>
          );
        })}
      </div>
      <Button
        onClick={() => {
          onChange(draft);
          onClose();
        }}
      >
        {t('apply')}
      </Button>
    </BottomSheet>
  );
}

export function StatusFilterSheet({
  open,
  value,
  onClose,
  onChange,
}: {
  open: boolean;
  value: LedgerStatus;
  onClose: () => void;
  onChange: (value: LedgerStatus) => void;
}) {
  const { t } = useT();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <BottomSheet open={open} onClose={onClose} title={t('status')}>
      <div className="space-y-1 pb-2">
        {([
          { value: 'all', label: t('all') },
          { value: 'paid', label: t('paid') },
          { value: 'credit', label: t('credit') },
        ] as const).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setDraft(item.value)}
            className={cn(
              'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
              draft === item.value ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Button
        onClick={() => {
          onChange(draft);
          onClose();
        }}
      >
        {t('apply')}
      </Button>
    </BottomSheet>
  );
}

export { ExportSheet } from '@/components/ui/ExportSheet';

function Check({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded border',
        on ? 'border-forest-800 bg-forest-800 text-white' : 'border-muted',
      )}
    >
      {on ? '✓' : ''}
    </span>
  );
}

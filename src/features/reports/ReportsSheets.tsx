import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { useT } from '@/hooks/useT';
import { cn } from '@/lib/cn';
import type { ReportPeriodId } from '@/types';

export function PeriodSheet({
  open,
  period,
  from,
  to,
  onClose,
  onChange,
}: {
  open: boolean;
  period: ReportPeriodId;
  from: string;
  to: string;
  onClose: () => void;
  onChange: (period: ReportPeriodId, from: string, to: string) => void;
}) {
  const [draft, setDraft] = useState(period);
  const [draftFrom, setDraftFrom] = useState(from);
  const { t } = useT();
  const [draftTo, setDraftTo] = useState(to);
  const presets: { value: ReportPeriodId; label: string }[] = [
    { value: 'month', label: t('thisMonth') },
    { value: 'lastMonth', label: t('lastMonth') },
    { value: 'last3', label: t('last3') },
    { value: 'cycle', label: t('thisCycle') },
    { value: 'custom', label: t('custom') },
  ];

  useEffect(() => {
    if (!open) return;
    setDraft(period);
    setDraftFrom(from);
    setDraftTo(to);
  }, [open, period, from, to]);

  return (
    <BottomSheet open={open} onClose={onClose} title={t('period')}>
      <div className="space-y-2 pb-2">
        {presets.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setDraft(option.value)}
            className={cn(
              'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
              draft === option.value ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
            )}
          >
            {option.label}
          </button>
        ))}
        {draft === 'custom' ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <DateField label={t('from')} value={draftFrom} onChange={setDraftFrom} />
            <DateField label={t('to')} value={draftTo} onChange={setDraftTo} />
          </div>
        ) : null}
        <Button
          className="mt-2"
          onClick={() => {
            onChange(draft, draftFrom, draftTo);
            onClose();
          }}
        >
          {t('apply')}
        </Button>
      </div>
    </BottomSheet>
  );
}

export function MonthSheet({
  open,
  value,
  options,
  onClose,
  onChange,
}: {
  open: boolean;
  value: string;
  options: { key: string; label: string }[];
  onClose: () => void;
  onChange: (key: string) => void;
}) {
  const { t } = useT();
  return (
    <BottomSheet open={open} onClose={onClose} title={t('month')}>
      <div className="space-y-1 pb-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              onChange(option.key);
              onClose();
            }}
            className={cn(
              'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
              value === option.key ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

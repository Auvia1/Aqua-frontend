import { Clock, FileText, Wheat } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import { ponds } from '@/data/farm';
import { displayPondName } from '@/i18n';
import { useT } from '@/hooks/useT';
import type { PondFilter } from '@/services/ledger';
import type { HomeAlert, PeriodId } from '@/types';

export { EntryDetailSheet } from '@/components/ui/EntryDetailSheet';

const ALERT_ICON = {
  dues: Wheat,
  lease: FileText,
  missing: Clock,
} as const;

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
  alerts: HomeAlert[];
  onMarkRead: () => void;
}

export function NotificationsSheet({ open, onClose, alerts, onMarkRead }: NotificationsSheetProps) {
  const { t } = useT();
  return (
    <BottomSheet open={open} onClose={onClose} title={t('notifications')}>
      {alerts.length === 0 ? (
        <p className="py-8 text-center text-body text-muted">{t('noReminders')}</p>
      ) : (
        <ul className="space-y-1">
          {alerts.map((alert) => {
            const Icon = ALERT_ICON[alert.kind];
            return (
              <li key={alert.id} className="flex items-start gap-3 rounded-input px-1 py-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-100 text-forest-800">
                  <Icon size={ICON.size} strokeWidth={ICON.stroke} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-medium text-ink">{alert.title}</span>
                  <span className="mt-0.5 block text-caption text-muted">{alert.time}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {alerts.length > 0 ? (
        <Button className="mt-4" onClick={onMarkRead}>
          {t('markAllRead')}
        </Button>
      ) : null}
    </BottomSheet>
  );
}

interface PondPickerSheetProps {
  open: boolean;
  onClose: () => void;
  value: PondFilter;
  onChange: (value: PondFilter) => void;
}

export function PondPickerSheet({ open, onClose, value, onChange }: PondPickerSheetProps) {
  const { t, lang } = useT();
  const options: { value: PondFilter; label: string }[] = [
    { value: 'all', label: t('allPonds') },
    ...ponds.map((pond) => ({ value: pond.id, label: displayPondName(lang, pond.id, pond.name) })),
  ];

  return (
    <BottomSheet open={open} onClose={onClose} title={t('pondsTitle')}>
      <div role="radiogroup" aria-label={t('filterByPond')} className="space-y-1 pb-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                'pressable flex h-12 w-full items-center justify-between rounded-input px-4 text-body',
                selected ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
              )}
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
            >
              {option.label}
              <span
                className={cn(
                  'h-4 w-4 rounded-full border',
                  selected ? 'border-white bg-white' : 'border-muted',
                )}
              />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

interface ChartRangeSheetProps {
  open: boolean;
  onClose: () => void;
  value: PeriodId;
  onChange: (value: PeriodId) => void;
}

export function ChartRangeSheet({ open, onClose, value, onChange }: ChartRangeSheetProps) {
  const { t } = useT();
  const ranges = [
    { value: 'today' as const, label: t('today') },
    { value: 'week' as const, label: t('week') },
    { value: 'month' as const, label: t('month') },
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title={t('chartRange')}>
      <div className="space-y-1 pb-2">
        {ranges.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
                selected ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
              )}
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}


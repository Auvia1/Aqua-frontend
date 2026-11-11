import { ChevronDown } from 'lucide-react';
import { SpendBarChart } from '@/components/ui/BarChart';
import { Chip } from '@/components/ui/Chip';
import { DonutChart } from '@/components/ui/DonutChart';
import { InsightBanner } from '@/components/ui/InsightBanner';
import { TransactionList, TransactionRow } from '@/components/ui/TransactionRow';
import { donutLabel } from '@/i18n';
import { useT } from '@/hooks/useT';
import { formatAxis } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import type { SpendSlice } from '@/services/reports';
import type { BarPoint, LedgerEntry, SpendGrain } from '@/types';

export function SpendingTab({
  monthLabel,
  onOpenMonth,
  slices,
  total,
  feedPercent,
  onFeed,
  grain,
  onGrain,
  trend,
  top,
  onOpen,
}: {
  monthLabel: string;
  onOpenMonth: () => void;
  slices: SpendSlice[];
  total: number;
  feedPercent: number;
  onFeed: () => void;
  grain: SpendGrain;
  onGrain: (value: SpendGrain) => void;
  trend: BarPoint[];
  top: LedgerEntry[];
  onOpen: (entry: LedgerEntry) => void;
}) {
  const { t, lang } = useT();
  const grainTabs: { value: SpendGrain; label: string }[] = [
    { value: 'daily', label: t('daily') },
    { value: 'weekly', label: t('weekly') },
    { value: 'monthly', label: t('monthly') },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-card bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-title text-ink">{t('yourSpending')}</h2>
          <button
            type="button"
            onClick={onOpenMonth}
            className="pressable inline-flex min-h-touch items-center gap-1 text-caption font-semibold text-forest-800"
          >
            {monthLabel}
            <ChevronDown size={16} strokeWidth={ICON.stroke} />
          </button>
        </div>
        <DonutChart data={slices.map((slice) => ({ ...slice, name: donutLabel(lang, slice.name) }))} total={total} label={t('totalSpent')} />
      </section>

      {feedPercent > 0 ? (
        <InsightBanner
          title={t('feedShareInsight', { pct: feedPercent })}
          caption={t('tapFeed')}
          onClick={onFeed}
        />
      ) : null}

      <section className="rounded-card bg-card p-4 shadow-soft">
        <h2 className="text-title text-ink">{t('spendingTrend')}</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {grainTabs.map((item) => (
            <Chip key={item.value} selected={grain === item.value} onClick={() => onGrain(item.value)} className="shrink-0">
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="mt-3">
          <SpendBarChart data={trend} formatTick={formatAxis} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-title text-ink">{t('top5')}</h2>
        <TransactionList>
          {top.map((entry, index) => (
            <TransactionRow
              key={entry.id}
              entry={entry}
              showDivider={index < top.length - 1}
              onClick={() => onOpen(entry)}
            />
          ))}
        </TransactionList>
      </section>
    </div>
  );
}

import { ChevronDown, Clock, Plus, Wheat } from 'lucide-react';
import { InsightBanner } from '@/components/ui/InsightBanner';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { TransactionList, TransactionRow } from '@/components/ui/TransactionRow';
import { SpendRevenueChart } from '@/features/home/SpendRevenueChart';
import { ponds } from '@/data/farm';
import { displayPondName } from '@/i18n';
import { useT } from '@/hooks/useT';
import { formatINRCompact } from '@/lib/format';
import { ICON, POND_CARD_WIDTH } from '@/lib/tokens';
import type { HomePondCard, PondFilter } from '@/services/ledger';
import type { Language, LedgerEntry, PeriodId } from '@/types';

export function HomeFilters({
  pondLabel,
  period,
  onOpenPonds,
  onPeriod,
}: {
  pondLabel: string;
  period: PeriodId;
  onOpenPonds: () => void;
  onPeriod: (value: PeriodId) => void;
}) {
  const { t } = useT();
  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        onClick={onOpenPonds}
        className="pressable flex min-h-touch shrink-0 items-center gap-1 rounded-pill bg-tile px-3.5 text-caption font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30"
      >
        {pondLabel}
        <ChevronDown size={16} strokeWidth={ICON.stroke} />
      </button>
      <div className="min-w-0 flex-1">
        <SegmentedTabs
          ariaLabel={t('period')}
          value={period}
          onChange={onPeriod}
          tabs={[
            { value: 'today', label: t('today') },
            { value: 'week', label: t('week') },
            { value: 'month', label: t('month') },
          ]}
        />
      </div>
    </div>
  );
}

export function HomeChart({
  period,
  onOpenRange,
  data,
}: {
  period: PeriodId;
  onOpenRange: () => void;
  data: HomeModelChart;
}) {
  const { t } = useT();
  const chartLabel = { today: t('today'), week: t('week'), month: t('month') } as const;
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-title text-ink">{t('spendVsRevenue')}</h2>
        <button
          type="button"
          onClick={onOpenRange}
          className="pressable flex min-h-touch items-center gap-1 text-caption font-semibold text-muted"
        >
          {chartLabel[period]}
          <ChevronDown size={14} strokeWidth={ICON.stroke} />
        </button>
      </div>
      <div className="rounded-card bg-card px-2 pb-3 pt-1">
        <SpendRevenueChart data={data} />
        <div className="mt-1 flex items-center justify-center gap-5 text-caption text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-leaf-300" /> {t('spend')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-lime-300" /> {t('revenue')}
          </span>
        </div>
      </div>
    </section>
  );
}

type HomeModelChart = import('@/types').DayPoint[];

export function HomeBanners({
  duesTotal,
  duesCount,
  onDues,
  onLease,
  leaseTitle,
  leaseCaption,
}: {
  duesTotal: number;
  duesCount: number;
  onDues: () => void;
  onLease: () => void;
  leaseTitle?: string;
  leaseCaption?: string;
}) {
  const { t } = useT();
  return (
    <div className="mt-4 space-y-2.5">
      {duesTotal > 0 ? (
      <InsightBanner
        title={t('duesPending', { amount: formatINRCompact(duesTotal) })}
        caption={t('vendorsWaiting', { count: duesCount })}
        icon={Wheat}
        onClick={onDues}
      />
      ) : null}
      {leaseTitle ? (
      <InsightBanner
        tone="warn"
        title={leaseTitle}
        caption={leaseCaption}
        icon={Clock}
        onClick={onLease}
      />
      ) : null}
    </div>
  );
}

export function HomePonds({
  cards,
  onOpen,
  onAdd,
  onSeeAll,
}: {
  cards: HomePondCard[];
  onOpen: (id: string) => void;
  onAdd: () => void;
  onSeeAll: () => void;
}) {
  const { t, lang } = useT();
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between px-page">
        <h2 className="text-title text-ink">{t('myPonds')}</h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="pressable inline-flex min-h-touch items-center text-caption font-semibold text-forest-800"
        >
          {t('seeAll')}
        </button>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-1">
        {cards.map(({ pond, spent, speciesChip }) => (
          <button
            key={pond.id}
            type="button"
            onClick={() => onOpen(pond.id)}
            className="pressable snap-start shrink-0 rounded-card bg-card p-3.5 text-left shadow-soft"
            style={{ width: POND_CARD_WIDTH }}
          >
            <p className="text-title text-ink">{displayPondName(lang, pond.id, pond.name)}</p>
            <span className="mt-1 inline-flex rounded-pill bg-tile px-2 py-0.5 text-[11px] font-medium text-forest-800">
              {speciesChip}
            </span>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-caption font-medium text-ink">
                {pond.status === 'active' ? t('dayN', { n: pond.cycleDay ?? 0 }) : t('idle')}
              </p>
              <div className="min-w-0 text-right">
                <p className="text-caption text-muted">{t('spent')}</p>
                <p className="text-body font-semibold tabular-nums text-ink">{formatINRCompact(spent)}</p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-caption text-muted">
              <span
                className={
                  pond.status === 'active' ? 'h-1.5 w-1.5 rounded-full bg-leaf-500' : 'h-1.5 w-1.5 rounded-full bg-muted'
                }
              />
              {pond.status === 'active' ? t('active') : t('idle')}
            </p>
          </button>
        ))}
        <button
          type="button"
          onClick={onAdd}
          style={{ width: POND_CARD_WIDTH }}
          className="pressable flex shrink-0 snap-start flex-col items-center justify-center rounded-card border border-dashed border-line bg-transparent text-forest-800"
        >
          <Plus size={ICON.size} strokeWidth={ICON.stroke} />
          <span className="mt-2 text-caption font-semibold">{t('addPondCta')}</span>
        </button>
      </div>
    </section>
  );
}

export function HomeTransactions({
  entries,
  onOpen,
  onSeeAll,
}: {
  entries: LedgerEntry[];
  onOpen: (entry: LedgerEntry) => void;
  onSeeAll: () => void;
}) {
  const { t } = useT();
  return (
    <section className="mt-6 px-page">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-title text-ink">{t('recentTx')}</h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="pressable inline-flex min-h-touch items-center text-caption font-semibold text-forest-800"
        >
          {t('seeAll')}
        </button>
      </div>
      <TransactionList>
        {entries.map((entry, index) => (
          <TransactionRow
            key={entry.id}
            entry={entry}
            showDivider={index < entries.length - 1}
            onClick={() => onOpen(entry)}
          />
        ))}
      </TransactionList>
    </section>
  );
}

export function HomeSkeleton() {
  return (
    <div className="space-y-5 px-page pt-3">
      <div className="h-11 animate-pulse rounded-pill bg-tile" />
      <div className="h-48 animate-pulse rounded-hero bg-tile" />
      <div className="flex justify-between">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 animate-pulse rounded-tile bg-tile" />
            <div className="h-3 w-12 animate-pulse rounded bg-tile" />
          </div>
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-card bg-tile" />
      <div className="h-36 animate-pulse rounded-card bg-tile" />
    </div>
  );
}

export function pondFilterLabel(filter: PondFilter, lang: Language = 'en'): string {
  if (filter === 'all') return displayPondName(lang, 'all');
  const pond = ponds.find((item) => item.id === filter);
  return displayPondName(lang, filter, pond?.name);
}

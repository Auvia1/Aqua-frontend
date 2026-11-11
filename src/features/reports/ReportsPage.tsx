import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarChart3, ChevronDown, Share2 } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntryDetailSheet } from '@/components/ui/EntryDetailSheet';
import { ExportSheet } from '@/components/ui/ExportSheet';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { PondPickerSheet } from '@/features/home/HomeSheets';
import { pondFilterLabel } from '@/features/home/HomeSections';
import { PondsTab } from '@/features/reports/PondsTab';
import { MonthSheet, PeriodSheet } from '@/features/reports/ReportsSheets';
import { RevenueTab } from '@/features/reports/RevenueTab';
import { SpendingTab } from '@/features/reports/SpendingTab';
import { ponds } from '@/data/farm';
import { startOfMonth } from 'date-fns';
import { useT } from '@/hooks/useT';
import { APP_TODAY, formatMonthYear, toISODate } from '@/lib/format';
import { HOME_SKELETON_MS, ICON } from '@/lib/tokens';
import {
  compareCycles,
  monthBounds,
  monthsInRange,
  reportRangeFor,
  revenueStats,
  scopedEntries,
  scopedSales,
  harvestsForReport,
  pondWithMostFeed,
  spendSlices,
  topExpenses,
  trendPoints,
} from '@/services/reports';
import type { PondFilter } from '@/services/ledger';
import type { LedgerEntry, ReportPeriodId, ReportTab, SpendGrain } from '@/types';

function reportTabFromQuery(value: string | null): ReportTab {
  if (value === 'profit') return 'revenue';
  if (value === 'revenue' || value === 'ponds' || value === 'spending') return value;
  return 'spending';
}

function reportPeriodFromQuery(value: string | null): ReportPeriodId {
  if (value === 'lastMonth' || value === 'last3' || value === 'cycle' || value === 'custom' || value === 'month') {
    return value;
  }
  return 'month';
}

export function ReportsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { showToast } = useUi();
  const { t, lang } = useT();
  const tabs: { value: ReportTab; label: string }[] = [
    { value: 'spending', label: t('spending') },
    { value: 'revenue', label: t('revenue') },
    { value: 'ponds', label: t('pondsTitle') },
  ];
  const { entries, sales } = useLedger();
  const [tab, setTab] = useState<ReportTab>(() => reportTabFromQuery(params.get('tab')));
  const [period, setPeriod] = useState<ReportPeriodId>(() => reportPeriodFromQuery(params.get('period')));
  const [customFrom, setCustomFrom] = useState(toISODate(startOfMonth(APP_TODAY)));
  const [customTo, setCustomTo] = useState(toISODate());
  const [pondId, setPondId] = useState<PondFilter>(() => {
    const value = params.get('pond');
    return value && value !== 'all' ? value : 'all';
  });
  const [grain, setGrain] = useState<SpendGrain>('daily');
  const [compareId, setCompareId] = useState(ponds[0]?.id ?? '');
  const [monthKey, setMonthKey] = useState(toISODate(startOfMonth(APP_TODAY)).slice(0, 7));
  const [periodOpen, setPeriodOpen] = useState(false);
  const [pondOpen, setPondOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [active, setActive] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), HOME_SKELETON_MS);
    return () => window.clearTimeout(t);
  }, []);

  const range = reportRangeFor(period, customFrom, customTo, pondId);
  const months = monthsInRange(range.start, range.end);
  const activeMonth = months.some((item) => item.key === monthKey) ? monthKey : (months[months.length - 1]?.key ?? monthKey);
  const monthRange = monthBounds(activeMonth);
  const monthLabel = months.find((item) => item.key === activeMonth)?.label ?? formatMonthYear(monthRange.start);

  const periodEntries = useMemo(
    () => scopedEntries(entries, range.start, range.end, pondId),
    [entries, range.start, range.end, pondId],
  );
  const monthEntries = useMemo(
    () => scopedEntries(entries, monthRange.start, monthRange.end, pondId),
    [entries, monthRange.start, monthRange.end, pondId],
  );
  const harvests = useMemo(() => harvestsForReport(sales, entries), [sales, entries]);
  const periodSales = useMemo(
    () => scopedSales(harvests, range.start, range.end, pondId),
    [harvests, range.start, range.end, pondId],
  );

  const slices = spendSlices(monthEntries);
  const spendTotal = monthEntries.filter((entry) => entry.kind === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  const feedPercent = slices.find((slice) => slice.name === 'Feed')?.percent ?? 0;
  const trend = trendPoints(periodEntries, range.start, range.end, grain);
  const top = topExpenses(monthEntries);
  const rev = revenueStats(periodSales);
  const compared = compareCycles(compareId, entries);

  const feedPond = pondId === 'all' ? pondWithMostFeed(monthEntries, ponds[0]?.id) : pondId;

  return (
    <div className="min-h-full bg-bg pb-4">
      <header className="flex items-center justify-between px-page pt-[max(12px,env(safe-area-inset-top))]">
        <h1 className="text-h1 text-ink">{t('reports')}</h1>
        <IconButton label={t('share')} onClick={() => setExportOpen(true)}>
          <Share2 size={ICON.size} strokeWidth={ICON.stroke} />
        </IconButton>
      </header>

      <div className="space-y-4 px-page pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPondOpen(true)}
            className="pressable inline-flex min-h-touch items-center gap-1 rounded-pill bg-tile px-3.5 text-caption font-semibold text-ink"
          >
            {pondFilterLabel(pondId, lang)}
            <ChevronDown size={16} strokeWidth={ICON.stroke} />
          </button>
          <Chip selected={period !== 'month'} onClick={() => setPeriodOpen(true)} className="shrink-0 gap-1 text-caption">
            {range.label}
            <ChevronDown size={14} strokeWidth={ICON.stroke} />
          </Chip>
        </div>

        <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} ariaLabel={t('reports')} />

        {loading ? (
          <SkeletonRows count={5} />
        ) : periodEntries.length === 0 && periodSales.length === 0 ? (
          <EmptyState icon={BarChart3} title={t('noNumbers')} description={t('tryAnother')} />
        ) : tab === 'spending' ? (
          <SpendingTab
            monthLabel={monthLabel}
            onOpenMonth={() => setMonthOpen(true)}
            slices={slices}
            total={spendTotal}
            feedPercent={feedPercent}
            onFeed={() => navigate(feedPond ? `/ponds/${feedPond}?tab=feed` : '/ponds')}
            grain={grain}
            onGrain={setGrain}
            trend={trend}
            top={top}
            onOpen={setActive}
          />
        ) : tab === 'revenue' ? (
          <RevenueTab
            total={rev.total}
            qty={rev.qty}
            avgRate={rev.avgRate}
            pending={rev.pending}
            bars={rev.bars}
            sales={periodSales}
            onDues={() => navigate('/dues')}
          />
        ) : (
          <PondsTab compareId={compareId} onCompare={setCompareId} cycles={compared} />
        )}
      </div>

      <PeriodSheet
        open={periodOpen}
        period={period}
        from={customFrom}
        to={customTo}
        onClose={() => setPeriodOpen(false)}
        onChange={(next, from, to) => {
          setPeriod(next);
          setCustomFrom(from);
          setCustomTo(to);
        }}
      />
      <MonthSheet open={monthOpen} value={activeMonth} options={months} onClose={() => setMonthOpen(false)} onChange={setMonthKey} />
      <PondPickerSheet open={pondOpen} value={pondId} onClose={() => setPondOpen(false)} onChange={setPondId} />
      <ExportSheet open={exportOpen} onClose={() => setExportOpen(false)} onPick={(label) => showToast(t('comingSoonNamed', { label }))} />
      <EntryDetailSheet entry={active} onClose={() => setActive(null)} />
    </div>
  );
}

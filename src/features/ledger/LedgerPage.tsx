import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Download, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntryDetailSheet } from '@/components/ui/EntryDetailSheet';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { CompactSummary, LedgerList } from '@/features/ledger/LedgerList';
import {
  CategoryFilterSheet,
  DateRangeSheet,
  ExportSheet,
  PondFilterSheet,
  StatusFilterSheet,
} from '@/features/ledger/LedgerSheets';
import { useT } from '@/hooks/useT';
import { formatINRCompact } from '@/lib/format';
import { HOME_SKELETON_MS, ICON } from '@/lib/tokens';
import {
  LEDGER_PAGE,
  dateRangeFor,
  defaultLedgerQuery,
  editPath,
  filterLedger,
  groupLedger,
  ledgerTotals,
  queryIsFiltered,
  type LedgerQuery,
} from '@/services/ledger';
import { expenseOnOpenCycle } from '@/services/ponds';
import type { LedgerEntry, LedgerTab } from '@/types';

export function LedgerPage() {
  const navigate = useNavigate();
  const { t } = useT();
  const tabs: { value: LedgerTab; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'expense', label: t('expenses') },
    { value: 'revenue', label: t('revenue') },
  ];
  const statusLabel = { all: t('status'), paid: t('paid'), credit: t('credit') } as const;
  const [params] = useSearchParams();
  const firstUse = params.get('empty') === '1';
  const { entries } = useLedger();
  const { showToast } = useUi();
  const [query, setQuery] = useState<LedgerQuery>(defaultLedgerQuery);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [pondOpen, setPondOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [active, setActive] = useState<LedgerEntry | null>(null);
  const [limit, setLimit] = useState(LEDGER_PAGE);
  const [loading, setLoading] = useState(!firstUse);

  useEffect(() => {
    if (firstUse) return undefined;
    const t = window.setTimeout(() => setLoading(false), HOME_SKELETON_MS);
    return () => window.clearTimeout(t);
  }, [firstUse]);

  const filtered = useMemo(() => filterLedger(entries, query), [entries, query]);
  const groups = useMemo(() => groupLedger(filtered), [filtered]);
  const visible = useMemo(() => {
    let left = limit;
    return groups
      .map((group) => {
        const rows = group.rows.slice(0, Math.max(left, 0));
        left -= group.rows.length;
        return { ...group, rows };
      })
      .filter((group) => group.rows.length > 0);
  }, [groups, limit]);
  const totals = ledgerTotals(filtered);
  const range = dateRangeFor(query);
  const filteredOn = queryIsFiltered(query);
  const shown = visible.reduce((sum, group) => sum + group.rows.length, 0);

  const patch = (next: Partial<LedgerQuery>) => {
    setQuery((current) => ({ ...current, ...next }));
    setLimit(LEDGER_PAGE);
  };

  return (
    <div className="min-h-full bg-bg pb-4">
      <header className="flex items-center justify-between px-page pt-[max(12px,env(safe-area-inset-top))]">
        <h1 className="text-h1 text-ink">{t('ledger')}</h1>
        <div className="flex items-center gap-2">
          <IconButton label={t('search')} onClick={() => setSearchOpen((value) => !value)}>
            <Search size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
          <IconButton label={t('download')} onClick={() => setExportOpen(true)}>
            <Download size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
        </div>
      </header>

      {searchOpen ? (
        <div className="mt-3 px-page">
          <div className="relative">
            <input
              value={query.search}
              onChange={(event) => patch({ search: event.target.value })}
              placeholder={t('searchLedger')}
              className="h-14 w-full rounded-input bg-surface px-4 pr-12 text-body text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-forest-800/30"
            />
            <button
              type="button"
              aria-label={t('clearAll')}
              onClick={() => {
                if (query.search) patch({ search: '' });
                else setSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            >
              <X size={18} strokeWidth={ICON.stroke} />
            </button>
          </div>
        </div>
      ) : null}

      {firstUse ? (
        <EmptyState
          icon={Plus}
          title={t('firstExpense')}
          description={t('firstExpenseHint')}
          action={<Button onClick={() => navigate('/add/expense')}>{t('addExpenseCta')}</Button>}
        />
      ) : loading ? (
        <div className="px-page pt-4">
          <SkeletonRows count={6} />
        </div>
      ) : (
        <div className="space-y-4 px-page pt-4">
          <CompactSummary
            label={range.label}
            spent={formatINRCompact(totals.spent)}
            revenue={formatINRCompact(totals.revenue)}
            net={formatINRCompact(totals.net)}
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            <Chip selected={query.preset !== 'month'} onClick={() => setDateOpen(true)} className="shrink-0 gap-1">
              {range.label}
              <ChevronDown size={14} strokeWidth={ICON.stroke} />
            </Chip>
            <Chip selected={query.ponds.length > 0} onClick={() => setPondOpen(true)} className="shrink-0">
              {t('pond')}{query.ponds.length ? ` · ${query.ponds.length}` : ''}
            </Chip>
            <Chip selected={query.categories.length > 0} onClick={() => setCatOpen(true)} className="shrink-0">
              {t('category')}{query.categories.length ? ` · ${query.categories.length}` : ''}
            </Chip>
            <Chip selected={query.status !== 'all'} onClick={() => setStatusOpen(true)} className="shrink-0">
              {statusLabel[query.status]}
            </Chip>
            {filteredOn ? (
              <button
                type="button"
                onClick={() => setQuery(defaultLedgerQuery())}
                className="pressable shrink-0 px-2 text-caption font-semibold text-forest-800"
              >
                {t('clearAll')}
              </button>
            ) : null}
          </div>

          <SegmentedTabs tabs={tabs} value={query.tab} onChange={(tab) => patch({ tab })} ariaLabel={t('ledger')} />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title={t('noMatch')}
              action={
                <Button variant="secondary" onClick={() => setQuery(defaultLedgerQuery())}>
                  {t('clearFilters')}
                </Button>
              }
            />
          ) : (
            <>
              <LedgerList
                groups={visible}
                onOpen={setActive}
                onEdit={(entry) => {
                  if (!expenseOnOpenCycle(entry)) {
                    showToast('This cycle is closed');
                    return;
                  }
                  navigate(editPath(entry));
                }}
                onDelete={() => showToast(t('comingSoon'))}
              />
              {shown < filtered.length ? (
                <Button variant="ghost" onClick={() => setLimit((value) => value + LEDGER_PAGE)}>
                  {t('loadMore')}
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}

      <DateRangeSheet
        open={dateOpen}
        preset={query.preset}
        from={query.customFrom}
        to={query.customTo}
        onClose={() => setDateOpen(false)}
        onChange={(preset, customFrom, customTo) => patch({ preset, customFrom, customTo })}
      />
      <PondFilterSheet
        open={pondOpen}
        value={query.ponds}
        onClose={() => setPondOpen(false)}
        onChange={(ponds) => patch({ ponds })}
      />
      <CategoryFilterSheet
        open={catOpen}
        value={query.categories}
        onClose={() => setCatOpen(false)}
        onChange={(categories) => patch({ categories })}
      />
      <StatusFilterSheet
        open={statusOpen}
        value={query.status}
        onClose={() => setStatusOpen(false)}
        onChange={(status) => patch({ status })}
      />
      <ExportSheet
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onPick={(label) => showToast(t('comingSoonNamed', { label }))}
      />
      <EntryDetailSheet entry={active} onClose={() => setActive(null)} />
    </div>
  );
}

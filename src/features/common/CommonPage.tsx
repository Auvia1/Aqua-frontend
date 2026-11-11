import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Layers, Plus } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntryDetailSheet } from '@/components/ui/EntryDetailSheet';
import { HeroCard } from '@/components/ui/HeroCard';
import { SkeletonHero, SkeletonRows } from '@/components/ui/Skeleton';
import { TransactionList, TransactionRow } from '@/components/ui/TransactionRow';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { recurringItems } from '@/data/common';
import { CategoryCards, RecurringCard, dueLabel } from '@/features/common/CommonSections';
import { DateRangeSheet } from '@/features/ledger/LedgerSheets';
import { formatDateHeader, formatINRCompact } from '@/lib/format';
import { HOME_SKELETON_MS, ICON } from '@/lib/tokens';
import { buildCommonRange, groupByDate, matchesCommonFilter } from '@/services/common';
import { dateRangeFor, defaultLedgerQuery } from '@/services/ledger';
import type { CommonFilter, DatePreset, LedgerEntry } from '@/types';

export function CommonPage() {
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { entries } = useLedger();
  const initial = defaultLedgerQuery();

  const [preset, setPreset] = useState<DatePreset>(initial.preset);
  const [customFrom, setCustomFrom] = useState(initial.customFrom);
  const [customTo, setCustomTo] = useState(initial.customTo);
  const [dateOpen, setDateOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommonFilter | 'all'>('all');
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Record<string, boolean>>({
    'rec-lease': true,
    'rec-power': true,
  });
  const [active, setActive] = useState<LedgerEntry | null>(null);

  const range = useMemo(
    () => dateRangeFor({ ...initial, preset, customFrom, customTo }),
    [preset, customFrom, customTo],
  );

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), HOME_SKELETON_MS);
    return () => window.clearTimeout(timer);
  }, [preset, customFrom, customTo]);

  const model = useMemo(
    () => buildCommonRange(range.start, range.end, entries),
    [range.start, range.end, entries],
  );
  const visible = useMemo(
    () => model.entries.filter((entry) => matchesCommonFilter(entry, filter)),
    [model, filter],
  );
  const grouped = useMemo(() => groupByDate(visible), [visible]);
  const upcoming = recurringItems.filter((item) => !paidIds.includes(item.id));
  const otherTotal = model.total - model.electricity - model.vehicle;

  return (
    <div className="min-h-full bg-bg pb-4">
      <PageHeader
        variant="b"
        title="Common expenses"
        rightIcon={Plus}
        rightAriaLabel="Add common expense"
        onRightClick={() => navigate('/common/new')}
      />

      <div className="mt-3 px-page">
        <Chip selected={preset !== 'month'} onClick={() => setDateOpen(true)} className="gap-1">
          {range.label}
          <ChevronDown size={14} strokeWidth={ICON.stroke} />
        </Chip>
      </div>

      {loading ? (
        <div className="space-y-4 px-page pt-4">
          <SkeletonHero />
          <SkeletonRows count={4} />
        </div>
      ) : (
        <div className="space-y-4 px-page pt-4">
          <HeroCard
            label="Shared costs"
            amount={model.total}
            changePercent={model.changePercent}
            hidden={hidden}
            hideChart
            onToggleHidden={() => setHidden((value) => !value)}
            stats={[
              { label: 'Electricity', value: formatINRCompact(model.electricity) },
              { label: 'Vehicle', value: formatINRCompact(model.vehicle) },
              { label: 'Other', value: formatINRCompact(otherTotal) },
            ]}
          />

          <CategoryCards
            totals={{
              electricity: model.electricity,
              lease: 0,
              vehicle: model.vehicle,
              other: otherTotal,
            }}
            dues={{
              electricity: dueLabel(recurringItems.find((item) => item.category === 'electricity')?.dueDate ?? '') ?? undefined,
            }}
            filter={filter}
            onFilter={setFilter}
          />

          <RecurringCard
            items={upcoming}
            reminders={reminders}
            onPaid={(item) => {
              setPaidIds((current) => [...current, item.id]);
              showToast(`${item.title} marked paid`, 'success');
            }}
            onToggleRemind={(id) => {
              setReminders((current) => {
                const next = !(current[id] ?? true);
                showToast(next ? 'Reminder on' : 'Reminder off');
                return { ...current, [id]: next };
              });
            }}
          />

          {grouped.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No shared costs"
              description="Nothing logged in this period. Add a common expense to track farm-wide costs."
            />
          ) : (
            grouped.map((group) => (
              <div key={group.date}>
                <p className="mb-2 px-1 text-caption font-semibold text-muted">{formatDateHeader(group.date)}</p>
                <TransactionList>
                  {group.rows.map((entry, index) => (
                    <TransactionRow
                      key={entry.id}
                      entry={entry}
                      showDate={false}
                      showDivider={index < group.rows.length - 1}
                      onClick={() => setActive(entry)}
                    />
                  ))}
                </TransactionList>
              </div>
            ))
          )}
        </div>
      )}

      <DateRangeSheet
        open={dateOpen}
        preset={preset}
        from={customFrom}
        to={customTo}
        onClose={() => setDateOpen(false)}
        onChange={(nextPreset, from, to) => {
          setPreset(nextPreset);
          setCustomFrom(from);
          setCustomTo(to);
        }}
      />
      <EntryDetailSheet entry={active} onClose={() => setActive(null)} />
    </div>
  );
}

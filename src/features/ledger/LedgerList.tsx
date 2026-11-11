import { ChevronRight, Layers } from 'lucide-react';
import { TransactionList, TransactionRow } from '@/components/ui/TransactionRow';
import { SwipeRow } from '@/components/ui/SwipeRow';
import { useT } from '@/hooks/useT';
import { formatDate, formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import type { LedgerEntry } from '@/types';

export function CompactSummary({
  label,
  spent,
  revenue,
  net,
}: {
  label: string;
  spent: string;
  revenue: string;
  net: string;
}) {
  const { t } = useT();
  return (
    <section className="rounded-hero bg-forest-800 px-4 py-4 text-white">
      <p className="text-caption text-white/70">{label}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label={t('spent')} value={spent} />
        <Stat label={t('revenue')} value={revenue} />
        <Stat label={t('net')} value={net} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-white/60">{label}</p>
      <p className={cn('mt-0.5 text-caption font-semibold tabular-nums')}>{value}</p>
    </div>
  );
}

export function CommonExpensesLink({ amount, onOpen }: { amount: number; onOpen: () => void }) {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pressable flex min-h-touch w-full items-center gap-3 rounded-card bg-card px-4 py-3 text-left shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-100 text-forest-800">
        <Layers size={ICON.size} strokeWidth={ICON.stroke} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-ink">{t('commonExpenses')}</span>
        <span className="block text-caption text-muted">{t('commonExpensesHint')}</span>
      </span>
      <span className="shrink-0 text-caption font-semibold tabular-nums text-ink">{formatINRCompact(amount)}</span>
      <ChevronRight size={18} strokeWidth={ICON.stroke} className="shrink-0 text-muted" />
    </button>
  );
}

export function LedgerList({
  groups,
  onOpen,
  onEdit,
  onDelete,
}: {
  groups: { date: string; rows: LedgerEntry[]; total: number }[];
  onOpen: (entry: LedgerEntry) => void;
  onEdit: (entry: LedgerEntry) => void;
  onDelete: (entry: LedgerEntry) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const sign = group.total < 0 ? '−' : group.total > 0 ? '+' : '';
        return (
          <section key={group.date}>
            <p className="sticky top-0 z-10 mb-2 bg-bg px-1 py-2 text-caption font-semibold text-muted">
              {formatDate(group.date)} · {sign}
              {formatINRCompact(Math.abs(group.total))}
            </p>
            <TransactionList>
              {group.rows.map((entry, index) => (
                <SwipeRow key={entry.id} onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry)}>
                  <TransactionRow
                    entry={entry}
                    showDate={false}
                    showDivider={index < group.rows.length - 1}
                    onClick={() => onOpen(entry)}
                  />
                </SwipeRow>
              ))}
            </TransactionList>
          </section>
        );
      })}
    </div>
  );
}

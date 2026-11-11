import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { DonutChart } from '@/components/ui/DonutChart';
import { TransactionList, TransactionRow } from '@/components/ui/TransactionRow';
import { formatDateHeader, formatINRCompact } from '@/lib/format';
import type { PondDetailModel } from '@/services/pondDetail';
import type { LedgerEntry } from '@/types';

export function PondDetailExpenses({
  model,
  visible,
  onEntry,
  onLoadMore,
  canLoadMore,
}: {
  model: PondDetailModel;
  visible: LedgerEntry[];
  onEntry: (entry: LedgerEntry) => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
}) {
  const grouped = groupByDate(visible.filter((entry) => entry.kind === 'expense'));

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-card p-4">
        <DonutChart data={model.slices} total={model.spent} />
      </div>

      <div className="space-y-1 rounded-card bg-card p-2">
        {model.categoryRows.map((row) => (
          <div key={row.key} className="flex w-full items-center gap-3 rounded-input px-2 py-2.5 text-left">
            {row.category ? <CategoryIcon category={row.category} size="sm" /> : <span className="h-10 w-10 rounded-full bg-tile" />}
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-body font-medium text-ink">{row.name}</span>
                <span className="text-caption font-semibold tabular-nums text-ink">{formatINRCompact(row.amount)}</span>
              </span>
              <span className="mt-1.5 block h-1 w-full rounded-pill bg-tile">
                <span className="block h-1 rounded-pill" style={{ width: `${row.percent}%`, backgroundColor: row.color }} />
              </span>
            </span>
          </div>
        ))}
      </div>

      {grouped.map((group) => (
        <div key={group.date}>
          <p className="mb-2 px-1 text-caption font-semibold text-muted">{formatDateHeader(group.date)}</p>
          <TransactionList>
            {group.rows.map((entry, index) => (
              <TransactionRow
                key={entry.id}
                entry={entry}
                showDate={false}
                showDivider={index < group.rows.length - 1}
                onClick={() => onEntry(entry)}
              />
            ))}
          </TransactionList>
        </div>
      ))}

      {canLoadMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="pressable flex min-h-touch w-full items-center justify-center text-body font-semibold text-forest-800"
        >
          Load more
        </button>
      ) : null}
    </div>
  );
}

function groupByDate(entries: LedgerEntry[]): { date: string; rows: LedgerEntry[] }[] {
  const map = new Map<string, LedgerEntry[]>();
  entries.forEach((entry) => {
    const list = map.get(entry.date) ?? [];
    list.push(entry);
    map.set(entry.date, list);
  });
  return [...map.entries()].map(([date, rows]) => ({ date, rows }));
}

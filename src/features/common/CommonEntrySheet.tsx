import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { MoneyAmount } from '@/components/ui/MoneyAmount';
import { CATEGORY_BY_ID } from '@/data/categories';
import { ponds } from '@/data/farm';
import { formatDate, formatINRCompact } from '@/lib/format';
import { splitLabel, splitPreview, type Allocation } from '@/services/common';
import type { LedgerEntry } from '@/types';

export function CommonEntrySheet({
  entry,
  allocation,
  onClose,
  onEdit,
  onDelete,
}: {
  entry: LedgerEntry | null;
  allocation: Allocation;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const shares = entry
    ? splitPreview(
        entry.amount,
        ponds.map((pond) => pond.id),
        allocation.rule,
        allocation.manual,
      )
    : [];

  return (
    <BottomSheet open={Boolean(entry)} onClose={onClose} title="Entry">
      {entry ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CategoryIcon category={entry.category} />
            <div className="min-w-0">
              <p className="text-title text-ink">{entry.title}</p>
              <p className="text-caption text-muted">{entry.subtitle}</p>
            </div>
          </div>
          <MoneyAmount amount={entry.amount} signed tone="expense" size="lg" />
          <p className="text-caption font-semibold text-muted">{splitLabel(allocation.rule)}</p>
          <dl className="space-y-2 text-body">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Category</dt>
              <dd className="text-ink">{CATEGORY_BY_ID[entry.category]?.label ?? entry.category}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Date</dt>
              <dd className="text-ink">{formatDate(entry.date)}</dd>
            </div>
          </dl>
          <table className="w-full text-body">
            <thead>
              <tr className="text-left text-caption text-muted">
                <th className="pb-2 font-medium">Pond</th>
                <th className="pb-2 text-right font-medium">%</th>
                <th className="pb-2 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((row) => (
                <tr key={row.pondId} className="border-t border-line">
                  <td className="py-2 text-ink">{row.name}</td>
                  <td className="py-2 text-right tabular-nums text-muted">{row.percent}%</td>
                  <td className="py-2 text-right tabular-nums text-ink">{formatINRCompact(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="secondary" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}

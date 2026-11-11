import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatINRCompact, initials } from '@/lib/format';
import { dueStatus, type PartyDue } from '@/services/dues';

const KIND: Record<string, string> = {
  vendor: 'Vendor',
  worker: 'Worker',
  buyer: 'Buyer',
};

export function PartyDueCard({
  row,
  actionLabel,
  onOpen,
  onPay,
}: {
  row: PartyDue;
  actionLabel: string;
  onOpen: () => void;
  onPay: () => void;
}) {
  const status = dueStatus(row.pending);

  return (
    <article className="relative rounded-card bg-card p-4 shadow-soft">
      <button type="button" onClick={onOpen} className="pressable flex w-full items-start gap-3 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf-200 text-caption font-bold text-forest-800">
          {initials(row.party.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-title text-ink">{row.party.name}</span>
            <span className="rounded-pill bg-tile px-2 py-0.5 text-[10px] font-semibold text-muted">
              {KIND[row.party.kind] ?? row.party.kind}
            </span>
          </span>
          <span className="mt-0.5 block text-caption text-muted">{row.pending.length} pending entries</span>
          <span className={cn('mt-1 block text-caption font-semibold', status.overdue ? 'text-danger' : 'text-muted')}>
            {status.label}
          </span>
        </span>
        <span className="text-title tabular-nums text-ink">{formatINRCompact(row.amount)}</span>
      </button>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onPay}>
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}

import { Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { PondDetailModel } from '@/services/pondDetail';

export function PondDetailRevenue({
  model,
  onAdd,
}: {
  model: PondDetailModel;
  onAdd: () => void;
}) {
  if (model.sales.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No harvest yet"
        description="Record the first sale when you harvest this pond."
        action={<Button onClick={onAdd}>Record harvest sale</Button>}
      />
    );
  }

  return (
    <div className="space-y-3">
      {model.sales.map((sale) => {
        const pending = Math.max(sale.netAmount - sale.receivedAmount, 0);
        return (
          <article key={sale.id} className="rounded-card bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-title text-ink">{sale.buyer}</p>
                <p className="text-caption text-muted">{formatDate(sale.date)}</p>
              </div>
              <span
                className={cn(
                  'rounded-pill px-2.5 py-1 text-[11px] font-semibold',
                  pending > 0 ? 'bg-danger/10 text-danger' : 'bg-leaf-200 text-forest-800',
                )}
              >
                {pending > 0 ? `${formatINRCompact(pending)} pending` : 'Received'}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-caption">
              <Row label="Quantity" value={`${sale.qtyKg} kg`} />
              <Row label="Count / size" value={sale.countSize} />
              <Row label="Rate / kg" value={formatINRCompact(sale.ratePerKg)} />
              <Row label="Net amount" value={formatINRCompact(sale.netAmount)} />
            </dl>
          </article>
        );
      })}
      <div className="flex items-center justify-between rounded-card bg-card px-4 py-3">
        <span className="text-caption text-muted">Total revenue</span>
        <span className="text-title tabular-nums text-leaf-500">{formatINRCompact(model.revenue)}</span>
      </div>
      <Button onClick={onAdd}>+ Add sale</Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}

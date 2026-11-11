import { InsightBanner } from '@/components/ui/InsightBanner';
import { formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { PondDetailModel } from '@/services/pondDetail';

export function PondDetailSummary({ model }: { model: PondDetailModel }) {
  const feedPct = Math.round(model.feedShare);

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-card p-4 shadow-soft">
        <h3 className="text-title text-ink">P&amp;L</h3>
        <Line label="Revenue" value={formatINRCompact(model.revenue)} />
        <Line label="− Direct expenses" value={formatINRCompact(model.spent)} />
        <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
          <span className="text-title text-ink">Net profit</span>
          <span className={cn('text-title tabular-nums', model.netProfit >= 0 ? 'text-leaf-500' : 'text-danger')}>
            {formatINRCompact(model.netProfit)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric
          label="Cost per kg"
          value={model.costPerKg == null ? '—' : formatINRCompact(model.costPerKg)}
        />
        <Metric label="Feed share" value={`${feedPct}%`} />
        <Metric label="Spend / acre" value={formatINRCompact(model.spendPerAcre)} />
        <Metric label="Days in cycle" value={String(model.dayNumber)} />
      </div>

      <div className="overflow-hidden rounded-card bg-card">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-2 text-caption text-muted">
          <span>Category</span>
          <span>Amount</span>
          <span>%</span>
        </div>
        {model.categoryRows.map((row) => (
          <div key={row.key} className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-line px-4 py-3 text-body">
            <span className="text-ink">{row.name}</span>
            <span className="tabular-nums text-ink">{formatINRCompact(row.amount)}</span>
            <span className="w-10 text-right tabular-nums text-muted">{row.percent}%</span>
          </div>
        ))}
      </div>

      <InsightBanner title={`Feed is ${feedPct}% of your spend in this cycle`} />
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-body text-ink">{label}</span>
      <span className="text-body tabular-nums text-ink">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-card px-3 py-3 shadow-soft">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 text-title tabular-nums text-ink">{value}</p>
    </div>
  );
}

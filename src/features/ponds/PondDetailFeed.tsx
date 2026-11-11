import { Button } from '@/components/ui/Button';
import { SpendBarChart } from '@/components/ui/BarChart';
import { formatDate, formatINRCompact } from '@/lib/format';
import type { PondDetailModel } from '@/services/pondDetail';
import type { FeedLog } from '@/types';

export function PondDetailFeed({
  model,
  onAdd,
  onOpen,
}: {
  model: PondDetailModel;
  onAdd: () => void;
  onOpen: (log: FeedLog) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total feed" value={`${Math.round(model.feedKg)} kg`} />
        <StatCard label="Average / day" value={`${model.feedPerDay.toFixed(1)} kg`} />
        <StatCard label="Feed cost" value={formatINRCompact(model.feedCost)} />
      </div>

      <div className="rounded-card bg-card px-2 pb-3 pt-2">
        <p className="px-2 pb-1 text-caption font-semibold text-muted">Last 14 days</p>
        <SpendBarChart
          data={model.feedChart}
          formatValue={(value) => `${value} kg`}
          formatTick={(value) => `${Math.round(value)}`}
        />
      </div>

      <div className="overflow-hidden rounded-card bg-card">
        {model.feedDays.map((log, index) => (
          <button
            key={log.id}
            type="button"
            onClick={() => onOpen(log)}
            className={`flex min-h-touch w-full items-center justify-between gap-3 px-4 py-3 text-left ${
              index < model.feedDays.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <span>
              <span className="block text-body font-medium text-ink">{formatDate(log.date)}</span>
              <span className="text-caption text-muted">{log.meals} meals · {log.kg} kg</span>
            </span>
            <span className="text-caption font-semibold tabular-nums text-ink">{formatINRCompact(log.cost)}</span>
          </button>
        ))}
      </div>

      <Button onClick={onAdd}>Add today’s feed</Button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-card px-2.5 py-3 shadow-soft">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 text-caption font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

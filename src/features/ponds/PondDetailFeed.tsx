import { useMemo, useState } from 'react';
import { eachDayOfInterval, format, startOfWeek, subDays } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { SpendBarChart } from '@/components/ui/BarChart';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { APP_TODAY, formatDate, formatINRCompact, parseISODate, toISODate } from '@/lib/format';
import type { PondDetailModel } from '@/services/pondDetail';
import type { BarPoint, FeedLog } from '@/types';

type FeedRange = 'day' | 'week' | 'custom';

const RANGES: { value: FeedRange; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'custom', label: 'Custom' },
];

function bounds(range: FeedRange, from: string, to: string): { start: Date; end: Date } {
  if (range === 'day') return { start: APP_TODAY, end: APP_TODAY };
  if (range === 'week') return { start: startOfWeek(APP_TODAY, { weekStartsOn: 1 }), end: APP_TODAY };
  const start = parseISODate(from);
  const end = parseISODate(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { start: subDays(APP_TODAY, 13), end: APP_TODAY };
  }
  return start.getTime() <= end.getTime() ? { start, end } : { start: end, end: start };
}

function chartPoints(logs: FeedLog[], start: Date, end: Date): BarPoint[] {
  const days = eachDayOfInterval({ start, end });
  const crossesMonth = start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear();
  return days.map((day) => {
    const key = toISODate(day);
    const kg = logs
      .filter((log) => log.date.slice(0, 10) === key)
      .reduce((sum, log) => sum + (Number(log.kg) || 0), 0);
    const label =
      days.length === 1 ? format(day, 'd MMM') : days.length <= 7 ? format(day, 'EEE') : crossesMonth ? format(day, 'd/M') : format(day, 'd');
    return { label, value: Math.round(kg * 10) / 10 };
  });
}

function rangeCaption(start: Date, end: Date): string {
  if (toISODate(start) === toISODate(end)) return formatDate(start);
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
}

export function PondDetailFeed({
  model,
  onAdd,
  onOpen,
}: {
  model: PondDetailModel;
  onAdd: () => void;
  onOpen: (log: FeedLog) => void;
}) {
  const [range, setRange] = useState<FeedRange>('week');
  const [from, setFrom] = useState(() => toISODate(subDays(APP_TODAY, 13)));
  const [to, setTo] = useState(() => toISODate(APP_TODAY));
  const { start, end } = bounds(range, from, to);
  const chart = useMemo(() => chartPoints(model.feedDays, start, end), [model.feedDays, start, end]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total feed" value={`${Math.round(model.feedKg)} kg`} />
        <StatCard label="Average / day" value={`${model.feedPerDay.toFixed(1)} kg`} />
        <StatCard label="Feed cost" value={formatINRCompact(model.feedCost)} />
      </div>

      <div className="rounded-card bg-card px-3 pb-3 pt-3">
        <SegmentedTabs ariaLabel="Feed chart range" value={range} onChange={setRange} tabs={RANGES} />
        <p className="px-1 pb-1 pt-3 text-caption text-muted">{rangeCaption(start, end)}</p>
        {range === 'custom' ? (
          <div className="grid grid-cols-2 gap-3 pb-2">
            <DateField label="From" value={from} onChange={setFrom} />
            <DateField label="To" value={to} onChange={setTo} />
          </div>
        ) : null}
        <SpendBarChart
          key={`${range}-${toISODate(start)}-${toISODate(end)}`}
          data={chart}
          formatValue={(value) => `${value} kg`}
          formatTick={(value) => `${Math.round(value)}`}
        />
      </div>

      <div className="overflow-hidden rounded-card bg-card">
        {model.feedDays.length === 0 ? (
          <p className="px-4 py-6 text-center text-body text-muted">No feed logged yet</p>
        ) : (
          model.feedDays.map((log, index) => (
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
                <span className="text-caption text-muted">
                  {log.meals} meals · {log.kg} kg
                </span>
              </span>
              <span className="text-caption font-semibold tabular-nums text-ink">{formatINRCompact(log.cost)}</span>
            </button>
          ))
        )}
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

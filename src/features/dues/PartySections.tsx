import { formatINRCompact, formatLongDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { HistoryEvent, PendingItem } from '@/services/dues';

export function PendingList({
  items,
  selected,
  onToggle,
}: {
  items: PendingItem[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-body text-muted">No pending entries</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const on = selected.includes(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className="pressable flex min-h-touch w-full items-center gap-3 rounded-card bg-card px-4 py-3 text-left shadow-soft"
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded border',
                  on ? 'border-forest-800 bg-forest-800 text-white' : 'border-muted',
                )}
              >
                {on ? '✓' : ''}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-title text-ink">{item.title}</span>
                <span className="text-caption text-muted">
                  {formatLongDate(item.date)} · due {formatLongDate(item.dueDate)}
                </span>
              </span>
              <span className="text-title tabular-nums text-ink">{formatINRCompact(item.amount)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function HistoryList({ events }: { events: HistoryEvent[] }) {
  return (
    <ol className="space-y-0 border-l border-line pl-4">
      {events.map((event) => (
        <li key={event.id} className="relative pb-5">
          <span
            className={cn(
              'absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full',
              event.type === 'payment' ? 'bg-leaf-500' : 'bg-ink',
            )}
          />
          <p className="text-caption text-muted">{formatLongDate(event.date)}</p>
          <p className="text-body text-ink">{event.label}</p>
          <p className={cn('text-title tabular-nums', event.type === 'payment' ? 'text-leaf-500' : 'text-ink')}>
            {event.type === 'payment' ? '+ ' : ''}
            {formatINRCompact(event.amount)}
          </p>
          <p className="text-caption text-muted">Balance {formatINRCompact(event.balance)}</p>
        </li>
      ))}
    </ol>
  );
}

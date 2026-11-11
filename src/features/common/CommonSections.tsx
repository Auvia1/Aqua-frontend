import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { IconButton } from '@/components/ui/IconButton';
import { COMMON_FILTERS, type RecurringItem } from '@/data/common';
import { cn } from '@/lib/cn';
import { APP_TODAY, formatDate, formatINRCompact, parseISODate } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import { differenceInCalendarDays } from 'date-fns';
import type { CommonFilter } from '@/types';

export function dueLabel(iso: string): string | null {
  if (!iso) return null;
  const days = differenceInCalendarDays(parseISODate(iso), APP_TODAY);
  if (days < 0 || days > 7) return null;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

export function CategoryCards({
  totals,
  dues,
  filter,
  onFilter,
}: {
  totals: Record<CommonFilter, number>;
  dues: Partial<Record<CommonFilter, string>>;
  filter: CommonFilter | 'all';
  onFilter: (value: CommonFilter | 'all') => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {COMMON_FILTERS.map((item) => {
        const selected = filter === item.id;
        const due = dues[item.id];
        const category = item.category === 'other' ? 'misc' : item.category;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onFilter(selected ? 'all' : item.id)}
            className={cn(
              'pressable rounded-card bg-card p-4 text-left shadow-soft',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30',
              selected && 'ring-2 ring-forest-800',
            )}
          >
            <CategoryIcon category={category} />
            <p className="mt-3 text-title text-ink">{item.label}</p>
            <p className="text-body font-semibold tabular-nums text-ink">{formatINRCompact(totals[item.id])}</p>
            {due ? (
              <span className="mt-2 inline-flex rounded-pill bg-warn/15 px-2 py-0.5 text-[10px] font-semibold text-warn">
                {due}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function RecurringCard({
  items,
  reminders,
  onPaid,
  onToggleRemind,
}: {
  items: RecurringItem[];
  reminders: Record<string, boolean>;
  onPaid: (item: RecurringItem) => void;
  onToggleRemind: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-card bg-card p-4 shadow-soft">
      <h2 className="mb-3 text-title text-ink">Upcoming / Recurring</h2>
      <ul className="space-y-3">
        {items.map((item) => {
          const on = reminders[item.id] ?? true;
          return (
            <li key={item.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink">
                  {item.title} {item.approx ? '~' : ''}
                  {formatINRCompact(item.amount)}
                </p>
                <p className="text-caption text-muted">due {formatDate(item.dueDate)}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onPaid(item)}>
                Mark paid
              </Button>
              <IconButton
                label={on ? 'Turn reminder off' : 'Turn reminder on'}
                tone="ghost"
                onClick={() => onToggleRemind(item.id)}
              >
                {on ? (
                  <Bell size={ICON.size} strokeWidth={ICON.stroke} />
                ) : (
                  <BellOff size={ICON.size} strokeWidth={ICON.stroke} />
                )}
              </IconButton>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

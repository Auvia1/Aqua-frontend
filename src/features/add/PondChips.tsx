import { ponds } from '@/data/farm';
import { cn } from '@/lib/cn';

export function PondChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="listbox" aria-label="Pond">
      {ponds.map((pond) => {
        const enabled = pond.status === 'active';
        const selected = value === pond.id;
        return (
          <button
            key={pond.id}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={!enabled}
            onClick={() => onChange(pond.id)}
            className={cn(
              'pressable flex min-h-touch shrink-0 flex-col items-center justify-center rounded-pill px-4',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35',
              selected ? 'bg-forest-800 text-white' : 'bg-tile text-ink',
              !enabled && 'opacity-40',
            )}
          >
            <span className="text-body font-semibold">{pond.name}</span>
            {enabled ? null : <span className="text-[10px] leading-3 text-muted">No cycle</span>}
          </button>
        );
      })}
    </div>
  );
}

export function PondMultiChips({
  values,
  allSelected,
  onToggle,
  onAll,
}: {
  values: string[];
  allSelected: boolean;
  onToggle: (id: string) => void;
  onAll: () => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        aria-pressed={allSelected}
        onClick={onAll}
        className={cn(
          'pressable flex min-h-touch shrink-0 items-center rounded-pill px-4 text-body font-semibold',
          allSelected ? 'bg-forest-800 text-white' : 'bg-tile text-ink',
        )}
      >
        All ponds (split equally)
      </button>
      {ponds.map((pond) => {
        const enabled = pond.status === 'active';
        const selected = !allSelected && values.includes(pond.id);
        return (
          <button
            key={pond.id}
            type="button"
            disabled={!enabled}
            aria-pressed={selected}
            onClick={() => onToggle(pond.id)}
            className={cn(
              'pressable flex min-h-touch shrink-0 flex-col items-center justify-center rounded-pill px-4',
              selected ? 'bg-forest-800 text-white' : 'bg-tile text-ink',
              !enabled && 'opacity-40',
            )}
          >
            <span className="text-body font-semibold">{pond.name}</span>
            {enabled ? null : <span className="text-[10px] leading-3">No cycle</span>}
          </button>
        );
      })}
    </div>
  );
}

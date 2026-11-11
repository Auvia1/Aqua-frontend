import { cn } from '@/lib/cn';

export interface SegmentTab<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  tabs: readonly SegmentTab<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  scrollable?: boolean;
}

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  scrollable = false,
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex rounded-pill bg-surface p-1', scrollable && 'overflow-x-auto')}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              'pressable min-h-10 rounded-pill py-2.5 font-semibold',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35',
              scrollable ? 'shrink-0 px-4 text-caption' : 'flex-1',
              !scrollable && tabs.length > 3 ? 'px-1.5 text-[11px] leading-4' : !scrollable ? 'px-3 text-caption' : '',
              selected ? 'bg-forest-800 text-white' : 'text-muted',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

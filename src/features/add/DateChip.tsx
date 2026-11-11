import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { APP_TODAY, formatDate, toISODate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import { subDays } from 'date-fns';

export function DateChip({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const today = toISODate();
  const yesterday = toISODate(subDays(APP_TODAY, 1));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable inline-flex min-h-touch items-center gap-1 rounded-pill bg-tile px-4 text-body font-semibold text-ink"
      >
        {formatDate(value)}
        <ChevronDown size={16} strokeWidth={ICON.stroke} />
      </button>
      <input
        ref={picker}
        type="date"
        value={value}
        className="hidden"
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }}
      />
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Date">
        <div className="space-y-1 pb-2">
          {[
            { iso: today, label: 'Today' },
            { iso: yesterday, label: 'Yesterday' },
          ].map((option) => (
            <button
              key={option.iso}
              type="button"
              onClick={() => {
                onChange(option.iso);
                setOpen(false);
              }}
              className={cn(
                'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
                value === option.iso ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            className="pressable flex h-12 w-full items-center rounded-input bg-surface px-4 text-body text-ink"
            onClick={() => {
              setOpen(false);
              window.setTimeout(() => {
                const el = picker.current;
                if (!el) return;
                if (typeof el.showPicker === 'function') el.showPicker();
                else el.click();
              }, 50);
            }}
          >
            Pick date
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

import { useId, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { ICON } from '@/lib/tokens';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function DateField({ label, value, onChange, error, disabled }: DateFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const display = value ? formatDate(value) : 'Pick a date';

  const openPicker = () => {
    const el = inputRef.current;
    if (!el || disabled) return;
    el.focus();
    try {
      el.showPicker();
    } catch {
      el.click();
    }
  };

  return (
    <div className="block">
      <label htmlFor={id} className="mb-2 block text-body font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className={cn(
            'flex h-14 w-full items-center rounded-input bg-surface px-4 text-left',
            error && 'ring-2 ring-danger/70',
            disabled && 'opacity-50',
          )}
        >
          <CalendarDays size={ICON.size} strokeWidth={ICON.stroke} className="mr-3 text-muted" />
          <span className={value ? 'text-ink' : 'text-muted'}>{display}</span>
        </button>
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-label={label}
          onChange={(event) => onChange(event.target.value)}
          onClick={(event) => {
            try {
              event.currentTarget.showPicker();
            } catch {
              /* native picker */
            }
          }}
          className={cn(
            'absolute inset-0 z-10 h-full w-full cursor-pointer bg-transparent text-transparent',
            'disabled:cursor-not-allowed',
            '[&::-webkit-datetime-edit]:opacity-0',
            '[&::-webkit-clear-button]:hidden',
            '[&::-webkit-calendar-picker-indicator]:absolute',
            '[&::-webkit-calendar-picker-indicator]:inset-0',
            '[&::-webkit-calendar-picker-indicator]:h-full',
            '[&::-webkit-calendar-picker-indicator]:w-full',
            '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
            '[&::-webkit-calendar-picker-indicator]:opacity-0',
          )}
        />
      </div>
      {error ? <span className="mt-1.5 block text-caption text-danger">{error}</span> : null}
    </div>
  );
}

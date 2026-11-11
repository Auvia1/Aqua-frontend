import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  disabled,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div>
      <span className="mb-2 block text-body font-medium text-ink">{label}</span>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          'pressable flex h-14 w-full items-center justify-between rounded-input bg-surface px-4 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30',
          error && 'ring-2 ring-danger/70',
          disabled && 'opacity-50',
        )}
      >
        <span className={selected ? 'text-ink' : 'text-muted'}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={ICON.size} strokeWidth={ICON.stroke} className="text-muted" />
      </button>
      {error ? <p className="mt-1.5 text-caption text-danger">{error}</p> : null}

      <BottomSheet open={open} onClose={() => setOpen(false)} title={label}>
        <ul className="flex flex-col gap-1 pb-2" role="listbox">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    'pressable flex h-12 w-full items-center rounded-input px-4 text-left text-body',
                    isActive ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </div>
  );
}

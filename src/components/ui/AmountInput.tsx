import { useId } from 'react';
import { cn } from '@/lib/cn';

interface AmountInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function AmountInput({
  label = 'Amount',
  value,
  onChange,
  error,
  disabled,
  placeholder = '0.00',
}: AmountInputProps) {
  const id = useId();

  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-body font-medium text-ink">{label}</span>
      <span
        className={cn(
          'flex h-14 items-center rounded-input bg-surface px-4 ring-1 ring-transparent',
          'focus-within:ring-2 focus-within:ring-forest-800/30',
          error && 'ring-2 ring-danger/70',
          disabled && 'opacity-50',
        )}
      >
        <span className="mr-2 text-h2 text-forest-800">₹</span>
        <input
          id={id}
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            const next = event.target.value.replace(/[^\d.]/g, '');
            const parts = next.split('.');
            const safe =
              parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : next;
            onChange(safe);
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-h2 text-ink outline-none placeholder:text-muted"
        />
      </span>
      {error ? <span className="mt-1.5 block text-caption text-danger">{error}</span> : null}
    </label>
  );
}

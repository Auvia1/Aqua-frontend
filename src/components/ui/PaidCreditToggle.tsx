import { cn } from '@/lib/cn';
import type { PaymentStatus } from '@/types';

interface PaidCreditToggleProps {
  value: PaymentStatus;
  onChange: (value: PaymentStatus) => void;
}

const OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'credit', label: 'Credit' },
];

export function PaidCreditToggle({ value, onChange }: PaidCreditToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Payment type">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'pressable h-12 rounded-pill text-title',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35',
              selected ? 'bg-forest-800 text-white' : 'bg-tile text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

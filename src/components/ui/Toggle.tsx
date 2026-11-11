import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-pill transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35',
        checked ? 'bg-forest-800' : 'bg-line',
        disabled && 'opacity-40',
      )}
    >
      <span
        className={cn(
          'inline-block h-6 w-6 rounded-full bg-white shadow-soft transition-transform duration-200 ease-out',
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      />
    </button>
  );
}

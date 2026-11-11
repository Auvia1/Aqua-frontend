import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

export function Chip({ selected = false, className, children, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'pressable inline-flex min-h-touch items-center justify-center rounded-pill px-4 text-body font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35',
        'disabled:pointer-events-none disabled:opacity-40',
        selected ? 'bg-forest-800 text-white' : 'bg-tile text-ink',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

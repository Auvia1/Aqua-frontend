import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  tone?: 'light' | 'dark' | 'ghost';
}

export function IconButton({
  label,
  children,
  className,
  tone = 'light',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'pressable inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
        tone === 'light' && 'bg-card text-ink shadow-soft',
        tone === 'dark' && 'bg-white/10 text-white hover:bg-white/16',
        tone === 'ghost' && 'bg-transparent text-ink',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

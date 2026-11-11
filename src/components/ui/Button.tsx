import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { t } from '@/i18n';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-forest-800 text-white hover:bg-forest-700',
  secondary: 'bg-tile text-ink hover:bg-line',
  ghost: 'bg-transparent text-forest-800 hover:bg-tile',
  destructive: 'bg-danger text-white hover:opacity-90',
  outline: 'border border-forest-800 bg-transparent text-forest-800 hover:bg-tile',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'pressable inline-flex items-center justify-center rounded-pill',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-12 min-h-touch w-auto px-4 text-body font-semibold' : 'h-14 w-full px-5 text-title',
        VARIANT[variant],
        className,
      )}
      {...props}
    >
      {loading ? t('pleaseWait') : children}
    </button>
  );
}

import { cn } from '@/lib/cn';
import { formatINR, splitINR } from '@/lib/format';

type MoneyTone = 'neutral' | 'expense' | 'revenue' | 'onDark';
type MoneySize = 'sm' | 'md' | 'lg';

interface MoneyAmountProps {
  amount: number;
  hidden?: boolean;
  signed?: boolean;
  withPaise?: boolean;
  tone?: MoneyTone;
  size?: MoneySize;
  className?: string;
}

const SIZE: Record<MoneySize, string> = {
  sm: 'text-body font-semibold',
  md: 'text-title',
  lg: 'hero-money',
};

const TONE: Record<MoneyTone, string> = {
  neutral: 'text-ink',
  expense: 'text-ink',
  revenue: 'text-leaf-500',
  onDark: 'text-white',
};

export function MoneyAmount({
  amount,
  hidden = false,
  signed = false,
  withPaise = true,
  tone = 'neutral',
  size = 'md',
  className,
}: MoneyAmountProps) {
  const { rupees, paise } = splitINR(amount);
  const prefix = signed ? (tone === 'revenue' ? '+ ' : '− ') : amount < 0 ? '−' : '';

  if (hidden) {
    return (
      <span className={cn(SIZE[size], TONE[tone], 'tracking-[0.18em]', className)} aria-label="Hidden amount">
        ••••
      </span>
    );
  }

  if (!withPaise) {
    return (
      <span className={cn('tabular-nums', SIZE[size], TONE[tone], className)}>
        {prefix}
        {formatINR(amount, { withPaise: false })}
      </span>
    );
  }

  return (
    <span className={cn('tabular-nums', SIZE[size], TONE[tone], className)}>
      {prefix}₹{rupees}
      <span className="text-[0.6em] opacity-80">.{paise}</span>
    </span>
  );
}

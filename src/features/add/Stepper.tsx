import { Minus, Plus } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { ICON } from '@/lib/tokens';

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
  onValueClick,
  valueLabel = 'Edit amount',
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
  onValueClick?: () => void;
  valueLabel?: string;
}) {
  const round = (n: number) => Math.round(n * 10) / 10;
  const figure = (
    <>
      {value}
      {suffix ? <span className="ml-0.5 text-caption font-medium text-muted">{suffix}</span> : null}
    </>
  );

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconButton
        label="Decrease"
        tone="ghost"
        className="h-10 w-10"
        disabled={value <= min}
        onClick={() => onChange(round(Math.max(min, value - step)))}
      >
        <Minus size={18} strokeWidth={ICON.stroke} />
      </IconButton>
      {onValueClick ? (
        <button
          type="button"
          aria-label={valueLabel}
          onClick={onValueClick}
          className="pressable flex h-12 min-w-16 items-center justify-center rounded-input bg-surface px-2 text-body font-semibold tabular-nums text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30"
        >
          {figure}
        </button>
      ) : (
        <span className="min-w-10 text-center text-body font-semibold tabular-nums">{figure}</span>
      )}
      <IconButton
        label="Increase"
        tone="ghost"
        className="h-10 w-10"
        onClick={() => onChange(round(value + step))}
      >
        <Plus size={18} strokeWidth={ICON.stroke} />
      </IconButton>
    </div>
  );
}

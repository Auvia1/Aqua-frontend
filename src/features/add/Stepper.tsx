import { Minus, Plus } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { ICON } from '@/lib/tokens';

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  const round = (n: number) => Math.round(n * 10) / 10;

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
      <span className="min-w-10 text-center text-body font-semibold tabular-nums">
        {value}
        {suffix ? <span className="ml-0.5 text-caption font-medium text-muted">{suffix}</span> : null}
      </span>
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

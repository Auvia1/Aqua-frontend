import { Eye, EyeOff, Leaf } from 'lucide-react';
import { MoneyAmount } from '@/components/ui/MoneyAmount';
import { cn } from '@/lib/cn';
import { formatINRCompact } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import type { PondDetailModel } from '@/services/pondDetail';

export function PondDetailHero({
  model,
  hidden,
  onToggleHidden,
}: {
  model: PondDetailModel;
  hidden: boolean;
  onToggleHidden: () => void;
}) {
  const negative = model.netProfit < 0;
  const up = model.changePercent >= 0 && !negative;
  const costLabel = model.costPerKg == null ? '—' : hidden ? '••••' : formatINRCompact(model.costPerKg);

  return (
    <section className="relative overflow-hidden rounded-hero bg-forest-800 p-5 text-white shadow-soft">
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/5" />
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Leaf size={16} strokeWidth={ICON.stroke} />
        </span>
        <p className="text-caption text-white/80">Cycle profit so far</p>
        <button
          type="button"
          aria-label={hidden ? 'Show amounts' : 'Hide amounts'}
          onClick={onToggleHidden}
          className="pressable flex h-8 w-8 items-center justify-center rounded-full text-white/80"
        >
          {hidden ? <EyeOff size={16} strokeWidth={ICON.stroke} /> : <Eye size={16} strokeWidth={ICON.stroke} />}
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <MoneyAmount
          amount={model.netProfit}
          hidden={hidden}
          tone="onDark"
          size="lg"
          className={negative ? 'text-[#F4C9C6]' : undefined}
        />
        <div className="shrink-0 pb-1 text-right">
          <span
            className={cn(
              'inline-flex rounded-pill px-2.5 py-1 text-caption font-medium',
              up ? 'bg-white/10 text-lime-300' : 'bg-white/10 text-[#F4C9C6]',
            )}
          >
            {up ? '▲' : '▼'} {Math.abs(model.changePercent).toFixed(1)}%
          </span>
          <p className="mt-1 text-[11px] leading-4 text-white/65">vs last cycle</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-pill bg-white/10 px-2.5 py-1 text-[11px] font-medium text-lime-300">
          {model.cycle.species}
        </span>
        <p className="text-caption text-white/80">Day {model.dayNumber}</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
        <HeroStat label="Spent" value={hidden ? '••••' : formatINRCompact(model.spent)} />
        <HeroStat label="Revenue" value={hidden ? '••••' : formatINRCompact(model.revenue)} />
        <div>
          <p className="text-caption text-white/60">Cost per kg</p>
          <p className="mt-0.5 text-caption font-semibold tabular-nums">{costLabel}</p>
          {model.costPerKgEstimated ? <p className="text-[10px] text-white/55">Est.</p> : null}
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-white/60">{label}</p>
      <p className="mt-0.5 text-caption font-semibold tabular-nums">{value}</p>
    </div>
  );
}

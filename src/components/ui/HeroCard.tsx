import { BarChart3, Eye, EyeOff, Leaf, type LucideIcon } from 'lucide-react';
import { MoneyAmount } from '@/components/ui/MoneyAmount';
import { useT } from '@/hooks/useT';
import { cn } from '@/lib/cn';
import { formatINRCompact } from '@/lib/format';
import { ICON } from '@/lib/tokens';

interface HeroCardProps {
  label: string;
  amount: number;
  changePercent: number;
  periodLabel?: string;
  spent?: number;
  revenue?: number;
  hidden: boolean;
  onToggleHidden: () => void;
  onChartClick?: () => void;
  hideChart?: boolean;
  icon?: LucideIcon;
  stats?: { label: string; value: string }[];
}

export function HeroCard({
  label,
  amount,
  changePercent,
  periodLabel,
  spent,
  revenue,
  hidden,
  onToggleHidden,
  onChartClick,
  hideChart = false,
  icon: Icon = Leaf,
  stats,
}: HeroCardProps) {
  const { t } = useT();
  const negative = amount < 0;
  const up = changePercent >= 0 && !negative;
  const vsLabel = periodLabel ?? t('vsLastPeriod');

  return (
    <section className="relative overflow-hidden rounded-hero bg-forest-800 p-5 text-white shadow-soft">
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/5" />
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Icon size={16} strokeWidth={ICON.stroke} />
          </span>
          <p className="text-caption text-white/80">{label}</p>
          <button
            type="button"
            aria-label={hidden ? t('showAmounts') : t('hideAmounts')}
            onClick={onToggleHidden}
            className="pressable flex h-8 w-8 items-center justify-center rounded-full text-white/80"
          >
            {hidden ? (
              <EyeOff size={16} strokeWidth={ICON.stroke} />
            ) : (
              <Eye size={16} strokeWidth={ICON.stroke} />
            )}
          </button>
        </div>
        {hideChart ? (
          <span />
        ) : (
          <button
            type="button"
            aria-label={t('openReports')}
            onClick={onChartClick}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full text-lime-300"
          >
            <BarChart3 size={ICON.size} strokeWidth={ICON.stroke} />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <MoneyAmount
          amount={amount}
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
            {up ? '▲' : '▼'} {Math.abs(changePercent).toFixed(1)}%
          </span>
          <p className="mt-1 whitespace-nowrap text-[11px] leading-4 text-white/65">{vsLabel}</p>
        </div>
      </div>

      {stats && stats.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          {stats.map((item) => (
            <div key={item.label}>
              <p className="text-caption text-white/60">{item.label}</p>
              <p className="mt-0.5 text-caption font-semibold tabular-nums">
                {hidden ? '••••' : item.value}
              </p>
            </div>
          ))}
        </div>
      ) : spent != null && revenue != null ? (
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-caption text-white/60">{t('spent')}</p>
            <p className="mt-0.5 text-title tabular-nums">
              {hidden ? '••••' : formatINRCompact(spent)}
            </p>
          </div>
          <div>
            <p className="text-caption text-white/60">{t('revenue')}</p>
            <p className="mt-0.5 text-title tabular-nums">
              {hidden ? '••••' : formatINRCompact(revenue)}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

import { ChevronRight, Leaf, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';

interface InsightBannerProps {
  text?: string;
  title?: string;
  caption?: string;
  icon?: LucideIcon;
  tone?: 'lime' | 'warn';
  onClick?: () => void;
  actionLabel?: string;
}

export function InsightBanner({
  text,
  title,
  caption,
  icon: Icon = Leaf,
  tone = 'lime',
  onClick,
  actionLabel,
}: InsightBannerProps) {
  const heading = title ?? text ?? '';

  const inner = (
    <>
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          tone === 'warn' ? 'bg-white/70 text-warn' : 'bg-white/70 text-leaf-500',
        )}
      >
        <Icon size={18} strokeWidth={ICON.stroke} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={cn('block text-body text-ink', caption ? 'font-semibold' : undefined)}>
          {heading}
        </span>
        {caption ? <span className="mt-0.5 block text-caption text-muted">{caption}</span> : null}
      </span>
      {actionLabel ? (
        <span className="shrink-0 text-body font-semibold text-forest-800">{actionLabel}</span>
      ) : onClick ? (
        <ChevronRight size={ICON.size} strokeWidth={ICON.stroke} className="shrink-0 text-muted" />
      ) : null}
    </>
  );

  const box = cn(
    'flex w-full items-start gap-3 rounded-card px-4 py-3.5',
    tone === 'warn' ? 'bg-warn/15' : 'bg-lime-100',
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'pressable',
          box,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30',
        )}
      >
        {inner}
      </button>
    );
  }

  return <div className={box}>{inner}</div>;
}

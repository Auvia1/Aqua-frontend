import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-caption font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="overflow-hidden rounded-card bg-card shadow-soft">{children}</div>
    </section>
  );
}

export function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
  disabled,
  last,
  trailing,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
  last?: boolean;
  trailing?: ReactNode;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tile text-forest-800">
        <Icon size={18} strokeWidth={ICON.stroke} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-title text-ink">{label}</span>
        {value ? <span className="block text-caption text-muted">{value}</span> : null}
      </span>
      {trailing ?? (onClick && !disabled ? <ChevronRight size={ICON.size} strokeWidth={ICON.stroke} className="text-muted" /> : null)}
    </>
  );

  if (onClick && !disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'pressable flex min-h-touch w-full items-center gap-3 px-4 py-3',
          !last && 'border-b border-line',
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={cn('flex min-h-touch items-center gap-3 px-4 py-3', !last && 'border-b border-line', disabled && 'opacity-70')}>
      {inner}
    </div>
  );
}

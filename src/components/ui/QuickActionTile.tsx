import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';

interface QuickActionTileProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function QuickActionTile({ icon: Icon, label, onClick }: QuickActionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'pressable flex min-h-touch flex-col items-center gap-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30',
      )}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-tile bg-tile text-forest-800">
        <Icon size={ICON.tile} strokeWidth={ICON.stroke} />
      </span>
      <span className="max-w-[84px] text-center text-[12px] leading-4 text-ink">{label}</span>
    </button>
  );
}

import { Delete } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'back'] as const;

interface NumpadProps {
  onKey: (key: string) => void;
  onBackspace: () => void;
  compact?: boolean;
}

export function Numpad({ onKey, onBackspace, compact = false }: NumpadProps) {
  return (
    <div className={cn('grid grid-cols-3', compact ? 'gap-1.5' : 'gap-2')} role="group" aria-label="Number pad">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          aria-label={key === 'back' ? 'Backspace' : key}
          className={cn(
            'pressable flex items-center justify-center rounded-tile bg-surface text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30',
            compact ? 'h-12 text-title font-semibold' : 'h-14 text-h2',
          )}
          onClick={() => (key === 'back' ? onBackspace() : onKey(key))}
        >
          {key === 'back' ? <Delete size={ICON.size} strokeWidth={ICON.stroke} /> : key}
        </button>
      ))}
    </div>
  );
}

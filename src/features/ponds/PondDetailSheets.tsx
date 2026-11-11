import { Lock } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCycleRange, formatINRCompact } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import type { CropCycle, Pond } from '@/types';

export function PondDetailMenuSheet({
  pond,
  idle,
  open,
  onClose,
  onEdit,
  onCycle,
  onHistory,
  onArchive,
}: {
  pond: Pond;
  idle: boolean;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCycle: () => void;
  onHistory: () => void;
  onArchive: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={pond.name}>
      <div className="space-y-1 pb-2">
        <MenuRow label="Edit pond" onClick={onEdit} />
        <MenuRow label={idle ? 'Start cycle' : 'Close cycle'} onClick={onCycle} />
        <MenuRow label="Cycle history" onClick={onHistory} />
        <MenuRow label="Archive pond" danger onClick={onArchive} />
      </div>
    </BottomSheet>
  );
}

function MenuRow({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
        danger ? 'bg-danger/10 text-danger' : 'bg-surface text-ink',
      )}
    >
      {label}
    </button>
  );
}

export function CyclePickerSheet({
  open,
  cycles,
  selectedId,
  activeProfit,
  onClose,
  onSelect,
}: {
  open: boolean;
  cycles: CropCycle[];
  selectedId: string;
  activeProfit?: number;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Cycles">
      <div className="space-y-2 pb-2">
        {cycles.map((cycle) => {
          const selected = cycle.id === selectedId;
          return (
            <button
              key={cycle.id}
              type="button"
              onClick={() => {
                onSelect(cycle.id);
                onClose();
              }}
              className={cn(
                'pressable w-full rounded-input px-4 py-3 text-left',
                selected ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-title">Cycle {cycle.number}</span>
                <span className="flex items-center gap-1 text-caption">
                  {cycle.status === 'closed' ? <Lock size={14} strokeWidth={ICON.stroke} /> : null}
                  {cycle.status === 'active' ? 'Active' : 'Closed'}
                </span>
              </span>
              <span className={cn('mt-1 block text-caption', selected ? 'text-white/70' : 'text-muted')}>
                {formatCycleRange(cycle.startDate, cycle.endDate)}
              </span>
              {(() => {
                const profit = cycle.status === 'active' ? activeProfit : cycle.recordedProfit;
                if (profit == null) return null;
                return (
                  <span className={cn('mt-1 block text-caption font-semibold', selected ? 'text-lime-300' : 'text-leaf-500')}>
                    Profit {formatINRCompact(profit)}
                  </span>
                );
              })()}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export function CloseConfirmSheet({
  open,
  pondName,
  cycleNumber,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pondName: string;
  cycleNumber: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Close cycle">
      <p className="text-body text-ink">
        Close Cycle {cycleNumber} for {pondName}? You can still view it later, but you cannot add entries.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Close cycle</Button>
      </div>
    </BottomSheet>
  );
}

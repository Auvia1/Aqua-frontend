import { Trash2 } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { LOT_SIZES } from '@/data/common';
import { ponds } from '@/data/farm';
import { cn } from '@/lib/cn';
import { formatINRCompact } from '@/lib/format';
import { ICON } from '@/lib/tokens';

export interface LotRow {
  size: string;
  qty: string;
  rate: string;
}

export const EMPTY_LOT: LotRow = { size: '40', qty: '', rate: '' };

export function lotTotal(lot: LotRow): number {
  return Math.round((Number(lot.qty) || 0) * (Number(lot.rate) || 0));
}

export function SalePondChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const active = ponds.filter((pond) => pond.status === 'active');

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="listbox" aria-label="Pond">
      {active.map((pond) => {
        const selected = value === pond.id;
        return (
          <button
            key={pond.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(pond.id)}
            className={cn(
              'pressable flex min-h-touch shrink-0 flex-col items-start justify-center rounded-pill px-4 py-2',
              selected ? 'bg-forest-800 text-white' : 'bg-tile text-ink',
            )}
          >
            <span className="text-body font-semibold">{pond.name}</span>
            <span className={cn('text-[10px] leading-3', selected ? 'text-white/70' : 'text-muted')}>
              Cycle {pond.cycleNumber} · Day {pond.cycleDay}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function LotsCard({
  lots,
  onChange,
}: {
  lots: LotRow[];
  onChange: (lots: LotRow[]) => void;
}) {
  const patch = (index: number, next: Partial<LotRow>) => {
    onChange(lots.map((lot, i) => (i === index ? { ...lot, ...next } : lot)));
  };

  return (
    <section className="space-y-4 rounded-card bg-card p-4 shadow-soft">
      <h2 className="text-title text-ink">Lots</h2>
      {lots.map((lot, index) => (
        <div key={index} className="space-y-3 border-t border-line pt-3 first:border-0 first:pt-0">
          <div className="flex items-center justify-between">
            <p className="text-caption font-semibold text-muted">Lot {index + 1}</p>
            <IconButton
              label="Remove lot"
              tone="ghost"
              className="h-10 w-10"
              disabled={lots.length <= 1}
              onClick={() => onChange(lots.filter((_, i) => i !== index))}
            >
              <Trash2 size={18} strokeWidth={ICON.stroke} />
            </IconButton>
          </div>
          <SelectField
            label="Count / size"
            value={lot.size}
            options={LOT_SIZES}
            onChange={(size) => patch(index, { size })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Quantity"
              inputMode="decimal"
              suffix={<span className="text-muted">kg</span>}
              value={lot.qty}
              onChange={(event) => patch(index, { qty: event.target.value.replace(/[^\d.]/g, '') })}
            />
            <TextField
              label="Rate"
              inputMode="decimal"
              prefix={<span className="text-muted">₹</span>}
              suffix={<span className="text-muted">/kg</span>}
              value={lot.rate}
              onChange={(event) => patch(index, { rate: event.target.value.replace(/[^\d.]/g, '') })}
            />
          </div>
          <p className="text-right text-title text-ink">{formatINRCompact(lotTotal(lot))}</p>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...lots, { ...EMPTY_LOT }])}
        className="pressable flex min-h-touch w-full items-center justify-center text-body font-semibold text-forest-800"
      >
        + Add another lot
      </button>
    </section>
  );
}

export function BuyerSheet({
  open,
  name,
  phone,
  place,
  error,
  onClose,
  onName,
  onPhone,
  onPlace,
  onSave,
}: {
  open: boolean;
  name: string;
  phone: string;
  place: string;
  error: string;
  onClose: () => void;
  onName: (value: string) => void;
  onPhone: (value: string) => void;
  onPlace: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Add buyer">
      <div className="space-y-3 pb-2">
        <TextField label="Name" value={name} error={error && !name.trim() ? error : undefined} onChange={(e) => onName(e.target.value)} />
        <TextField
          label="Phone"
          inputMode="tel"
          value={phone}
          error={error && name.trim() ? error : undefined}
          onChange={(e) => onPhone(e.target.value)}
        />
        <TextField label="Place" value={place} onChange={(e) => onPlace(e.target.value)} />
        <Button onClick={onSave}>Save buyer</Button>
      </div>
    </BottomSheet>
  );
}

export function FinalHarvestSheet({
  open,
  onClose,
  onYes,
  onNo,
}: {
  open: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Is this the final harvest?">
      <p className="mb-4 text-body text-muted">
        Closing a cycle records the harvest and locks this pond until you start a new one.
      </p>
      <div className="space-y-2 pb-2">
        <Button onClick={onYes}>Yes, close cycle</Button>
        <Button variant="secondary" onClick={onNo}>
          No, more to come
        </Button>
      </div>
    </BottomSheet>
  );
}

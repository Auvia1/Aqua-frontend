import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Toggle';
import { Stepper } from '@/features/add/Stepper';
import { ToggleRow } from '@/features/ponds/FormSection';
import { cn } from '@/lib/cn';
import { formatINRCompact, initials, isValidIndianMobile } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import type { LabourType, WorkBasis, WorkerProfile } from '@/types';

const BASIS: { value: WorkBasis; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'hours', label: 'Hours' },
  { value: 'piece', label: 'Piece' },
];

export interface WorkerDraft {
  qty: number;
  rate: number;
  basis: WorkBasis;
  adjust: boolean;
  open: boolean;
}

export function workerTotal(draft: WorkerDraft): number {
  return Math.round(draft.qty * draft.rate);
}

export function WorkerChips({
  workers,
  selected,
  onToggle,
  onNew,
}: {
  workers: WorkerProfile[];
  selected: string[];
  onToggle: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {workers.map((worker) => {
        const active = selected.includes(worker.id);
        return (
          <button
            key={worker.id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(worker.id)}
            className={cn(
              'pressable flex min-h-touch shrink-0 items-center gap-2 rounded-pill px-3',
              active ? 'bg-forest-800 text-white' : 'bg-tile text-ink',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-caption font-bold',
                active ? 'bg-white/15' : 'bg-leaf-200 text-forest-800',
              )}
            >
              {initials(worker.name)}
            </span>
            <span className="text-body font-semibold">{worker.name}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onNew}
        className="pressable flex min-h-touch shrink-0 items-center rounded-pill bg-tile px-4 text-body font-semibold text-forest-800"
      >
        + New
      </button>
    </div>
  );
}

export function WorkerCard({
  worker,
  type,
  draft,
  onChange,
}: {
  worker: WorkerProfile;
  type: LabourType;
  draft: WorkerDraft;
  onChange: (next: Partial<WorkerDraft>) => void;
}) {
  const step = draft.basis === 'hours' ? 0.5 : 1;
  const suffix = draft.basis === 'hours' ? 'hrs' : draft.basis === 'piece' ? 'pcs' : 'days';

  return (
    <article className="rounded-card bg-card shadow-soft">
      <button
        type="button"
        onClick={() => onChange({ open: !draft.open })}
        className="pressable flex min-h-touch w-full items-center justify-between px-4 py-3"
      >
        <span className="text-title text-ink">{worker.name}</span>
        <span className="flex items-center gap-2">
          <span className="text-body font-semibold text-ink">{formatINRCompact(workerTotal(draft))}</span>
          <ChevronDown
            size={ICON.size}
            strokeWidth={ICON.stroke}
            className={cn('text-muted transition-transform', draft.open && 'rotate-180')}
          />
        </span>
      </button>
      {draft.open ? (
        <div className="space-y-3 border-t border-line px-4 pb-4 pt-3">
          {type === 'wage' ? (
            <>
              <div className="flex flex-wrap gap-2">
                {BASIS.map((option) => (
                  <Chip
                    key={option.value}
                    selected={draft.basis === option.value}
                    onClick={() => onChange({ basis: option.value })}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-ink">Quantity</span>
                <Stepper value={draft.qty} step={step} suffix={suffix} onChange={(qty) => onChange({ qty })} />
              </div>
            </>
          ) : null}
          <TextField
            label={type === 'wage' ? 'Rate' : type === 'advance' ? 'Advance' : 'Bonus'}
            inputMode="decimal"
            prefix={<span className="text-muted">₹</span>}
            value={String(draft.rate || '')}
            onChange={(event) => onChange({ rate: Number(event.target.value.replace(/[^\d.]/g, '')) || 0 })}
          />
          <p className="text-right text-title text-ink">{formatINRCompact(workerTotal(draft))}</p>
          {worker.advanceOutstanding > 0 && type === 'wage' ? (
            <>
              <p className="text-caption text-muted">
                Advance outstanding {formatINRCompact(worker.advanceOutstanding)}
              </p>
              <ToggleRow
                label="Adjust against advance"
                control={
                  <Toggle
                    label="Adjust against advance"
                    checked={draft.adjust}
                    onChange={(adjust) => onChange({ adjust })}
                  />
                }
              />
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function NewWorkerSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (worker: WorkerProfile) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [wage, setWage] = useState('600');
  const [error, setError] = useState('');

  const save = () => {
    if (!name.trim()) {
      setError('Enter a name');
      return;
    }
    if (phone && !isValidIndianMobile(phone)) {
      setError('Enter a valid mobile');
      return;
    }
    onSave({
      id: `worker-${Date.now()}`,
      name: name.trim(),
      phone,
      role: role.trim() || 'Worker',
      dailyWage: Number(wage) || 0,
      advanceOutstanding: 0,
    });
    setName('');
    setPhone('');
    setRole('');
    setWage('600');
    setError('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="New worker">
      <div className="space-y-3 pb-2">
        <TextField label="Name" value={name} error={error && !name.trim() ? error : undefined} onChange={(e) => setName(e.target.value)} />
        <TextField
          label="Phone"
          inputMode="tel"
          value={phone}
          error={error && name.trim() ? error : undefined}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        <TextField
          label="Default daily wage"
          inputMode="decimal"
          prefix={<span className="text-muted">₹</span>}
          value={wage}
          onChange={(e) => setWage(e.target.value.replace(/[^\d.]/g, ''))}
        />
        <Button onClick={save}>Save worker</Button>
      </div>
    </BottomSheet>
  );
}

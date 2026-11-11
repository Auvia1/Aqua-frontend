import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { cn } from '@/lib/cn';
import type { Pond, PondSort } from '@/types';

export function SortSheet({
  open,
  value,
  onClose,
  onChange,
}: {
  open: boolean;
  value: PondSort;
  onClose: () => void;
  onChange: (value: PondSort) => void;
}) {
  const options: { value: PondSort; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'spend', label: 'Highest spend' },
    { value: 'cycle', label: 'Cycle day' },
  ];

  return (
    <BottomSheet open={open} onClose={onClose} title="Sort ponds">
      <div role="radiogroup" aria-label="Sort ponds" className="space-y-1 pb-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                'pressable flex h-12 w-full items-center justify-between rounded-input px-4 text-body',
                selected ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
              )}
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
            >
              {option.label}
              <span
                className={cn(
                  'h-4 w-4 rounded-full border',
                  selected ? 'border-white bg-white' : 'border-muted',
                )}
              />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export function PondActionSheet({
  pond,
  onClose,
  onEdit,
  onCycle,
  onExpense,
  onArchive,
}: {
  pond: Pond | null;
  onClose: () => void;
  onEdit: () => void;
  onCycle: () => void;
  onExpense: () => void;
  onArchive: () => void;
}) {
  const inactive = pond != null && pond.status !== 'active';

  return (
    <BottomSheet open={Boolean(pond)} onClose={onClose} title={pond?.name ?? 'Pond'}>
      <div className="space-y-1 pb-2">
        <SheetRow label="Edit pond" onClick={onEdit} />
        <SheetRow label={inactive ? 'Start cycle' : 'Close cycle'} onClick={onCycle} />
        <SheetRow label="Add expense" onClick={onExpense} />
        <SheetRow label="Archive pond" danger onClick={onArchive} />
      </div>
    </BottomSheet>
  );
}

function SheetRow({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
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

export function ArchivePondSheet({
  open,
  pondName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pondName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Archive pond">
      <p className="text-body text-ink">Archive {pondName}? Entries are kept.</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Archive
        </Button>
      </div>
    </BottomSheet>
  );
}

export function DiscardSheet({
  open,
  title = 'Discard changes?',
  message = 'Your edits will be lost.',
  onKeep,
  onDiscard,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onKeep} title={title}>
      <p className="text-body text-muted">{message}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onKeep}>
          Keep editing
        </Button>
        <Button variant="destructive" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </BottomSheet>
  );
}

export function AddVendorSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        setName('');
        setError('');
        onClose();
      }}
      title="Add vendor"
    >
      <TextField
        label="Vendor name"
        placeholder="e.g. Gopal Feeds"
        value={name}
        error={error}
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError('');
        }}
      />
      <Button
        className="mt-4"
        onClick={() => {
          if (!name.trim()) {
            setError('This field is required');
            return;
          }
          onAdd(name.trim());
          setName('');
          setError('');
        }}
      >
        Add
      </Button>
    </BottomSheet>
  );
}

export function AddHatcherySheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        setName('');
        setError('');
        onClose();
      }}
      title="Add hatchery"
    >
      <TextField
        label="Hatchery name"
        placeholder="e.g. Krishna Seed"
        value={name}
        error={error}
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError('');
        }}
      />
      <Button
        className="mt-4"
        onClick={() => {
          if (!name.trim()) {
            setError('This field is required');
            return;
          }
          onAdd(name.trim());
          setName('');
          setError('');
        }}
      >
        Add
      </Button>
    </BottomSheet>
  );
}

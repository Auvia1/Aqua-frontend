import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { CATEGORY_ICONS } from '@/components/ui/CategoryIcon';
import { Chip } from '@/components/ui/Chip';
import { SelectField } from '@/components/ui/SelectField';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import {
  EXPENSE_CATEGORIES,
  ITEM_SUGGESTIONS,
  MEDICINE_TYPES,
  QTY_UNITS,
  VEHICLE_TYPES,
} from '@/data/addCatalog';
import { PhotoTile } from '@/features/add/PhotoTile';
import { PaymentChips } from '@/features/add/PaymentChips';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import { isValidIndianMobile } from '@/lib/format';
import type { CategoryId, PaymentMode, PaymentStatus } from '@/types';

export interface ExpenseMore {
  item: string;
  qty: string;
  unit: string;
  rate: string;
  partyId: string;
  mode: PaymentMode;
  photoUrl: string;
  note: string;
  medType: string;
  dose: string;
  from: string;
  to: string;
  vehicle: string;
}

export const EMPTY_MORE: ExpenseMore = {
  item: '',
  qty: '',
  unit: 'bag',
  rate: '',
  partyId: '',
  mode: 'cash',
  photoUrl: '',
  note: '',
  medType: '',
  dose: '',
  from: '',
  to: '',
  vehicle: '',
};

export function CategoryGrid({
  value,
  customLabel,
  onSelect,
  onCustom,
}: {
  value: CategoryId | null;
  customLabel: string;
  onSelect: (id: CategoryId) => void;
  onCustom: () => void;
}) {
  return (
    <div>
      <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Category</p>
      <div className="flex flex-wrap gap-2">
        {EXPENSE_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          const selected = value === cat.id && !customLabel;
          return (
            <Chip key={cat.id} selected={selected} onClick={() => onSelect(cat.id)} className="gap-1.5 px-3">
              <Icon size={16} strokeWidth={ICON.stroke} />
              {cat.label}
            </Chip>
          );
        })}
        <Chip selected={Boolean(customLabel)} onClick={onCustom} className="px-3">
          + Custom
        </Chip>
      </div>
    </div>
  );
}

export function ExpenseDetails({
  open,
  onToggle,
  category,
  payment,
  values,
  parties,
  onChange,
  onPhoto,
  onAddParty,
}: {
  open: boolean;
  onToggle: () => void;
  category: CategoryId | null;
  payment: PaymentStatus;
  values: ExpenseMore;
  parties: { value: string; label: string }[];
  onChange: (patch: Partial<ExpenseMore>) => void;
  onPhoto: (file: File | null) => void;
  onAddParty: (name: string, phone: string) => void;
}) {
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyError, setPartyError] = useState('');
  const suggestions = category ? (ITEM_SUGGESTIONS[category] ?? []) : [];

  const saveParty = () => {
    if (!partyName.trim()) {
      setPartyError('Enter a name');
      return;
    }
    if (partyPhone && !isValidIndianMobile(partyPhone)) {
      setPartyError('Enter a valid mobile');
      return;
    }
    onAddParty(partyName.trim(), partyPhone);
    setPartyOpen(false);
    setPartyName('');
    setPartyPhone('');
    setPartyError('');
  };

  return (
    <div className="rounded-card bg-card shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        className="pressable flex min-h-touch w-full items-center justify-between px-4 py-3"
      >
        <span className="text-title text-ink">More details</span>
        <ChevronDown
          size={ICON.size}
          strokeWidth={ICON.stroke}
          className={cn('text-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-line px-4 pb-4 pt-3">
          <TextField
            label="Item name"
            value={values.item}
            onChange={(event) => onChange({ item: event.target.value })}
            placeholder="Optional"
          />
          {suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <Chip key={item} selected={values.item === item} onClick={() => onChange({ item })}>
                  {item}
                </Chip>
              ))}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Quantity"
              inputMode="decimal"
              value={values.qty}
              onChange={(event) => onChange({ qty: event.target.value.replace(/[^\d.]/g, '') })}
            />
            <SelectField
              label="Unit"
              value={values.unit}
              options={QTY_UNITS}
              onChange={(unit) => onChange({ unit })}
            />
          </div>
          <TextField
            label="Rate per unit"
            inputMode="decimal"
            prefix={<span className="text-muted">₹</span>}
            value={values.rate}
            onChange={(event) => onChange({ rate: event.target.value.replace(/[^\d.]/g, '') })}
          />
          <SelectField
            label="Party / vendor"
            value={values.partyId}
            options={parties}
            placeholder="Select vendor"
            onChange={(partyId) => onChange({ partyId })}
          />
          <button
            type="button"
            onClick={() => setPartyOpen(true)}
            className="pressable text-body font-semibold text-forest-800"
          >
            + Add new
          </button>
          {payment === 'paid' ? (
            <PaymentChips value={values.mode} onChange={(mode) => onChange({ mode })} />
          ) : null}
          <div>
            <p className="mb-2 text-body font-medium text-ink">Bill photo</p>
            <PhotoTile url={values.photoUrl} label="Bill" onPick={onPhoto} />
          </div>
          <TextArea
            label="Note"
            rows={2}
            value={values.note}
            onChange={(event) => onChange({ note: event.target.value })}
          />
          {category === 'medicine' ? (
            <>
              <p className="text-body font-medium text-ink">Medicine type</p>
              <div className="flex flex-wrap gap-2">
                {MEDICINE_TYPES.map((type) => (
                  <Chip
                    key={type}
                    selected={values.medType === type}
                    onClick={() => onChange({ medType: type })}
                  >
                    {type}
                  </Chip>
                ))}
              </div>
              <TextField
                label="Dose note"
                value={values.dose}
                onChange={(event) => onChange({ dose: event.target.value })}
              />
            </>
          ) : null}
          {category === 'transport' ? (
            <>
              <TextField
                label="From"
                value={values.from}
                onChange={(event) => onChange({ from: event.target.value })}
              />
              <TextField
                label="To"
                value={values.to}
                onChange={(event) => onChange({ to: event.target.value })}
              />
              <p className="text-body font-medium text-ink">Vehicle</p>
              <div className="flex flex-wrap gap-2">
                {VEHICLE_TYPES.map((vehicle) => (
                  <Chip
                    key={vehicle}
                    selected={values.vehicle === vehicle}
                    onClick={() => onChange({ vehicle })}
                  >
                    {vehicle}
                  </Chip>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <BottomSheet open={partyOpen} onClose={() => setPartyOpen(false)} title="Add party">
        <div className="space-y-3 pb-2">
          <TextField
            label="Name"
            value={partyName}
            error={partyError && !partyName.trim() ? partyError : undefined}
            onChange={(event) => setPartyName(event.target.value)}
          />
          <TextField
            label="Phone"
            inputMode="tel"
            value={partyPhone}
            error={partyError && partyName.trim() ? partyError : undefined}
            onChange={(event) => setPartyPhone(event.target.value)}
          />
          <Button onClick={saveParty}>Save party</Button>
        </div>
      </BottomSheet>
    </div>
  );
}

export function CustomCategorySheet({
  open,
  value,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Custom category">
      <div className="space-y-3 pb-2">
        <TextField label="Category name" value={value} onChange={(event) => onChange(event.target.value)} />
        <Button onClick={onSave}>Add category</Button>
      </div>
    </BottomSheet>
  );
}

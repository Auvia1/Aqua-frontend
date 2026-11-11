import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { DateField } from '@/components/ui/DateField';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Toggle';
import { FREQUENCIES, LEASE_PERIODS } from '@/data/common';
import { ToggleRow } from '@/features/ponds/FormSection';
import { ponds } from '@/data/farm';
import { formatINRCompact, isValidIndianMobile } from '@/lib/format';
import { percentTotal, splitPreview } from '@/services/common';
import type { CommonCat, LeasePeriod, SplitRule } from '@/types';

export interface CommonExtras {
  billFrom: string;
  billTo: string;
  kwh: string;
  billNo: string;
  leaseScope: 'farm' | 'ponds';
  leasePonds: string[];
  leasePeriod: LeasePeriod;
  dueDate: string;
  landlordId: string;
  staffName: string;
  salaryMonth: string;
  daysWorked: string;
}

export const EMPTY_EXTRAS: CommonExtras = {
  billFrom: '',
  billTo: '',
  kwh: '',
  billNo: '',
  leaseScope: 'farm',
  leasePonds: [],
  leasePeriod: 'monthly',
  dueDate: '',
  landlordId: '',
  staffName: '',
  salaryMonth: '2026-11',
  daysWorked: '',
};

export function CommonExtrasFields({
  category,
  values,
  landlords,
  onChange,
  onAddLandlord,
}: {
  category: CommonCat;
  values: CommonExtras;
  landlords: { value: string; label: string }[];
  onChange: (patch: Partial<CommonExtras>) => void;
  onAddLandlord: (name: string, phone: string) => void;
}) {
  if (category === 'electricity') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <DateField label="From" value={values.billFrom} onChange={(billFrom) => onChange({ billFrom })} />
          <DateField label="To" value={values.billTo} onChange={(billTo) => onChange({ billTo })} />
        </div>
        <TextField
          label="Units consumed"
          inputMode="decimal"
          suffix={<span className="text-muted">kWh</span>}
          value={values.kwh}
          onChange={(event) => onChange({ kwh: event.target.value.replace(/[^\d.]/g, '') })}
        />
        <TextField label="Bill number" value={values.billNo} onChange={(event) => onChange({ billNo: event.target.value })} />
      </div>
    );
  }

  if (category === 'lease') {
    return (
      <LeaseFields values={values} landlords={landlords} onChange={onChange} onAddLandlord={onAddLandlord} />
    );
  }

  if (category === 'salary') {
    return (
      <div className="space-y-3">
        <TextField label="Staff name" value={values.staffName} onChange={(event) => onChange({ staffName: event.target.value })} />
        <TextField label="Month" type="month" value={values.salaryMonth} onChange={(event) => onChange({ salaryMonth: event.target.value })} />
        <TextField
          label="Days worked"
          inputMode="numeric"
          value={values.daysWorked}
          onChange={(event) => onChange({ daysWorked: event.target.value.replace(/\D/g, '') })}
        />
      </div>
    );
  }

  return null;
}

function LeaseFields({
  values,
  landlords,
  onChange,
  onAddLandlord,
}: {
  values: CommonExtras;
  landlords: { value: string; label: string }[];
  onChange: (patch: Partial<CommonExtras>) => void;
  onAddLandlord: (name: string, phone: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="space-y-3">
      <p className="text-body font-medium text-ink">Applies to</p>
      <div className="flex flex-wrap gap-2">
        <Chip selected={values.leaseScope === 'farm'} onClick={() => onChange({ leaseScope: 'farm' })}>
          Whole farm
        </Chip>
        <Chip selected={values.leaseScope === 'ponds'} onClick={() => onChange({ leaseScope: 'ponds' })}>
          Select ponds
        </Chip>
      </div>
      {values.leaseScope === 'ponds' ? (
        <div className="flex flex-wrap gap-2">
          {ponds.map((pond) => (
            <Chip
              key={pond.id}
              selected={values.leasePonds.includes(pond.id)}
              onClick={() => {
                const on = values.leasePonds.includes(pond.id);
                onChange({
                  leasePonds: on
                    ? values.leasePonds.filter((id) => id !== pond.id)
                    : [...values.leasePonds, pond.id],
                });
              }}
            >
              {pond.name}
            </Chip>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {LEASE_PERIODS.map((period) => (
          <Chip
            key={period.value}
            selected={values.leasePeriod === period.value}
            onClick={() => onChange({ leasePeriod: period.value })}
          >
            {period.label}
          </Chip>
        ))}
      </div>
      <DateField label="Due date" value={values.dueDate} onChange={(dueDate) => onChange({ dueDate })} />
      <SelectField
        label="Landlord"
        value={values.landlordId}
        options={landlords}
        placeholder="Select"
        onChange={(landlordId) => onChange({ landlordId })}
      />
      <button type="button" className="pressable text-body font-semibold text-forest-800" onClick={() => setOpen(true)}>
        + Add new
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Add landlord">
        <div className="space-y-3 pb-2">
          <TextField label="Name" value={name} error={error && !name.trim() ? error : undefined} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="Phone"
            inputMode="tel"
            value={phone}
            error={error && name.trim() ? error : undefined}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!name.trim()) {
                setError('Enter a name');
                return;
              }
              if (phone && !isValidIndianMobile(phone)) {
                setError('Enter a valid mobile');
                return;
              }
              onAddLandlord(name.trim(), phone);
              setOpen(false);
              setName('');
              setPhone('');
              setError('');
            }}
          >
            Save
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

export function SplitCard({
  amount,
  allPonds,
  pondIds,
  rule,
  manual,
  onAll,
  onSelectPonds,
  onTogglePond,
  onRule,
  onManual,
}: {
  amount: number;
  allPonds: boolean;
  pondIds: string[];
  rule: SplitRule;
  manual: Record<string, number>;
  onAll: () => void;
  onSelectPonds: () => void;
  onTogglePond: (id: string) => void;
  onRule: (rule: SplitRule) => void;
  onManual: (id: string, value: number) => void;
}) {
  const ids = allPonds ? ponds.map((pond) => pond.id) : pondIds;
  const rows = splitPreview(amount, ids, rule, manual);
  const total = percentTotal(manual, ids);
  const invalid = rule === 'manual' && Math.abs(total - 100) > 0.05;

  return (
    <section className="space-y-3 rounded-card bg-card p-4 shadow-soft">
      <h2 className="text-title text-ink">Split across</h2>
      <div className="flex flex-wrap gap-2">
        <Chip selected={allPonds} onClick={onAll}>
          All ponds
        </Chip>
        <Chip selected={!allPonds} onClick={onSelectPonds}>
          Select ponds
        </Chip>
      </div>
      {allPonds ? null : (
        <div className="flex flex-wrap gap-2">
          {ponds.map((pond) => (
            <Chip key={pond.id} selected={pondIds.includes(pond.id)} onClick={() => onTogglePond(pond.id)}>
              {pond.name}
            </Chip>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {([
          ['area', 'By area'],
          ['equal', 'Equal'],
          ['manual', 'Manual'],
        ] as const).map(([value, label]) => (
          <Chip key={value} selected={rule === value} onClick={() => onRule(value)}>
            {label}
          </Chip>
        ))}
      </div>
      <table className="w-full text-body">
        <tbody>
          {rows.map((row) => (
            <tr key={row.pondId} className="border-t border-line">
              <td className="py-2 text-ink">{row.name}</td>
              <td className="py-2 text-right">
                {rule === 'manual' ? (
                  <input
                    aria-label={`${row.name} percent`}
                    inputMode="decimal"
                    value={manual[row.pondId] ?? ''}
                    onChange={(event) => onManual(row.pondId, Number(event.target.value.replace(/[^\d.]/g, '')) || 0)}
                    className="h-10 w-16 rounded-input bg-surface px-2 text-right text-body outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30"
                  />
                ) : (
                  <span className="tabular-nums text-muted">{row.percent}%</span>
                )}
              </td>
              <td className="py-2 text-right tabular-nums text-ink">{formatINRCompact(row.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {invalid ? <p className="text-caption text-danger">Percentages must total 100% (now {total}%)</p> : null}
    </section>
  );
}

export function RecurringBlock({
  repeat,
  freq,
  nextDue,
  remind,
  onRepeat,
  onFreq,
  onNextDue,
  onRemind,
}: {
  repeat: boolean;
  freq: LeasePeriod;
  nextDue: string;
  remind: boolean;
  onRepeat: (value: boolean) => void;
  onFreq: (value: LeasePeriod) => void;
  onNextDue: (value: string) => void;
  onRemind: (value: boolean) => void;
}) {
  return (
    <section className="space-y-3 rounded-card bg-card p-4 shadow-soft">
      <ToggleRow
        label="Repeat this expense"
        control={<Toggle label="Repeat this expense" checked={repeat} onChange={onRepeat} />}
      />
      {repeat ? (
        <>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((item) => (
              <Chip key={item.value} selected={freq === item.value} onClick={() => onFreq(item.value)}>
                {item.label}
              </Chip>
            ))}
          </div>
          <DateField label="Next due date" value={nextDue} onChange={onNextDue} />
          <ToggleRow
            label="Remind me 3 days before"
            control={<Toggle label="Remind me 3 days before" checked={remind} onChange={onRemind} />}
          />
        </>
      ) : null}
    </section>
  );
}

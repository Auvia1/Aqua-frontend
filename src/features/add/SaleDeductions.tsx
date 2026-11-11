import { Chip } from '@/components/ui/Chip';
import { DateField } from '@/components/ui/DateField';
import { TextField } from '@/components/ui/TextField';
import { PaymentChips } from '@/features/add/PaymentChips';
import { formatGrouped, formatINRCompact } from '@/lib/format';
import type { PaymentMode } from '@/types';

export interface Commission {
  mode: 'percent' | 'rupee';
  value: string;
}

export function commissionAmount(gross: number, commission: Commission): number {
  const n = Number(commission.value) || 0;
  if (commission.mode === 'percent') return Math.round((gross * n) / 100);
  return Math.round(n);
}

export function DeductionsCard({
  commission,
  ice,
  transport,
  onCommission,
  onIce,
  onTransport,
}: {
  commission: Commission;
  ice: string;
  transport: string;
  onCommission: (next: Commission) => void;
  onIce: (value: string) => void;
  onTransport: (value: string) => void;
}) {
  return (
    <section className="space-y-3 rounded-card bg-card p-4 shadow-soft">
      <h2 className="text-title text-ink">Deductions</h2>
      <div className="flex items-center gap-2">
        <Chip selected={commission.mode === 'percent'} onClick={() => onCommission({ ...commission, mode: 'percent' })}>
          %
        </Chip>
        <Chip selected={commission.mode === 'rupee'} onClick={() => onCommission({ ...commission, mode: 'rupee' })}>
          ₹
        </Chip>
      </div>
      <TextField
        label="Commission"
        inputMode="decimal"
        prefix={<span className="text-muted">{commission.mode === 'percent' ? '%' : '₹'}</span>}
        value={commission.value}
        onChange={(event) => onCommission({ ...commission, value: event.target.value.replace(/[^\d.]/g, '') })}
      />
      <TextField
        label="Ice & packing"
        inputMode="decimal"
        prefix={<span className="text-muted">₹</span>}
        value={ice}
        onChange={(event) => onIce(event.target.value.replace(/[^\d.]/g, ''))}
      />
      <TextField
        label="Transport"
        inputMode="decimal"
        prefix={<span className="text-muted">₹</span>}
        value={transport}
        onChange={(event) => onTransport(event.target.value.replace(/[^\d.]/g, ''))}
      />
    </section>
  );
}

export function PaymentCard({
  net,
  received,
  pending,
  mode,
  due,
  onReceived,
  onMode,
  onDue,
}: {
  net: number;
  received: string | null;
  pending: number;
  mode: PaymentMode;
  due: string;
  onReceived: (value: string) => void;
  onMode: (value: PaymentMode) => void;
  onDue: (value: string) => void;
}) {
  return (
    <section className="space-y-3 rounded-card bg-card p-4 shadow-soft">
      <h2 className="text-title text-ink">Payment</h2>
      <TextField
        label="Amount received now"
        inputMode="decimal"
        prefix={<span className="text-muted">₹</span>}
        value={received == null ? String(net || '') : received}
        onChange={(event) => onReceived(event.target.value.replace(/[^\d.]/g, ''))}
      />
      <PaymentChips value={mode} onChange={onMode} />
      <p className="text-body text-ink">
        Pending <span className="font-semibold">{formatINRCompact(pending)}</span>
      </p>
      {pending > 0 ? <DateField label="Due date" value={due} onChange={onDue} /> : null}
    </section>
  );
}

export function NetCard({ amount }: { amount: number }) {
  return (
    <section className="rounded-hero bg-forest-800 p-5 text-white">
      <p className="text-caption text-white/70">Net amount</p>
      <p className="mt-1 text-display tabular-nums">₹ {formatGrouped(amount)}</p>
    </section>
  );
}

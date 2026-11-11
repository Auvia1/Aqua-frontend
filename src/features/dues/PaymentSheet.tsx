import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { DateChip } from '@/features/add/DateChip';
import { PaymentChips } from '@/features/add/PaymentChips';
import { formatINRCompact, toISODate } from '@/lib/format';
import type { PaymentMode } from '@/types';

export function PaymentSheet({
  open,
  title,
  outstanding,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  outstanding: number;
  onClose: () => void;
  onSave: (input: { amount: number; date: string; mode: PaymentMode; note: string }) => void;
}) {
  const [amount, setAmount] = useState(String(outstanding));
  const [date, setDate] = useState(toISODate());
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setAmount(String(outstanding));
    setDate(toISODate());
    setMode('cash');
    setNote('');
  }, [open, outstanding]);

  const value = Number(amount) || 0;
  const balance = Math.max(0, outstanding - value);

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-3 pb-2">
        <TextField
          label="Amount"
          inputMode="decimal"
          prefix={<span className="text-muted">₹</span>}
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
          hint={`Balance after: ${formatINRCompact(balance)}`}
        />
        <DateChip value={date} onChange={setDate} />
        <PaymentChips value={mode} onChange={setMode} />
        <TextArea label="Note" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
        <Button
          disabled={value <= 0}
          onClick={() => {
            onSave({ amount: value, date, mode, note });
            onClose();
          }}
        >
          Record payment
        </Button>
      </div>
    </BottomSheet>
  );
}

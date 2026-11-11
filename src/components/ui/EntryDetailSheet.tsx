import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { DateField } from '@/components/ui/DateField';
import { MoneyAmount } from '@/components/ui/MoneyAmount';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { CATEGORY_BY_ID } from '@/data/categories';
import { PaymentChips } from '@/features/add/PaymentChips';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { farm } from '@/data/farm';
import { formatDate, toISODate } from '@/lib/format';
import { editPath, partyName, pondName, qtyRateLabel } from '@/services/ledger';
import { expenseOnOpenCycle } from '@/services/ponds';
import type { LedgerEntry, PaymentMode } from '@/types';

interface EntryDetailSheetProps {
  entry: LedgerEntry | null;
  onClose: () => void;
}

export function EntryDetailSheet({ entry, onClose }: EntryDetailSheetProps) {
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { entries, parties, markPaid, deleteEntry } = useLedger();
  const live = entries.find((item) => item.id === entry?.id) ?? entry;
  const [photo, setPhoto] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payDate, setPayDate] = useState(toISODate());
  const [mode, setMode] = useState<PaymentMode>('cash');

  return (
    <>
      <BottomSheet open={Boolean(live)} onClose={onClose} title="Entry">
        {live ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CategoryIcon category={live.category} />
              <div className="min-w-0">
                <p className="text-title text-ink">{live.title}</p>
                <p className="text-caption text-muted">{live.subtitle}</p>
              </div>
            </div>
            <MoneyAmount
              amount={live.amount}
              signed
              tone={live.kind === 'revenue' ? 'revenue' : 'expense'}
              size="lg"
            />
            <dl className="space-y-2.5 text-body">
              <Detail label="Date and time" value={`${formatDate(live.date)} · ${live.time ?? '9:00 am'}`} />
              <Detail label="Pond" value={pondName(live.pondId)} />
              <Detail label="Cycle" value={live.cycleLabel ?? '—'} />
              <Detail label="Category" value={CATEGORY_BY_ID[live.category]?.label ?? live.category} />
              <Detail label="Item" value={live.item ?? live.title} />
              <Detail label="Quantity × rate" value={qtyRateLabel(live)} />
              <Detail
                label="Party"
                value={parties.find((item) => item.id === live.partyId)?.name ?? partyName(live.partyId)}
              />
              <Detail label="Payment mode" value={modeLabel(live.mode)} />
              <Detail label="Status" value={live.payment === 'credit' ? 'Credit' : 'Paid'} />
              <Detail label="Added by" value={live.addedBy ?? farm.ownerName} />
              <Detail label="Note" value={live.note ?? '—'} />
            </dl>
            {live.photoUrl ? (
              <button type="button" onClick={() => setPhoto(true)} className="pressable block">
                <img src={live.photoUrl} alt="Bill" className="h-20 w-20 rounded-input object-cover" />
              </button>
            ) : null}
            {live.payment === 'credit' ? (
              <Button onClick={() => setPayOpen(true)}>Mark as paid</Button>
            ) : null}
            {expenseOnOpenCycle(live) ? (
              <Button
                onClick={() => {
                  onClose();
                  navigate(editPath(live));
                }}
              >
                Edit
              </Button>
            ) : null}
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="pressable flex min-h-touch w-full items-center justify-center text-body font-semibold text-danger"
            >
              Delete
            </button>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet open={payOpen} onClose={() => setPayOpen(false)} title="Mark as paid" layer="nested">
        <div className="space-y-3 pb-2">
          <DateField label="Payment date" value={payDate} onChange={setPayDate} />
          <PaymentChips value={mode} onChange={setMode} />
          <Button
            onClick={() => {
              if (!live) return;
              markPaid(live.id, payDate, mode);
              setPayOpen(false);
              showToast('Marked as paid', 'success');
            }}
          >
            Confirm
          </Button>
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={confirm}
        title="Delete entry?"
        message="This entry will be removed from the ledger."
        confirmLabel="Delete"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          if (!live) return;
          deleteEntry(live.id);
          setConfirm(false);
          onClose();
          showToast('Entry deleted');
        }}
      />
      <PhotoViewer url={photo ? live?.photoUrl ?? null : null} onClose={() => setPhoto(false)} />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] text-right text-ink">{value}</dd>
    </div>
  );
}

function modeLabel(mode: PaymentMode | undefined): string {
  if (!mode) return '—';
  return mode === 'upi' ? 'UPI' : mode[0]!.toUpperCase() + mode.slice(1);
}

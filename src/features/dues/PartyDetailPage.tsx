import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreVertical, Phone } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { TextField } from '@/components/ui/TextField';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { PaymentSheet } from '@/features/dues/PaymentSheet';
import { HistoryList, PendingList } from '@/features/dues/PartySections';
import { farm } from '@/data/farm';
import { formatINRCompact, formatPhoneDisplay } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import { UNASSIGNED_PARTY, historyFor, pendingForParty, reminderLink, billedPaid } from '@/services/dues';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'history', label: 'History' },
] as const;

export function PartyDetailPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { entries, parties, sales, payments, recordPayment, updateParty, deleteParty } = useLedger();
  const party =
    parties.find((item) => item.id === partyId) ??
    (partyId === UNASSIGNED_PARTY.id ? UNASSIGNED_PARTY : undefined);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [selected, setSelected] = useState<string[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState(party?.name ?? '');
  const [phone, setPhone] = useState(party?.phone ?? '');
  const [place, setPlace] = useState(party?.place ?? '');

  const pending = useMemo(
    () => (party ? pendingForParty(party, entries, sales) : []),
    [party, entries, sales],
  );
  const money = useMemo(
    () => (party ? billedPaid(party, entries, sales) : { billed: 0, paid: 0 }),
    [party, entries, sales],
  );
  const outstanding = pending.reduce((sum, item) => sum + item.amount, 0);
  const history = useMemo(
    () => (party ? historyFor(party, entries, sales, payments) : []),
    [party, entries, sales, payments],
  );
  const selectedSum = pending.filter((item) => selected.includes(item.id)).reduce((sum, item) => sum + item.amount, 0);

  if (!party) {
    return (
      <div className="min-h-full bg-bg">
        <PageHeader variant="b" title="Party" />
        <p className="px-page pt-8 text-body text-muted">This party was removed.</p>
      </div>
    );
  }

  const settleIds = selected.length > 0 ? selected : undefined;
  const settleAmount = selected.length > 0 ? selectedSum : outstanding;

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title={party.name}
        right={
          <div className="flex gap-1">
            {party.phone ? (
              <IconButton
                label="Call"
                onClick={() => {
                  window.location.href = `tel:+91${party.phone}`;
                }}
              >
                <Phone size={ICON.size} strokeWidth={ICON.stroke} />
              </IconButton>
            ) : null}
            {party.id !== UNASSIGNED_PARTY.id ? (
              <IconButton label="More" onClick={() => setMenuOpen(true)}>
                <MoreVertical size={ICON.size} strokeWidth={ICON.stroke} />
              </IconButton>
            ) : null}
          </div>
        }
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-page pb-28 pt-4">
        <section className="rounded-hero bg-forest-800 p-5 text-white">
          <p className="text-caption text-white/70">Outstanding</p>
          <p className="mt-1 text-h2 tabular-nums">{formatINRCompact(outstanding)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <p className="text-caption text-white/60">Total billed</p>
              <p className="text-title tabular-nums">{formatINRCompact(money.billed)}</p>
            </div>
            <div>
              <p className="text-caption text-white/60">Total paid</p>
              <p className="text-title tabular-nums">{formatINRCompact(money.paid)}</p>
            </div>
          </div>
        </section>

        <div className={party.kind === 'buyer' ? 'grid grid-cols-2 gap-2' : ''}>
          <Button onClick={() => setPayOpen(true)}>Record payment</Button>
          {party.kind === 'buyer' ? (
            <Button
              variant="secondary"
              onClick={() => window.open(reminderLink(party, outstanding, farm.name, farm.ownerName), '_blank')}
            >
              Send reminder
            </Button>
          ) : null}
        </div>

        <section className="rounded-card bg-card p-4 shadow-soft">
          <h2 className="mb-2 text-title text-ink">Contact</h2>
          <p className="text-body text-ink">{party.phone ? formatPhoneDisplay(party.phone) : '—'}</p>
          <p className="text-caption text-muted">{party.place ?? '—'}</p>
          <p className="text-caption capitalize text-muted">{party.kind}</p>
        </section>

        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
        {tab === 'pending' ? (
          <PendingList
            items={pending}
            selected={selected}
            onToggle={(id) =>
              setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
            }
          />
        ) : (
          <HistoryList events={history} />
        )}
      </div>

      {tab === 'pending' && selected.length > 0 ? (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-line bg-bg px-page py-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          <p className="text-body font-semibold text-ink">
            {selected.length} selected · {formatINRCompact(selectedSum)}
          </p>
          <Button size="sm" onClick={() => setPayOpen(true)}>
            Settle selected
          </Button>
        </div>
      ) : null}

      <PaymentSheet
        open={payOpen}
        title="Record payment"
        outstanding={settleAmount}
        onClose={() => setPayOpen(false)}
        onSave={(input) => {
          recordPayment({ partyId: party.id, ...input, entryIds: settleIds });
          setSelected([]);
          showToast('Payment recorded', 'success');
        }}
      />

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={party.name}>
        <div className="space-y-1 pb-2">
          <button
            type="button"
            className="pressable flex h-12 w-full items-center rounded-input bg-surface px-4 text-body"
            onClick={() => {
              setName(party.name);
              setPhone(party.phone ?? '');
              setPlace(party.place ?? '');
              setMenuOpen(false);
              setEditOpen(true);
            }}
          >
            Edit party
          </button>
          <button
            type="button"
            className="pressable flex h-12 w-full items-center rounded-input bg-surface px-4 text-body text-danger"
            onClick={() => {
              setMenuOpen(false);
              setConfirm(true);
            }}
          >
            Delete party
          </button>
        </div>
      </BottomSheet>

      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit party">
        <div className="space-y-3 pb-2">
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField label="Place" value={place} onChange={(e) => setPlace(e.target.value)} />
          <Button
            onClick={() => {
              updateParty(party.id, { name: name.trim(), phone, place });
              setEditOpen(false);
              showToast('Party updated', 'success');
            }}
          >
            Save
          </Button>
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={confirm}
        title="Delete party?"
        message={`${party.name} will be removed from dues.`}
        confirmLabel="Delete"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          deleteParty(party.id);
          setConfirm(false);
          showToast('Party deleted');
          navigate('/dues');
        }}
      />
    </div>
  );
}

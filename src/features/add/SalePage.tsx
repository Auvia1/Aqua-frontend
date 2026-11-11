import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Chip } from '@/components/ui/Chip';
import { SelectField } from '@/components/ui/SelectField';
import { TextArea } from '@/components/ui/TextArea';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { cycles } from '@/data/cycles';
import { parties as farmParties, ponds } from '@/data/farm';
import { AddFooter } from '@/features/add/AddFooter';
import { DateChip } from '@/features/add/DateChip';
import { PhotoTile } from '@/features/add/PhotoTile';
import {
  DeductionsCard,
  NetCard,
  PaymentCard,
  commissionAmount,
  type Commission,
} from '@/features/add/SaleDeductions';
import {
  BuyerSheet,
  EMPTY_LOT,
  FinalHarvestSheet,
  LotsCard,
  SalePondChips,
  lotTotal,
  type LotRow,
} from '@/features/add/SaleLots';
import { DiscardSheet } from '@/features/ponds/PondSheets';
import { nid } from '@/lib/api';
import { formatINRCompact, isValidIndianMobile, toISODate } from '@/lib/format';
import { pickDefaultPond, rememberPond } from '@/services/add';
import type { HarvestType, PaymentMode } from '@/types';

const HARVEST: { value: HarvestType; label: string }[] = [
  { value: 'partial', label: 'Partial' },
  { value: 'full', label: 'Full' },
];

export function SalePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { showToast } = useUi();
  const { addEntries, addSales, addParty } = useLedger();

  const [pondId, setPondId] = useState(() => pickDefaultPond(params.get('pond')));
  const [date, setDate] = useState(toISODate());
  const [harvest, setHarvest] = useState<HarvestType>('partial');
  const [buyers, setBuyers] = useState(() =>
    farmParties.filter((p) => p.kind === 'buyer').map((p) => ({ value: p.id, label: p.name })),
  );
  const [buyerId, setBuyerId] = useState(buyers[0]?.value ?? '');
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerPlace, setBuyerPlace] = useState('');
  const [buyerError, setBuyerError] = useState('');
  const [lots, setLots] = useState<LotRow[]>([{ ...EMPTY_LOT }]);
  const [commission, setCommission] = useState<Commission>({ mode: 'percent', value: '' });
  const [ice, setIce] = useState('');
  const [transport, setTransport] = useState('');
  const [received, setReceived] = useState<string | null>(null);
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [due, setDue] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [finalOpen, setFinalOpen] = useState(false);

  const gross = lots.reduce((sum, lot) => sum + lotTotal(lot), 0);
  const qty = lots.reduce((sum, lot) => sum + (Number(lot.qty) || 0), 0);
  const deductions =
    commissionAmount(gross, commission) + (Number(ice) || 0) + (Number(transport) || 0);
  const net = Math.max(0, gross - deductions);
  const receivedNum = received == null ? net : Number(received) || 0;
  const pending = Math.max(0, net - receivedNum);
  const canSave = Boolean(pondId) && qty > 0 && gross > 0 && Boolean(buyerId);
  const dirty = qty > 0 || notes !== '' || ice !== '' || transport !== '';
  const pondName = ponds.find((p) => p.id === pondId)?.name ?? 'Pond';

  const goBack = () => navigate(-1);

  const saveBuyer = () => {
    if (!buyerName.trim()) {
      setBuyerError('Enter a name');
      return;
    }
    if (buyerPhone && !isValidIndianMobile(buyerPhone)) {
      setBuyerError('Enter a valid mobile');
      return;
    }
    const id = nid('buyer');
    addParty({ id, name: buyerName.trim(), kind: 'buyer', phone: buyerPhone || undefined, place: buyerPlace || undefined });
    setBuyers((current) => [...current, { value: id, label: buyerName.trim() }]);
    setBuyerId(id);
    setBuyerOpen(false);
    setBuyerName('');
    setBuyerPhone('');
    setBuyerPlace('');
    setBuyerError('');
  };

  const onSave = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      rememberPond(pondId);
      const buyerNameLabel = buyers.find((item) => item.value === buyerId)?.label ?? 'Buyer';
      const cycleId =
        params.get('cycle') || cycles.find((item) => item.pondId === pondId && item.status === 'active')?.id;
      const countSize = lots[0]?.size ?? '';
      const ratePerKg = qty > 0 ? Math.round(gross / qty) : 0;
      addSales([
        {
          id: nid('sale'),
          pondId,
          cycleId: cycleId ?? 'none',
          date,
          buyer: buyerNameLabel,
          qtyKg: qty,
          countSize,
          ratePerKg,
          netAmount: net,
          receivedAmount: receivedNum,
          dueDate: due || undefined,
        },
      ]);
      addEntries([
        {
          id: nid('ent'),
          title: `Sale · ${buyerNameLabel}`,
          subtitle: pondName,
          amount: net,
          kind: 'revenue',
          category: 'revenue',
          date,
          pondId,
          cycleId,
          partyId: buyerId || undefined,
          payment: pending > 0 ? 'credit' : 'paid',
          qty,
          unit: 'kg',
          rate: ratePerKg,
          mode,
          note: notes.trim() || undefined,
          photoUrl: photoUrl || undefined,
          dueDate: due || undefined,
        },
      ]);
      showToast(`${formatINRCompact(net)} sale · ${pondName}`, 'success', {
        label: 'Undo',
        onClick: () => showToast('Entry undone'),
      });
      setFinalOpen(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title="Add sale"
        close
        onBack={() => (dirty ? setDiscardOpen(true) : goBack())}
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-page pb-4 pt-3">
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Pond</p>
          <SalePondChips
            value={pondId}
            onChange={(id) => {
              setPondId(id);
              rememberPond(id);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateChip value={date} onChange={setDate} />
          {HARVEST.map((item) => (
            <Chip key={item.value} selected={harvest === item.value} onClick={() => setHarvest(item.value)}>
              {item.label}
            </Chip>
          ))}
        </div>

        <SelectField label="Buyer" value={buyerId} options={buyers} onChange={setBuyerId} />
        <button type="button" className="pressable text-body font-semibold text-forest-800" onClick={() => setBuyerOpen(true)}>
          + Add buyer
        </button>

        <LotsCard lots={lots} onChange={setLots} />

        <section className="rounded-card bg-lime-100 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-caption text-muted">Total quantity</p>
              <p className="text-h2 text-ink">{qty} kg</p>
            </div>
            <div className="text-right">
              <p className="text-caption text-muted">Gross amount</p>
              <p className="text-h2 text-ink">{formatINRCompact(gross)}</p>
            </div>
          </div>
        </section>

        <DeductionsCard
          commission={commission}
          ice={ice}
          transport={transport}
          onCommission={setCommission}
          onIce={setIce}
          onTransport={setTransport}
        />

        <NetCard amount={net} />
        <PaymentCard
          net={net}
          received={received}
          pending={pending}
          mode={mode}
          due={due}
          onReceived={setReceived}
          onMode={setMode}
          onDue={setDue}
        />

        <div>
          <p className="mb-2 text-body font-medium text-ink">Weighment slip</p>
          <PhotoTile
            url={photoUrl}
            label="Slip"
            onPick={(file) => {
              if (photoUrl) URL.revokeObjectURL(photoUrl);
              setPhotoUrl(file ? URL.createObjectURL(file) : '');
            }}
          />
        </div>
        <TextArea label="Notes" rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
        {!canSave && dirty ? <p className="text-caption text-danger">Add quantity, rate and a buyer to save</p> : null}
      </div>

      <AddFooter primary="Save sale" disabled={!canSave} loading={busy} onPrimary={() => void onSave()} />

      <BuyerSheet
        open={buyerOpen}
        name={buyerName}
        phone={buyerPhone}
        place={buyerPlace}
        error={buyerError}
        onClose={() => setBuyerOpen(false)}
        onName={setBuyerName}
        onPhone={setBuyerPhone}
        onPlace={setBuyerPlace}
        onSave={saveBuyer}
      />

      <FinalHarvestSheet
        open={finalOpen}
        onClose={() => setFinalOpen(false)}
        onYes={() => {
          setFinalOpen(false);
          navigate(`/ponds/${pondId}/close-cycle`);
        }}
        onNo={() => {
          setFinalOpen(false);
          goBack();
        }}
      />

      <DiscardSheet
        open={discardOpen}
        title="Discard entry?"
        message="This sale will not be saved."
        onKeep={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          goBack();
        }}
      />
    </div>
  );
}

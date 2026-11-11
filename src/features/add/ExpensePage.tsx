import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Numpad } from '@/components/ui/Numpad';
import { PaidCreditToggle } from '@/components/ui/PaidCreditToggle';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { ponds, parties as farmParties } from '@/data/farm';
import { EXPENSE_CATEGORIES, unitLabel } from '@/data/addCatalog';
import { AddFooter } from '@/features/add/AddFooter';
import { AmountDisplay } from '@/features/add/AmountDisplay';
import { DateChip } from '@/features/add/DateChip';
import {
  CategoryGrid,
  CustomCategorySheet,
  EMPTY_MORE,
  ExpenseDetails,
  type ExpenseMore,
} from '@/features/add/ExpenseDetails';
import { PondChips } from '@/features/add/PondChips';
import { DiscardSheet } from '@/features/ponds/PondSheets';
import { nid } from '@/lib/api';
import { formatGrouped, toISODate } from '@/lib/format';
import { appendAmount, backspaceAmount, pickDefaultPond, rememberPond } from '@/services/add';
import { activeCycleFor, expenseOnOpenCycle } from '@/services/ponds';
import type { CategoryId, PaymentStatus } from '@/types';

export function ExpensePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { showToast } = useUi();
  const { addEntries, entries, updateEntry } = useLedger();
  const amountRef = useRef<HTMLDivElement>(null);
  const editId = params.get('edit');
  const existing = editId ? entries.find((item) => item.id === editId) : undefined;

  const [pondId, setPondId] = useState(() => pickDefaultPond(params.get('pond')));
  const [amount, setAmount] = useState('0');
  const [locked, setLocked] = useState(false);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [date, setDate] = useState(toISODate());
  const [payment, setPayment] = useState<PaymentStatus>('paid');
  const [moreOpen, setMoreOpen] = useState(false);
  const [more, setMore] = useState<ExpenseMore>(EMPTY_MORE);
  const [vendors, setVendors] = useState(() =>
    farmParties.filter((p) => p.kind === 'vendor').map((p) => ({ value: p.id, label: p.name })),
  );
  const [pad, setPad] = useState(true);
  const [busy, setBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(!editId);

  useEffect(() => {
    if (!editId || hydrated) return;
    if (!existing || !expenseOnOpenCycle(existing)) {
      showToast(existing ? 'This cycle is closed' : 'Expense not found', 'error');
      navigate(-1);
      return;
    }
    setPondId(existing.pondId === 'common' ? '' : existing.pondId);
    setAmount(String(existing.amount));
    setCategory(existing.category);
    setDate(existing.date.slice(0, 10));
    setPayment(existing.payment);
    setMore({
      ...EMPTY_MORE,
      item: existing.item ?? '',
      qty: existing.qty != null ? String(existing.qty) : '',
      unit: existing.unit || 'bag',
      rate: existing.rate != null ? String(existing.rate) : '',
      partyId: existing.partyId ?? '',
      mode: existing.mode ?? 'cash',
      photoUrl: existing.photoUrl ?? '',
      note: existing.note ?? '',
    });
    setHydrated(true);
  }, [editId, existing, hydrated, navigate, showToast]);

  const qty = Number(more.qty);
  const rate = Number(more.rate);
  const canAuto = qty > 0 && rate > 0;

  useEffect(() => {
    if (!canAuto) {
      setLocked(false);
      return;
    }
    setLocked(true);
    setAmount(String(Math.round(qty * rate)));
  }, [qty, rate, canAuto]);

  const caption = canAuto
    ? `${qty} ${unitLabel(more.unit, qty)} × ₹${formatGrouped(rate)}`
    : undefined;

  const pondName = ponds.find((p) => p.id === pondId)?.name ?? 'Pond';
  const catLabel =
    customLabel ||
    EXPENSE_CATEGORIES.find((c) => c.id === category)?.label ||
    (existing && category === existing.category ? existing.title : '');
  const amountNum = Number(amount) || 0;
  const canSave = amountNum > 0 && Boolean(pondId) && Boolean(category || customLabel);
  const dirty = amount !== '0' || Boolean(category) || Boolean(customLabel) || more.item !== '';

  const patchMore = (next: Partial<ExpenseMore>) => setMore((current) => ({ ...current, ...next }));

  const onPhoto = (file: File | null) => {
    setMore((current) => {
      if (current.photoUrl) URL.revokeObjectURL(current.photoUrl);
      return { ...current, photoUrl: file ? URL.createObjectURL(file) : '' };
    });
  };

  const resetDetails = () => {
    setAmount('0');
    setLocked(false);
    setMore(EMPTY_MORE);
    setPayment('paid');
    setPad(true);
    setErrors({});
  };

  const goBack = () => navigate(-1);

  const onSave = async (again: boolean) => {
    const next: Record<string, string> = {};
    if (amountNum <= 0) next.amount = 'Enter an amount';
    if (!pondId) next.pond = 'Pick a pond';
    if (!category && !customLabel) next.category = 'Pick a category';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      rememberPond(pondId);
      const row = {
        id: existing?.id ?? nid('ent'),
        title: catLabel || existing?.title || 'Expense',
        subtitle: more.item ? `${pondName} · ${more.item}` : pondName,
        amount: amountNum,
        kind: 'expense' as const,
        category: category ?? existing?.category ?? 'misc',
        date,
        pondId,
        cycleId: existing && existing.pondId === pondId ? existing.cycleId : activeCycleFor(pondId)?.id,
        partyId: more.partyId || undefined,
        payment,
        note: more.note || undefined,
        item: more.item || undefined,
        qty: Number(more.qty) || undefined,
        unit: more.unit || undefined,
        rate: Number(more.rate) || undefined,
        mode: more.mode,
        photoUrl: more.photoUrl || undefined,
      };
      if (existing) {
        updateEntry({ ...existing, ...row });
        showToast(`₹${formatGrouped(amountNum)} updated · ${pondName}`, 'success');
        goBack();
        return;
      }
      addEntries([row]);
      showToast(`₹${formatGrouped(amountNum)} added to ${pondName} · ${catLabel}`, 'success', {
        label: 'Undo',
        onClick: () => showToast('Entry undone'),
      });
      if (again) resetDetails();
      else goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-bg">
      <PageHeader
        variant="b"
        title={existing ? 'Edit expense' : 'Add expense'}
        close
        onBack={() => (dirty ? setDiscardOpen(true) : goBack())}
      />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-page pb-3 pt-3">
        <div ref={amountRef}>
        <AmountDisplay
          digits={amount}
          locked={locked}
          caption={caption}
          onEdit={() => {
            setLocked(false);
            setPad(true);
          }}
          onActivate={() => setPad(true)}
        />
        </div>
        {errors.amount ? <p className="text-center text-caption text-danger">{errors.amount}</p> : null}

        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Pond</p>
          <PondChips
            value={pondId}
            onChange={(id) => {
              setPondId(id);
              rememberPond(id);
            }}
          />
          {errors.pond ? <p className="mt-1 text-caption text-danger">{errors.pond}</p> : null}
        </div>

        <CategoryGrid
          value={category}
          customLabel={customLabel}
          onSelect={(id) => {
            setCategory(id);
            setCustomLabel('');
          }}
          onCustom={() => setCustomOpen(true)}
        />
        {errors.category ? <p className="text-caption text-danger">{errors.category}</p> : null}

        <div className="flex items-center gap-3">
          <DateChip value={date} onChange={setDate} />
          <div className="min-w-0 flex-1">
            <PaidCreditToggle value={payment} onChange={setPayment} />
          </div>
        </div>

        <ExpenseDetails
          open={moreOpen}
          onToggle={() => {
            setMoreOpen((value) => !value);
            setPad(moreOpen);
          }}
          category={category}
          payment={payment}
          values={more}
          parties={vendors}
          onChange={patchMore}
          onPhoto={onPhoto}
          onAddParty={(name, phone) => {
            const id = `vendor-${Date.now()}`;
            setVendors((current) => [...current, { value: id, label: `${name}${phone ? ` · ${phone}` : ''}` }]);
            patchMore({ partyId: id });
          }}
        />
      </div>

      {pad && !locked ? (
        <div className="shrink-0 border-t border-line bg-bg px-page pt-2">
          <Numpad
            compact
            onKey={(key) => {
              setAmount((current) => appendAmount(current, key));
              amountRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }}
            onBackspace={() => {
              setAmount((current) => backspaceAmount(current));
              amountRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }}
          />
        </div>
      ) : null}
      <AddFooter
        primary={existing ? 'Save changes' : 'Save expense'}
        secondary={existing ? undefined : 'Save & add another'}
        disabled={!canSave || Boolean(editId && !hydrated)}
        loading={busy}
        onPrimary={() => void onSave(false)}
        onSecondary={existing ? undefined : () => void onSave(true)}
      />

      <CustomCategorySheet
        open={customOpen}
        value={customDraft}
        onChange={setCustomDraft}
        onClose={() => setCustomOpen(false)}
        onSave={() => {
          if (!customDraft.trim()) return;
          setCustomLabel(customDraft.trim());
          setCategory('misc');
          setCustomOpen(false);
          setCustomDraft('');
        }}
      />

      <DiscardSheet
        open={discardOpen}
        title="Discard entry?"
        message="This expense will not be saved."
        onKeep={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          goBack();
        }}
      />
    </div>
  );
}

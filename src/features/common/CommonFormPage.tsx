import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Numpad } from '@/components/ui/Numpad';
import { PaidCreditToggle } from '@/components/ui/PaidCreditToggle';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { TextArea } from '@/components/ui/TextArea';
import { DateField } from '@/components/ui/DateField';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { COMMON_CATS } from '@/data/common';
import { Chip } from '@/components/ui/Chip';
import { CATEGORY_ICONS } from '@/components/ui/CategoryIcon';
import { AddFooter } from '@/features/add/AddFooter';
import { AmountDisplay } from '@/features/add/AmountDisplay';
import { PaymentChips } from '@/features/add/PaymentChips';
import { PhotoTile } from '@/features/add/PhotoTile';
import { DiscardSheet } from '@/features/ponds/PondSheets';
import { EXPENSE_TABS } from '@/data/addCatalog';
import { formatDate, formatGrouped, toISODate } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import { appendAmount, backspaceAmount } from '@/services/add';
import { nid } from '@/lib/api';
import type { CommonCat, PaymentMode, PaymentStatus } from '@/types';

export function CommonFormPage() {
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { addEntries } = useLedger();

  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState<CommonCat | null>(null);
  const [from, setFrom] = useState(toISODate());
  const [to, setTo] = useState('');
  const [payment, setPayment] = useState<PaymentStatus>('paid');
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [photoUrl, setPhotoUrl] = useState('');
  const [note, setNote] = useState('');
  const [pad, setPad] = useState(true);
  const [busy, setBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const amountNum = Number(amount) || 0;
  const canSave = amountNum > 0 && Boolean(category);
  const dirty = amount !== '0' || Boolean(category) || note !== '' || Boolean(to);
  const catLabel = COMMON_CATS.find((item) => item.id === category)?.label ?? 'Common';

  const goBack = () => navigate(-1);

  const reset = () => {
    setAmount('0');
    setFrom(toISODate());
    setTo('');
    setNote('');
    setPhotoUrl('');
    setPayment('paid');
    setPad(true);
  };

  const onSave = async (again: boolean) => {
    if (!canSave) return;
    setBusy(true);
    try {
      const cat = COMMON_CATS.find((item) => item.id === category);
      addEntries([
        {
          id: nid('ent'),
          title: catLabel,
          subtitle: to ? `Common · ${formatDate(from || toISODate())} – ${formatDate(to)}` : 'Common',
          amount: amountNum,
          kind: 'expense',
          category: cat?.category ?? 'misc',
          date: from || toISODate(),
          pondId: 'common',
          payment,
          mode,
          dueDate: to || undefined,
          note: note.trim() || undefined,
          photoUrl: photoUrl || undefined,
        },
      ]);
      showToast(`₹${formatGrouped(amountNum)} added · ${catLabel}`, 'success', {
        label: 'Undo',
        onClick: () => showToast('Entry undone'),
      });
      if (again) reset();
      else goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-bg">
      <PageHeader
        variant="b"
        title="Add common expense"
        close
        onBack={() => (dirty ? setDiscardOpen(true) : goBack())}
      />

      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-page pb-3 pt-3"
        onFocusCapture={(event) => {
          const tag = (event.target as HTMLElement).tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA') setPad(false);
        }}
      >
        <SegmentedTabs
          tabs={EXPENSE_TABS}
          value="common"
          onChange={(value) => {
            if (value === 'pond') navigate('/add/expense');
          }}
        />
        <AmountDisplay digits={amount} locked={false} onEdit={() => undefined} onActivate={() => setPad(true)} />

        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Category</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CATS.map((item) => {
              const Icon = CATEGORY_ICONS[item.category];
              return (
                <Chip key={item.id} selected={category === item.id} onClick={() => setCategory(item.id)} className="gap-1.5 px-3">
                  <Icon size={16} strokeWidth={ICON.stroke} />
                  {item.label}
                </Chip>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DateField label="From" value={from} onChange={setFrom} />
          <DateField label="To" value={to} onChange={setTo} />
        </div>

        <PaidCreditToggle value={payment} onChange={setPayment} />
        {payment === 'paid' ? <PaymentChips value={mode} onChange={setMode} /> : null}

        <div>
          <p className="mb-2 text-body font-medium text-ink">Bill photo</p>
          <PhotoTile
            url={photoUrl}
            label="Bill"
            onPick={(file) => {
              if (photoUrl) URL.revokeObjectURL(photoUrl);
              setPhotoUrl(file ? URL.createObjectURL(file) : '');
            }}
          />
        </div>
        <TextArea label="Note" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
      </div>

      {pad ? (
        <div className="shrink-0 border-t border-line bg-bg px-page pt-2">
          <Numpad
            compact
            onKey={(key) => setAmount((current) => appendAmount(current, key))}
            onBackspace={() => setAmount((current) => backspaceAmount(current))}
          />
        </div>
      ) : null}
      <AddFooter
        primary="Save expense"
        secondary="Save & add another"
        disabled={!canSave}
        loading={busy}
        onPrimary={() => void onSave(false)}
        onSecondary={() => void onSave(true)}
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

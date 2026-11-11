import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaidCreditToggle } from '@/components/ui/PaidCreditToggle';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { SelectField } from '@/components/ui/SelectField';
import { TextArea } from '@/components/ui/TextArea';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { WORK_DONE } from '@/data/addCatalog';
import { parties, ponds } from '@/data/farm';
import { AddFooter } from '@/features/add/AddFooter';
import { DateChip } from '@/features/add/DateChip';
import {
  NewWorkerSheet,
  WorkerCard,
  WorkerChips,
  workerTotal,
  type WorkerDraft,
} from '@/features/add/LabourCards';
import { PaymentChips } from '@/features/add/PaymentChips';
import { PondMultiChips } from '@/features/add/PondChips';
import { DiscardSheet } from '@/features/ponds/PondSheets';
import { formatINRCompact, toISODate } from '@/lib/format';
import { nid } from '@/lib/api';
import { pickDefaultPond, rememberPond } from '@/services/add';
import { activeCycleFor } from '@/services/ponds';
import type { LabourType, PaymentMode, PaymentStatus, WorkerProfile } from '@/types';

const TYPES = [
  { value: 'wage', label: 'Wage' },
  { value: 'advance', label: 'Advance' },
  { value: 'bonus', label: 'Bonus' },
] as const;

function emptyDraft(worker: WorkerProfile, type: LabourType): WorkerDraft {
  return {
    qty: type === 'wage' ? 1 : 1,
    rate: type === 'wage' ? worker.dailyWage : 0,
    basis: 'day',
    adjust: false,
    open: true,
  };
}

export function LabourPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { showToast } = useUi();
  const { addEntries, addParty } = useLedger();

  const [type, setType] = useState<LabourType>('wage');
  const [allPonds, setAllPonds] = useState(false);
  const [pondIds, setPondIds] = useState<string[]>(() => {
    const id = pickDefaultPond(params.get('pond'));
    return id ? [id] : [];
  });
  const [roster, setRoster] = useState<WorkerProfile[]>(() =>
    parties
      .filter((party) => party.kind === 'worker')
      .map((party) => ({
        id: party.id,
        name: party.name,
        phone: party.phone ?? '',
        role: 'Worker',
        dailyWage: 0,
        advanceOutstanding: 0,
      })),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, WorkerDraft>>({});
  const [work, setWork] = useState('feeding');
  const [date, setDate] = useState(toISODate());
  const [payment, setPayment] = useState<PaymentStatus>('paid');
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [note, setNote] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = useMemo(
    () => selected.reduce((sum, id) => sum + (drafts[id] ? workerTotal(drafts[id]) : 0), 0),
    [selected, drafts],
  );

  const pondLabel = allPonds
    ? 'all ponds'
    : pondIds.length === 1
      ? (ponds.find((p) => p.id === pondIds[0])?.name ?? 'Pond')
      : `${pondIds.length} ponds`;

  const dirty = selected.length > 0 || note !== '';
  const canSave = selected.length > 0 && total > 0 && (allPonds || pondIds.length > 0);

  const goBack = () => navigate(-1);

  const toggleWorker = (id: string) => {
    const worker = roster.find((w) => w.id === id);
    if (!worker) return;
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      setDrafts((d) => ({ ...d, [id]: d[id] ?? emptyDraft(worker, type) }));
      return [...current, id];
    });
  };

  const resetKeep = () => {
    setSelected([]);
    setDrafts({});
    setNote('');
    setPayment('paid');
    setErrors({});
  };

  const onSave = async (again: boolean) => {
    const next: Record<string, string> = {};
    if (!allPonds && pondIds.length === 0) next.pond = 'Pick a pond';
    if (selected.length === 0) next.workers = 'Select a worker';
    if (total <= 0) next.total = 'Enter wages';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      if (!allPonds && pondIds[0]) rememberPond(pondIds[0]);
      const targetPonds = allPonds ? ponds.map((pond) => pond.id) : pondIds;
      const workLabel = WORK_DONE.find((item) => item.value === work)?.label ?? work;
      addEntries(
        selected.flatMap((workerId) => {
          const worker = roster.find((item) => item.id === workerId);
          const draft = drafts[workerId];
          const amount = draft ? workerTotal(draft) : 0;
          if (!worker || amount <= 0) return [];
          const share = targetPonds.length || 1;
          return (targetPonds.length ? targetPonds : ['common']).map((pondId) => ({
            id: nid('ent'),
            title: worker.name,
            subtitle: `${pondLabel} · ${workLabel}`,
            amount: Math.round(amount / share),
            kind: 'expense' as const,
            category: 'labour' as const,
            date,
            pondId,
            cycleId: pondId === 'common' ? undefined : activeCycleFor(pondId)?.id,
            partyId: worker.id,
            payment,
            mode,
            note: note.trim() || undefined,
          }));
        }),
      );
      showToast(`${formatINRCompact(total)} added to ${pondLabel} · Labour`, 'success', {
        label: 'Undo',
        onClick: () => showToast('Entry undone'),
      });
      if (again) resetKeep();
      else goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title="Labour wages"
        close
        onBack={() => (dirty ? setDiscardOpen(true) : goBack())}
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-page pb-4 pt-3">
        <SegmentedTabs
          tabs={TYPES}
          value={type}
          onChange={(next) => {
            setType(next);
            setDrafts((current) => {
              const copy = { ...current };
              selected.forEach((id) => {
                const worker = roster.find((w) => w.id === id);
                if (worker) copy[id] = emptyDraft(worker, next);
              });
              return copy;
            });
          }}
        />

        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Pond</p>
          <PondMultiChips
            values={pondIds}
            allSelected={allPonds}
            onAll={() => {
              setAllPonds(true);
              setPondIds([]);
            }}
            onToggle={(id) => {
              setAllPonds(false);
              setPondIds((current) =>
                current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
              );
            }}
          />
          {errors.pond ? <p className="mt-1 text-caption text-danger">{errors.pond}</p> : null}
        </div>

        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Workers</p>
          <WorkerChips workers={roster} selected={selected} onToggle={toggleWorker} onNew={() => setNewOpen(true)} />
          {errors.workers ? <p className="mt-1 text-caption text-danger">{errors.workers}</p> : null}
        </div>

        {selected.map((id) => {
          const worker = roster.find((w) => w.id === id);
          const draft = drafts[id];
          if (!worker || !draft) return null;
          return (
            <WorkerCard
              key={id}
              worker={worker}
              type={type}
              draft={draft}
              onChange={(patch) => setDrafts((current) => ({ ...current, [id]: { ...draft, ...patch } }))}
            />
          );
        })}

        <SelectField label="Work done" value={work} options={WORK_DONE} onChange={setWork} />

        <div className="flex items-center gap-3">
          <DateChip value={date} onChange={setDate} />
          <div className="min-w-0 flex-1">
            <PaidCreditToggle value={payment} onChange={setPayment} />
          </div>
        </div>
        {payment === 'paid' ? <PaymentChips value={mode} onChange={setMode} /> : null}
        <TextArea label="Note" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />

        <section className="rounded-card bg-lime-100 p-4">
          <p className="text-caption text-muted">Total</p>
          <p className="text-h2 text-ink">{formatINRCompact(total)}</p>
          {errors.total ? <p className="mt-1 text-caption text-danger">{errors.total}</p> : null}
        </section>
      </div>

      <AddFooter
        primary="Save wages"
        secondary="Save & add another"
        disabled={!canSave}
        loading={busy}
        onPrimary={() => void onSave(false)}
        onSecondary={() => void onSave(true)}
      />

      <NewWorkerSheet
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSave={(worker) => {
          addParty({ id: worker.id, name: worker.name, kind: 'worker', phone: worker.phone });
          setRoster((current) => [...current, worker]);
          setDrafts((current) => ({ ...current, [worker.id]: emptyDraft(worker, type) }));
          setSelected((current) => [...current, worker.id]);
        }}
      />

      <DiscardSheet
        open={discardOpen}
        title="Discard entry?"
        message="This labour entry will not be saved."
        onKeep={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          goBack();
        }}
      />
    </div>
  );
}

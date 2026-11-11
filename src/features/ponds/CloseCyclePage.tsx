import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Chip } from '@/components/ui/Chip';
import { DateField } from '@/components/ui/DateField';
import { InsightBanner } from '@/components/ui/InsightBanner';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormSection } from '@/features/ponds/FormSection';
import { CloseConfirmSheet } from '@/features/ponds/PondDetailSheets';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { closeCycle, cycleLeaseSpan, leaseAmountForDays, loadPondDetail, type CycleExtra, type PondDetailModel } from '@/services/pondDetail';
import { nid } from '@/lib/api';
import { formatINRCompact, toISODate } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import type { CloseReason } from '@/types';

interface DraftCost {
  id: string;
  name: string;
  amount: string;
  units: string;
}

function blankCost(name = ''): DraftCost {
  return { id: nid('cost'), name, amount: '', units: '' };
}

function isPower(name: string): boolean {
  return name.trim().toLowerCase() === 'electricity';
}

const REASONS: { value: CloseReason; label: string }[] = [
  { value: 'full', label: 'Full harvest' },
  { value: 'partial', label: 'Early/partial' },
  { value: 'disease', label: 'Disease loss' },
  { value: 'other', label: 'Other' },
];

export function CloseCyclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { addEntries, addSales } = useLedger();
  const [model, setModel] = useState<PondDetailModel | undefined>();
  const [harvestDate, setHarvestDate] = useState(toISODate());
  const [qty, setQty] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [leaseCycle, setLeaseCycle] = useState(false);
  const [yearlyLease, setYearlyLease] = useState('');
  const [costs, setCosts] = useState<DraftCost[]>([]);
  const [reason, setReason] = useState<CloseReason>('full');
  const [other, setOther] = useState('');
  const [notes, setNotes] = useState('');
  const [dateError, setDateError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [closedProfit, setClosedProfit] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    let alive = true;
    loadPondDetail(id).then((next) => {
      if (!alive || !next) return;
      setModel(next);
      setQty(next.harvestKg ? String(next.harvestKg) : '');
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const saleValue = Number(saleAmount) || 0;
  const alreadySold = model?.sales.reduce((sum, sale) => sum + (Number(sale.netAmount) || 0), 0) ?? 0;
  const span = model ? cycleLeaseSpan(model.cycle.startDate, harvestDate || toISODate()) : { ran: 0, days: 0 };
  const yearlyValue = Number(yearlyLease) || 0;
  const leaseForCycle = leaseCycle ? leaseAmountForDays(yearlyValue, span.days) : 0;
  const extraCosts: CycleExtra[] = costs
    .map((item) => ({
      name: item.name.trim(),
      amount: Number(item.amount) || 0,
      units: isPower(item.name) && item.units.trim() ? Number(item.units) || 0 : undefined,
    }))
    .filter((item) => item.name || item.amount > 0);
  const extrasTotal = extraCosts.reduce((sum, item) => sum + item.amount, 0);
  const closingRevenue = (model?.revenue ?? 0) + saleValue;
  const closingSpent = (model?.spent ?? 0) + leaseForCycle + extrasTotal;
  const closingProfit = closingRevenue - closingSpent;

  const onClose = () => {
    if (!harvestDate) {
      setDateError('This field is required');
      return;
    }
    if (reason === 'full' && saleValue <= 0 && alreadySold <= 0) {
      showToast('Enter the sale amount. Final harvest is saved as a sale.', 'error');
      return;
    }
    if (leaseCycle && yearlyValue <= 0) {
      showToast('Enter the lease per year.', 'error');
      return;
    }
    if (extraCosts.some((item) => !item.name || item.amount <= 0)) {
      showToast('Enter a name and amount for each cost.', 'error');
      return;
    }
    setConfirmOpen(true);
  };

  if (success && model) {
    return (
        <CloseSuccess
        profit={closedProfit}
        onPonds={() => navigate('/ponds')}
        onReport={() => navigate(`/reports?tab=revenue&period=cycle&pond=${model.pond.id}`)}
      />
    );
  }

  const harvested = Number(qty) || 0;
  const fcr = harvested > 0 && model ? (model.feedKg / harvested).toFixed(2) : '—';
  const costPerKg = harvested > 0 && model ? formatINRCompact(closingSpent / harvested) : '—';

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader variant="b" title="Close cycle" subtitle={model ? `Cycle ${model.cycle.number}` : undefined} />

      <div className="flex-1 space-y-5 overflow-y-auto px-page pb-4 pt-4">
        <FormSection title="Harvest details">
          <DateField
            label="Final harvest date*"
            value={harvestDate}
            error={dateError}
            onChange={(value) => {
              setHarvestDate(value);
              if (dateError) setDateError('');
            }}
          />
          <TextField
            label="Total harvested quantity (kg)"
            inputMode="decimal"
            value={qty}
            onChange={(event) => setQty(event.target.value.replace(/[^\d.]/g, ''))}
          />
          <TextField
            label={reason === 'full' ? 'Sale amount (₹)*' : 'Sale amount (₹)'}
            inputMode="decimal"
            value={saleAmount}
            onChange={(event) => setSaleAmount(event.target.value.replace(/[^\d.]/g, ''))}
          />
          {reason === 'full' ? (
            <p className="text-caption text-muted">This harvest is saved as a sale and shows in Revenue.</p>
          ) : null}
          <div>
            <p className="mb-2 text-body font-medium text-ink">Reason for closing</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((item) => (
                <Chip key={item.value} selected={reason === item.value} onClick={() => setReason(item.value)}>
                  {item.label}
                </Chip>
              ))}
            </div>
          </div>
          {reason === 'other' ? (
            <TextField
              label="Other reason"
              placeholder="Tell us why"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
          ) : null}
        </FormSection>

        <FormSection title="Lease">
          <div>
            <p className="mb-2 text-body font-medium text-ink">Is this a lease cycle?</p>
            <div className="flex gap-2">
              <Chip selected={!leaseCycle} onClick={() => setLeaseCycle(false)}>
                No
              </Chip>
              <Chip selected={leaseCycle} onClick={() => setLeaseCycle(true)}>
                Yes
              </Chip>
            </div>
          </div>
          {leaseCycle ? (
            <>
              <TextField
                label="Lease per year (₹)*"
                inputMode="decimal"
                value={yearlyLease}
                onChange={(event) => setYearlyLease(event.target.value.replace(/[^\d.]/g, ''))}
              />
              <p className="text-caption text-muted">
                This cycle ran {span.ran} days. Lease is counted for {span.days} days
                {span.ran > 365 ? ', capped at one year' : ''}. This cycle’s lease is {formatINRCompact(leaseForCycle)}.
              </p>
            </>
          ) : null}
        </FormSection>

        <FormSection title="Other costs">
          <p className="text-body text-ink">Any petrol, electricity, or other costs for this cycle?</p>
          <p className="text-caption text-muted">Enter the amount you paid. Electricity units are optional and do not change the amount.</p>
          <div className="flex flex-wrap gap-2">
            <Chip onClick={() => setCosts((current) => [...current, blankCost('Petrol')])}>Petrol</Chip>
            <Chip onClick={() => setCosts((current) => [...current, blankCost('Electricity')])}>Electricity</Chip>
            <Chip onClick={() => setCosts((current) => [...current, blankCost()])}>Add other</Chip>
          </div>
          {costs.map((cost) => (
            <div key={cost.id} className="space-y-3 rounded-card bg-surface p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <TextField
                    label="Name"
                    value={cost.name}
                    onChange={(event) =>
                      setCosts((current) =>
                        current.map((item) => (item.id === cost.id ? { ...item, name: event.target.value } : item)),
                      )
                    }
                  />
                </div>
                <IconButton label={`Remove ${cost.name || 'cost'}`} tone="ghost" onClick={() => setCosts((current) => current.filter((item) => item.id !== cost.id))}>
                  <Trash2 size={18} strokeWidth={ICON.stroke} />
                </IconButton>
              </div>
              <TextField
                label="Amount (₹)"
                inputMode="decimal"
                value={cost.amount}
                onChange={(event) =>
                  setCosts((current) =>
                    current.map((item) =>
                      item.id === cost.id ? { ...item, amount: event.target.value.replace(/[^\d.]/g, '') } : item,
                    ),
                  )
                }
              />
              {isPower(cost.name) ? (
                <TextField
                  label="Units (optional)"
                  inputMode="decimal"
                  value={cost.units}
                  onChange={(event) =>
                    setCosts((current) =>
                      current.map((item) =>
                        item.id === cost.id ? { ...item, units: event.target.value.replace(/[^\d.]/g, '') } : item,
                      ),
                    )
                  }
                />
              ) : null}
            </div>
          ))}
        </FormSection>

        <FormSection title="Review">
          <Review label="Total expenses" value={model ? formatINRCompact(closingSpent) : '—'} />
          {leaseCycle ? <Review label={`Lease · ${span.days} days`} value={formatINRCompact(leaseForCycle)} /> : null}
          {extraCosts.map((item, index) => (
            <Review key={`${item.name}-${index}`} label={item.name} value={formatINRCompact(item.amount)} />
          ))}
          <Review label="Total revenue" value={model ? formatINRCompact(closingRevenue) : '—'} />
          <Review
            label="Net profit"
            value={model ? formatINRCompact(closingProfit) : '—'}
            tone={closingProfit < 0 ? 'bad' : 'good'}
          />
          <Review label="Cost per kg" value={costPerKg} />
          <Review label="FCR" value={fcr} />
          <Review label="Cycle duration" value={model ? `${span.ran} days` : '—'} />
        </FormSection>

        {model && model.pendingDues > 0 ? (
          <InsightBanner
            tone="warn"
            title={`${formatINRCompact(model.pendingDues)} is still pending from buyers`}
            caption="View dues"
            onClick={() => navigate('/dues')}
          />
        ) : null}

        <FormSection title="Notes">
          <TextArea label="Notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </FormSection>
      </div>

      <div className="shrink-0 space-y-2 border-t border-line bg-bg px-page pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <Button onClick={onClose}>Close cycle & archive</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <CloseConfirmSheet
        open={confirmOpen}
        pondName={model?.pond.name ?? 'this pond'}
        cycleNumber={model?.cycle.number ?? 0}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void closeCycle(id ?? '', harvestDate, closingProfit, Number(qty) || 0, saleValue, leaseForCycle, span.days, extraCosts)
            .then(({ sale, entry, lease, extras }) => {
              if (sale) addSales([sale]);
              const rows = [entry, lease, ...extras].filter((row): row is NonNullable<typeof entry> => Boolean(row));
              if (rows.length > 0) addEntries(rows);
              setClosedProfit(closingProfit);
              setConfirmOpen(false);
              setSuccess(true);
            })
            .catch(() => {
              setConfirmOpen(false);
              showToast('Could not close cycle', 'error');
            });
        }}
      />
    </div>
  );
}

function Review({
  label,
  value,
  tone = 'ink',
}: {
  label: string;
  value: string;
  tone?: 'ink' | 'good' | 'bad';
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body text-ink">{label}</span>
      <span
        className={cn(
          'text-body font-semibold tabular-nums',
          tone === 'good' ? 'text-leaf-500' : tone === 'bad' ? 'text-danger' : 'text-ink',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function CloseSuccess({
  profit,
  onPonds,
  onReport,
}: {
  profit: number;
  onPonds: () => void;
  onReport: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-forest-800 px-page pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(48px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime-300 text-forest-800">
          <Check size={36} strokeWidth={ICON.stroke} />
        </span>
        <h1 className="mt-6 text-display text-white">Cycle closed</h1>
        <div className="mt-6 flex gap-2">
          <span className="rounded-pill bg-white/10 px-4 py-2 text-caption font-semibold text-lime-300">
            Profit {formatINRCompact(profit)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onReport}
        className="pressable flex h-14 w-full items-center justify-center rounded-pill bg-white text-title text-forest-800"
      >
        View report
      </button>
      <button
        type="button"
        onClick={onPonds}
        className="pressable mt-2 flex min-h-touch w-full items-center justify-center text-title text-white"
      >
        Back to ponds
      </button>
    </div>
  );
}

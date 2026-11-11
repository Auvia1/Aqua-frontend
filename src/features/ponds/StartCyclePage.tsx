import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { SelectField } from '@/components/ui/SelectField';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { FormSection } from '@/features/ponds/FormSection';
import { StartCycleFeedFields, StartCycleSeedFields } from '@/features/ponds/StartCycleFields';
import { AddHatcherySheet, AddVendorSheet } from '@/features/ponds/PondSheets';
import { REQUIRED, parsePositive } from '@/features/ponds/formModel';
import { farm } from '@/data/farm';
import { nid } from '@/lib/api';
import { APP_TODAY, formatArea, formatINRCompact, toISODate } from '@/lib/format';
import {
  SPECIES_OPTIONS,
  SHRIMP_SPECIES,
  hatcheries as seedHatcheries,
  loadPond,
  nextCycleNumber,
  startCycle,
} from '@/services/ponds';
import type { Pond, SeedUnit, SpeciesId } from '@/types';

export function StartCyclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { addParty, parties } = useLedger();
  const [pond, setPond] = useState<Pond | undefined>();
  const vendors = parties
    .filter((party) => party.kind === 'vendor')
    .map((party) => ({ value: party.id, label: party.name }));
  const [cycleName, setCycleName] = useState('');
  const [species, setSpecies] = useState<SpeciesId | ''>('');
  const [stocking, setStocking] = useState(toISODate());
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<SeedUnit>('pieces');
  const [hatchery, setHatchery] = useState('');
  const [sources, setSources] = useState<{ value: string; label: string }[]>(() =>
    seedHatcheries.map((item) => ({ value: item.id, label: item.name })),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [batch, setBatch] = useState('');
  const [feedBrand, setFeedBrand] = useState('cp');
  const [feedSize, setFeedSize] = useState('2mm');
  const [feedBag, setFeedBag] = useState('25');
  const [feedPrice, setFeedPrice] = useState('');
  const [feedVendorId, setFeedVendorId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    let alive = true;
    loadPond(id).then((next) => {
      if (!alive || !next) return;
      setPond(next);
      const cycleNo = nextCycleNumber(next);
      setCycleName(`${next.name} · Cycle ${cycleNo} · ${format(APP_TODAY, 'MMM yyyy')}`);
      const first = next.speciesIds?.[0];
      if (first && first !== 'other') setSpecies(first);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const goPond = () => navigate(`/ponds/${id ?? ''}`, { replace: true });

  const onSubmit = async () => {
    const next: Record<string, string> = {};
    if (!species) next.species = REQUIRED;
    if (!stocking) next.stocking = REQUIRED;
    const quantity = parsePositive(qty);
    if (qty.trim() === '') next.qty = REQUIRED;
    if (qty.trim() && (quantity == null || quantity <= 0)) next.qty = 'Enter a quantity greater than 0';
    if (!feedVendorId) next.feedVendor = REQUIRED;
    const bagWeight = parsePositive(feedBag);
    if (!bagWeight || bagWeight <= 0) next.feedBag = 'Enter bag weight';
    const bagPrice = parsePositive(feedPrice);
    if (!bagPrice || bagPrice <= 0) next.feedPrice = 'Enter price per bag';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      showToast('Fill species, stocking date and feed plan', 'error');
      return;
    }
    const current = pond ?? (id ? await loadPond(id) : undefined);
    if (!current || !species) {
      showToast('Pond not found', 'error');
      return;
    }
    setBusy(true);
    try {
      const number = nextCycleNumber(current);
      const days = SHRIMP_SPECIES.has(species) ? 110 : 180;
      const speciesLabel = SPECIES_OPTIONS.find((item) => item.id === species)?.label ?? species;
      const cycle = {
        id: nid('cycle'),
        pondId: current.id,
        number,
        species: speciesLabel,
        status: 'active' as const,
        startDate: stocking,
        expectedDays: days,
        feedVendorId,
        feedBrand,
        feedSize,
        feedBagWeight: bagWeight ?? undefined,
        feedPricePerBag: bagPrice ?? undefined,
        feedPayment: 'paid' as const,
      };
      await startCycle({
        pond: {
          ...current,
          status: 'active',
          species: speciesLabel,
          speciesIds: species === 'other' ? current.speciesIds ?? [] : [species],
          cycleDay: 1,
          cycleLength: days,
          cycleNumber: number,
        },
        cycle,
      });
      showToast('Cycle started', 'success');
      goPond();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not start cycle', 'error');
    } finally {
      setBusy(false);
    }
  };

  const lastCycle =
    pond?.lastCycleNumber != null
      ? `Last cycle: Cycle ${pond.lastCycleNumber}, profit ${formatINRCompact(pond.lastCycleProfit ?? 0)}`
      : 'Last cycle: —';

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader variant="b" title="Start new cycle" />

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-page pb-4 pt-4">
        <div className="rounded-card bg-card p-4 shadow-soft">
          <p className="text-title text-ink">{pond?.name ?? 'Pond'}</p>
          <p className="mt-1 text-caption text-muted">{pond ? formatArea(pond.areaAcres, farm.areaUnit) : '—'}</p>
          <p className="mt-1 text-caption text-muted">{lastCycle}</p>
        </div>

        <FormSection title="Cycle">
          <TextField label="Cycle name" value={cycleName} onChange={(event) => setCycleName(event.target.value)} />
          <SelectField
            label="Species*"
            placeholder="Select species"
            value={species}
            error={errors.species}
            onChange={(value) => {
              setSpecies(value as SpeciesId);
              if (errors.species) setErrors((current) => ({ ...current, species: '' }));
            }}
            options={SPECIES_OPTIONS.filter((item) => item.id !== 'other').map((item) => ({
              value: item.id,
              label: item.label,
            }))}
          />
          <DateField
            label="Stocking date*"
            value={stocking}
            error={errors.stocking}
            onChange={(value) => {
              setStocking(value);
              if (errors.stocking) setErrors((current) => ({ ...current, stocking: '' }));
            }}
          />
        </FormSection>

        <StartCycleSeedFields
          qty={qty}
          unit={unit}
          hatchery={hatchery}
          sources={sources}
          batch={batch}
          errors={errors}
          onQty={(value) => {
            setQty(value);
            if (errors.qty) setErrors((current) => ({ ...current, qty: '' }));
          }}
          onUnit={setUnit}
          onHatchery={setHatchery}
          onAddHatchery={() => setAddOpen(true)}
          onBatch={setBatch}
        />
        <StartCycleFeedFields
          brand={feedBrand}
          size={feedSize}
          bagWeight={feedBag}
          price={feedPrice}
          vendorId={feedVendorId}
          vendors={vendors}
          errors={errors}
          onBrand={setFeedBrand}
          onSize={setFeedSize}
          onBagWeight={(value) => {
            setFeedBag(value);
            if (errors.feedBag) setErrors((current) => ({ ...current, feedBag: '' }));
          }}
          onPrice={(value) => {
            setFeedPrice(value);
            if (errors.feedPrice) setErrors((current) => ({ ...current, feedPrice: '' }));
          }}
          onVendor={(value) => {
            setFeedVendorId(value);
            if (errors.feedVendor) setErrors((current) => ({ ...current, feedVendor: '' }));
          }}
          onAddVendor={() => setVendorOpen(true)}
        />
        <FormSection title="Notes">
          <TextArea
            label="Notes"
            rows={3}
            placeholder="Stocking notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </FormSection>
      </div>

      <div className="shrink-0 space-y-2 border-t border-line bg-bg px-page pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <Button loading={busy} onClick={() => void onSubmit()}>
          Start cycle
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <AddHatcherySheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(name) => {
          const value = nid('hatch');
          setSources((current) => [...current, { value, label: name }]);
          setHatchery(value);
          setAddOpen(false);
        }}
      />
      <AddVendorSheet
        open={vendorOpen}
        onClose={() => setVendorOpen(false)}
        onAdd={(name) => {
          const vendorId = nid('vendor');
          addParty({ id: vendorId, name, kind: 'vendor' });
          setFeedVendorId(vendorId);
          if (errors.feedVendor) setErrors((current) => ({ ...current, feedVendor: '' }));
          setVendorOpen(false);
        }}
      />
    </div>
  );
}

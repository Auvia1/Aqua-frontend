import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Chip } from '@/components/ui/Chip';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { feedLogs } from '@/data/feedLogs';
import { DEFAULT_MEALS, feedBrandLabel } from '@/data/addCatalog';
import { ponds } from '@/data/farm';
import { AddFooter } from '@/features/add/AddFooter';
import { DateChip } from '@/features/add/DateChip';
import { FeedMeals, type MealRow } from '@/features/add/FeedMeals';
import { FeedPlanCard, formatPerKg } from '@/features/add/FeedPlanCard';
import { PondChips } from '@/features/add/PondChips';
import { DiscardSheet } from '@/features/ponds/PondSheets';
import { formatDate, formatINRCompact, toISODate } from '@/lib/format';
import { nid } from '@/lib/api';
import { nextActivePond, pickDefaultPond, rememberPond } from '@/services/add';
import { mealsToCopy, rememberMeals } from '@/services/feedMeals';
import { activeCycleFor, cycleFeedPlan, saveCycle } from '@/services/ponds';
import { saveFeedLogs } from '@/services/remote';

export function FeedPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { showToast } = useUi();
  const { addEntries } = useLedger();

  const [pondId, setPondId] = useState(() => pickDefaultPond(params.get('pond')));
  const [date, setDate] = useState(toISODate());
  const [meals, setMeals] = useState<MealRow[]>(DEFAULT_MEALS.map((meal) => ({ ...meal })));
  const [rateOverride, setRateOverride] = useState<{ pondId: string; rate: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const cycle = activeCycleFor(pondId);
  const savedPlan = cycleFeedPlan(cycle);
  const perKg = rateOverride?.pondId === pondId ? rateOverride.rate : (savedPlan?.perKg ?? 0);
  const totalKg = meals.reduce((sum, meal) => sum + meal.kg, 0);
  const cost = perKg > 0 ? Math.round(totalKg * perKg) : 0;
  const previous = feedLogs.find((log) => log.pondId === pondId && log.date.slice(0, 10) < date);
  const yesterdayKg = previous?.kg ?? 0;
  const delta = yesterdayKg > 0 && totalKg > 0 ? Math.round(((totalKg - yesterdayKg) / yesterdayKg) * 100) : 0;
  const pondName = ponds.find((pond) => pond.id === pondId)?.name ?? 'Pond';
  const brandLabel = feedBrandLabel(savedPlan?.brand ?? '');
  const dirty = totalKg > 0;
  const canSave = Boolean(pondId) && totalKg > 0 && perKg > 0;

  const goBack = () => navigate(-1);

  const copyYesterday = () => {
    const copied = mealsToCopy(pondId, date);
    if (!copied) {
      showToast('No feed logged for yesterday');
      return;
    }
    setMeals(copied.meals.map((meal) => ({ ...meal })));
    showToast(copied.fromYesterday ? "Copied yesterday's meals" : `Copied meals from ${formatDate(copied.sourceDate)}`);
  };

  const savePrice = async (rate: number) => {
    if (!cycle) {
      showToast('Start a cycle on this pond first', 'error');
      return false;
    }
    try {
      const bag = Number(cycle.feedBagWeight) > 0 ? Number(cycle.feedBagWeight) : 1;
      await saveCycle({
        ...cycle,
        feedBagWeight: bag,
        feedPricePerBag: Math.round(rate * bag * 100) / 100,
      });
      setRateOverride({ pondId, rate });
      showToast('Feed price updated');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save price', 'error');
      return false;
    }
  };

  const addOldFeed = async (input: { kg: number; rate: number; date: string }) => {
    if (!cycle) {
      showToast('Start a cycle on this pond first', 'error');
      return false;
    }
    try {
      const amount = Math.round(input.kg * input.rate);
      addEntries([
        {
          id: nid('ent'),
          title: 'Old feed',
          subtitle: pondName,
          amount,
          kind: 'expense',
          category: 'feed',
          date: input.date,
          pondId,
          cycleId: cycle.id,
          payment: 'paid',
          qty: input.kg,
          unit: 'kg',
          rate: input.rate,
        },
      ]);
      const log = {
        id: nid('feed'),
        pondId,
        cycleId: cycle.id,
        date: input.date,
        meals: 0,
        kg: input.kg,
        cost: amount,
      };
      feedLogs.unshift(log);
      saveFeedLogs([log]);
      showToast(`${input.kg} kg added · ${formatINRCompact(amount)}`, 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not add feed', 'error');
      return false;
    }
  };

  const onSave = async (nextPond: boolean) => {
    if (!canSave) return;
    setBusy(true);
    try {
      rememberPond(pondId);
      const size = savedPlan?.size ?? '';
      const feedTitle = brandLabel ? `Feed · ${brandLabel}${size ? ` ${size}` : ''}` : size ? `Feed · ${size}` : 'Feed';
      addEntries([
        {
          id: nid('ent'),
          title: feedTitle,
          subtitle: pondName,
          amount: cost || 0,
          kind: 'expense',
          category: 'feed',
          date,
          pondId,
          cycleId: cycle?.id,
          partyId: savedPlan?.vendorId || undefined,
          payment: savedPlan?.payment ?? 'paid',
          qty: totalKg,
          unit: 'kg',
          rate: perKg,
        },
      ]);
      const rows = meals.map((meal) => ({ time: meal.time, kg: meal.kg }));
      const log = {
        id: nid('feed'),
        pondId,
        cycleId: cycle?.id ?? 'none',
        date,
        meals: meals.filter((meal) => meal.kg > 0).length,
        kg: totalKg,
        cost: cost || 0,
        rows,
      };
      feedLogs.unshift(log);
      saveFeedLogs([log]);
      rememberMeals(pondId, date, rows);
      showToast(`${formatINRCompact(cost || 0)} feed logged · ${pondName}`, 'success');
      if (nextPond) {
        const next = nextActivePond(pondId);
        setPondId(next);
        rememberPond(next);
        setMeals(DEFAULT_MEALS.map((meal) => ({ ...meal })));
      } else {
        goBack();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save feed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title="Daily feed"
        close
        onBack={() => (dirty ? setDiscardOpen(true) : goBack())}
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-page pb-4 pt-3">
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Pond</p>
          <PondChips
            value={pondId}
            onChange={(id) => {
              setPondId(id);
              rememberPond(id);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <DateChip value={date} onChange={setDate} />
          <Chip onClick={copyYesterday}>Copy yesterday</Chip>
        </div>

        <FeedPlanCard perKg={perKg} onSavePrice={savePrice} onAddOld={addOldFeed} />

        <FeedMeals meals={meals} onChange={setMeals} />

        <section className="rounded-card bg-lime-100 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-caption text-muted">Total today</p>
              <p className="text-h2 text-ink">{totalKg} kg</p>
            </div>
            <div className="text-right">
              <p className="text-caption text-muted">Cost</p>
              <p className="text-h2 text-ink">{formatINRCompact(cost)}</p>
            </div>
          </div>
          {perKg > 0 ? (
            <p className="mt-2 text-caption text-muted">₹{formatPerKg(perKg)} per kg</p>
          ) : (
            <p className="mt-2 text-caption text-danger">Set a price per kg</p>
          )}
          {yesterdayKg > 0 && totalKg > 0 && delta !== 0 ? (
            <span className="mt-2 inline-flex rounded-pill bg-white/70 px-3 py-1 text-caption font-semibold text-forest-800">
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last log
            </span>
          ) : null}
        </section>
      </div>

      <AddFooter
        primary="Save feed entry"
        secondary="Save & next pond"
        disabled={!canSave}
        loading={busy}
        onPrimary={() => void onSave(false)}
        onSecondary={() => void onSave(true)}
      />

      <DiscardSheet
        open={discardOpen}
        title="Discard entry?"
        message="This feed log will not be saved."
        onKeep={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          goBack();
        }}
      />
    </div>
  );
}

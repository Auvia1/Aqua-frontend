import { differenceInCalendarDays } from 'date-fns';
import { cycles } from '@/data/cycles';
import { entries } from '@/data/entries';
import { farm, hatcheries, ponds as allPonds } from '@/data/farm';
import { APP_TODAY, parseISODate } from '@/lib/format';
import { savePonds, upsertRows } from '@/services/remote';
import type { CropCycle, Farm, LedgerEntry, PaymentStatus, Pond, PondListFilter, PondSort } from '@/types';

export interface PondListItem {
  pond: Pond;
  spent: number;
  revenue: number;
  profit: number;
}

export interface PondListModel {
  farm: Farm;
  items: PondListItem[];
}

export const SPECIES_OPTIONS = [
  { id: 'vannamei', label: 'Vannamei' },
  { id: 'black_tiger', label: 'Black tiger' },
  { id: 'rohu', label: 'Rohu' },
  { id: 'catla', label: 'Catla' },
  { id: 'pangasius', label: 'Pangasius' },
  { id: 'tilapia', label: 'Tilapia' },
  { id: 'other', label: 'Other' },
] as const;

export const WATER_SOURCES = [
  { value: 'canal', label: 'Canal' },
  { value: 'borewell', label: 'Borewell' },
  { value: 'sea_creek', label: 'Sea creek' },
  { value: 'river', label: 'River' },
  { value: 'other', label: 'Other' },
] as const;

export const SHRIMP_SPECIES = new Set(['vannamei', 'black_tiger']);

export function isInactivePond(pond: Pond): boolean {
  return pond.status !== 'active';
}

export function speciesLabel(pond: Pond): string {
  const ids = pond.speciesIds ?? [];
  if (ids.includes('vannamei')) return 'Vannamei';
  if (ids.includes('black_tiger')) return 'Black tiger';
  if (ids.includes('rohu') && ids.includes('catla')) return 'Rohu + Catla';
  if (ids.includes('rohu')) return 'Rohu';
  if (pond.otherSpecies) return pond.otherSpecies;
  return pond.species;
}

export function nextCycleNumber(pond: Pond): number {
  if (pond.status === 'active' && pond.cycleNumber) return pond.cycleNumber + 1;
  if (pond.lastCycleNumber) return pond.lastCycleNumber + 1;
  return (pond.cycleNumber ?? 0) + 1;
}

/** A just-started cycle does not inherit same-day spend from before it began. */
export function entryBelongsToCycle(
  entry: LedgerEntry,
  cycle: CropCycle,
  pondCycles: CropCycle[] = cycles,
): boolean {
  if (entry.pondId !== cycle.pondId) return false;
  if (entry.cycleId) return entry.cycleId === cycle.id;
  const covering = pondCycles
    .filter((item) => item.pondId === cycle.pondId)
    .filter((item) => entry.date >= item.startDate && (!item.endDate || entry.date <= item.endDate))
    .sort((a, b) => a.number - b.number);
  if (covering.length === 0) return false;
  const startedThisDay = covering.filter((item) => item.startDate === entry.date);
  const newestStart = startedThisDay[startedThisDay.length - 1];
  if (newestStart) {
    const previous = covering.find((item) => item.number < newestStart.number);
    const ownerId = previous?.id ?? (newestStart.number === 1 ? newestStart.id : undefined);
    return ownerId === cycle.id;
  }
  return covering[covering.length - 1]?.id === cycle.id;
}

function latestCycle(pondId: string): CropCycle | undefined {
  return [...cycles.filter((cycle) => cycle.pondId === pondId)].sort((a, b) => b.number - a.number)[0];
}

function totalsFor(pondId: string): { spent: number; revenue: number; profit: number } {
  const pondCycles = cycles.filter((item) => item.pondId === pondId);
  const cycle = pondCycles.find((item) => item.status === 'active') ?? latestCycle(pondId);
  const list = entries.filter((entry) =>
    cycle ? entryBelongsToCycle(entry, cycle, pondCycles) : entry.pondId === pondId,
  );
  const spent = list.filter((entry) => entry.kind === 'expense').reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const revenue = list.filter((entry) => entry.kind === 'revenue').reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  return { spent, revenue, profit: revenue - spent };
}

export function toListItem(pond: Pond): PondListItem {
  return { pond, ...totalsFor(pond.id) };
}

export async function loadPondsPage(): Promise<PondListModel> {
  return {
    farm,
    items: allPonds.map(toListItem),
  };
}

export async function loadPond(id: string): Promise<Pond | undefined> {
  return allPonds.find((pond) => pond.id === id);
}

function putPond(pond: Pond): void {
  const index = allPonds.findIndex((item) => item.id === pond.id);
  if (index >= 0) allPonds[index] = pond;
  else allPonds.push(pond);
  savePonds([pond]);
}

export async function savePond(pond: Pond): Promise<void> {
  putPond(pond);
}

export async function archivePond(id?: string): Promise<void> {
  const pond = allPonds.find((item) => item.id === id);
  if (!pond) return;
  putPond({ ...pond, status: 'idle' });
}

export async function startCycle(input: { pond: Pond; cycle: CropCycle }): Promise<void> {
  const closed = cycles
    .filter((item) => item.pondId === input.cycle.pondId && item.status === 'active' && item.id !== input.cycle.id)
    .map((item) => ({
      ...item,
      status: 'closed' as const,
      endDate: item.endDate ?? input.cycle.startDate,
    }));
  await Promise.all([upsertRows('ponds', [input.pond]), upsertRows('cycles', [...closed, input.cycle])]);
  const pondIndex = allPonds.findIndex((item) => item.id === input.pond.id);
  if (pondIndex >= 0) allPonds[pondIndex] = input.pond;
  else allPonds.push(input.pond);
  closed.forEach(putCycle);
  putCycle(input.cycle);
}

export function activeCycleFor(pondId: string): CropCycle | undefined {
  return cycles.find((item) => item.pondId === pondId && item.status === 'active');
}

export function expenseOnOpenCycle(entry: LedgerEntry): boolean {
  if (entry.kind !== 'expense' || entry.pondId === 'common') return false;
  const pondCycles = cycles.filter((item) => item.pondId === entry.pondId);
  if (entry.cycleId) return pondCycles.some((item) => item.id === entry.cycleId && item.status === 'active');
  const active = pondCycles.find((item) => item.status === 'active');
  return Boolean(active && entryBelongsToCycle(entry, active, pondCycles));
}

export function cycleFeedPlan(cycle?: CropCycle): {
  vendorId: string;
  brand: string;
  size: string;
  bagWeight: number;
  pricePerBag: number;
  payment: PaymentStatus;
  perKg: number;
} | null {
  if (!cycle) return null;
  const bagWeight = Number(cycle.feedBagWeight) || 0;
  const pricePerBag = Number(cycle.feedPricePerBag) || 0;
  if (bagWeight <= 0 || pricePerBag <= 0) return null;
  return {
    vendorId: cycle.feedVendorId ?? '',
    brand: cycle.feedBrand || 'cp',
    size: cycle.feedSize || '2mm',
    bagWeight,
    pricePerBag,
    payment: cycle.feedPayment === 'credit' ? 'credit' : 'paid',
    perKg: pricePerBag / bagWeight,
  };
}

function putCycle(cycle: CropCycle): void {
  const index = cycles.findIndex((item) => item.id === cycle.id);
  if (index >= 0) cycles[index] = cycle;
  else cycles.push(cycle);
}

export async function saveCycle(cycle: CropCycle): Promise<void> {
  await upsertRows('cycles', [cycle]);
  putCycle(cycle);
}

export function filterPonds(
  items: PondListItem[],
  filter: PondListFilter,
  query: string,
  sort: PondSort,
): PondListItem[] {
  const needle = query.trim().toLowerCase();
  const next = items.filter(({ pond }) => {
    if (filter !== 'all' && pond.status !== filter) return false;
    if (!needle) return true;
    const haystack = `${pond.name} ${pond.species} ${speciesLabel(pond)} ${pond.code ?? ''}`.toLowerCase();
    return haystack.includes(needle);
  });

  next.sort((a, b) => {
    if (sort === 'spend') return b.spent - a.spent;
    if (sort === 'cycle') return (b.pond.cycleDay ?? -1) - (a.pond.cycleDay ?? -1);
    return a.pond.name.localeCompare(b.pond.name);
  });

  return next;
}

export interface LeaseDue {
  pondId: string;
  pondName: string;
  date: string;
  days: number;
  amount: number;
}

export function leaseDues(list: Pond[] = allPonds): LeaseDue[] {
  return list
    .filter((pond) => pond.leased && pond.leaseEndDate)
    .map((pond) => ({
      pondId: pond.id,
      pondName: pond.name,
      date: pond.leaseEndDate as string,
      days: differenceInCalendarDays(parseISODate(pond.leaseEndDate as string), APP_TODAY),
      amount: pond.leaseAmountYear ?? 0,
    }))
    .sort((a, b) => a.days - b.days);
}

export function nextLeaseDue(withinDays = 45, list: Pond[] = allPonds): LeaseDue | undefined {
  return leaseDues(list).find((item) => item.days <= withinDays);
}

export { hatcheries };

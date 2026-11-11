import { differenceInCalendarDays, format } from 'date-fns';
import { CATEGORY_BY_ID } from '@/data/categories';
import { cycles } from '@/data/cycles';
import { entries as allEntries } from '@/data/entries';
import { farm, ponds } from '@/data/farm';
import { feedLogs } from '@/data/feedLogs';
import { harvestSales } from '@/data/sales';
import { nid } from '@/lib/api';
import { APP_TODAY, parseISODate } from '@/lib/format';
import { entryBelongsToCycle } from '@/services/ponds';
import { upsertRows } from '@/services/remote';
import type {
  BarPoint,
  CategoryId,
  ChartSlice,
  CropCycle,
  ExpenseChip,
  FeedLog,
  HarvestSale,
  LedgerEntry,
  Pond,
} from '@/types';

const DONUT_ORDER = ['feed', 'medicine', 'labour', 'seed', 'transport'] as const;
const DONUT_COLOR: Record<string, string> = {
  Feed: '#164232',
  Medicine: '#4E9A6B',
  Labour: '#1E5640',
  Seed: '#6FB584',
  Transport: '#9CC9A8',
  Others: '#C9DFC6',
};

const PLACEHOLDER_CYCLE = {
  id: 'none',
  pondId: '',
  number: 0,
  species: '',
  status: 'closed' as const,
  startDate: '2026-01-01',
  expectedDays: 0,
};

export interface CategoryRow {
  key: string;
  name: string;
  amount: number;
  percent: number;
  color: string;
  category?: CategoryId;
}

export interface PondDetailModel {
  pond: Pond;
  cycles: CropCycle[];
  cycle: CropCycle;
  closed: boolean;
  idle: boolean;
  spent: number;
  revenue: number;
  profit: number;
  allocatedCommon: number;
  netProfit: number;
  harvestKg: number;
  costPerKg: number | null;
  costPerKgEstimated: boolean;
  changePercent: number;
  dayNumber: number;
  feedKg: number;
  feedPerDay: number;
  feedCost: number;
  feedShare: number;
  spendPerAcre: number;
  fcr: number | null;
  pendingDues: number;
  slices: ChartSlice[];
  categoryRows: CategoryRow[];
  entries: LedgerEntry[];
  extraEntries: LedgerEntry[];
  feedDays: FeedLog[];
  feedChart: BarPoint[];
  sales: HarvestSale[];
}

function extraEntriesFor(): LedgerEntry[] {
  return [];
}

export function defaultCycleId(pondId: string): string | undefined {
  const list = cycles.filter((cycle) => cycle.pondId === pondId);
  return (list.find((cycle) => cycle.status === 'active') ?? list[list.length - 1])?.id;
}

export function buildPondDetail(
  pondId: string,
  cycleId?: string,
  source: LedgerEntry[] = allEntries,
  salesSource: HarvestSale[] = harvestSales,
): PondDetailModel | undefined {
  const pond = ponds.find((item) => item.id === pondId);
  if (!pond) return undefined;
  const pondCycles = cycles
    .filter((cycle) => cycle.pondId === pondId)
    .sort((a, b) => b.number - a.number);
  const cycle =
    pondCycles.find((item) => item.id === cycleId) ??
    pondCycles.find((item) => item.status === 'active') ??
    pondCycles[0] ??
    { ...PLACEHOLDER_CYCLE, pondId, species: pond.species };

  const pondEntries = source.filter((entry) => entryBelongsToCycle(entry, cycle, pondCycles));
  const spent = pondEntries
    .filter((entry) => entry.kind === 'expense')
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const revenue = pondEntries
    .filter((entry) => entry.kind === 'revenue')
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const allocatedCommon = 0;
  const profit = revenue - spent;
  const netProfit = revenue - spent;

  const taggedSales = salesSource.filter((sale) => {
    if (sale.pondId !== pondId) return false;
    if (sale.cycleId && sale.cycleId !== 'none') return sale.cycleId === cycle.id;
    return entryBelongsToCycle(
      {
        id: sale.id,
        title: 'Sale',
        subtitle: '',
        amount: Number(sale.netAmount) || 0,
        kind: 'revenue',
        category: 'revenue',
        date: String(sale.date).slice(0, 10),
        pondId: sale.pondId,
        payment: 'paid',
      },
      cycle,
      pondCycles,
    );
  });
  const revenueSales = pondEntries
    .filter((entry) => entry.kind === 'revenue')
    .filter((entry) => !taggedSales.some((sale) => sale.id === entry.id || (sale.date === entry.date && sale.netAmount === Number(entry.amount))))
    .map((entry) => ({
      id: entry.id,
      pondId: String(entry.pondId),
      cycleId: cycle.id,
      date: entry.date,
      buyer: (entry.title || 'Sale').replace(/^Sale · /, ''),
      qtyKg: Number(entry.qty) || 0,
      countSize: '',
      ratePerKg: Number(entry.rate) || 0,
      netAmount: Number(entry.amount) || 0,
      receivedAmount: entry.payment === 'paid' ? Number(entry.amount) || 0 : 0,
      dueDate: entry.dueDate,
    }));
  const sales = [...taggedSales, ...revenueSales];
  const harvestKg = sales.reduce((sum, sale) => sum + (Number(sale.qtyKg) || 0), 0);
  const pendingDues = sales.reduce(
    (sum, sale) => sum + Math.max((Number(sale.netAmount) || 0) - (Number(sale.receivedAmount) || 0), 0),
    0,
  );
  const costPerKg = harvestKg > 0 ? spent / harvestKg : null;

  const previous = pondCycles.find((item) => item.number === cycle.number - 1);
  const priorProfit = previous?.recordedProfit ?? 0;
  const changePercent =
    spent === 0 && revenue === 0
      ? 0
      : priorProfit === 0
        ? 0
        : ((netProfit - priorProfit) / Math.abs(priorProfit)) * 100;

  const dayNumber =
    cycle.status === 'active' && pond.cycleNumber === cycle.number && pond.cycleDay
      ? pond.cycleDay
      : differenceInCalendarDays(cycle.endDate ? parseISODate(cycle.endDate) : APP_TODAY, parseISODate(cycle.startDate)) + 1;

  const feedDays = feedLogs.filter((log) => log.pondId === pondId && log.cycleId === cycle.id);
  const feedKg = feedDays.reduce((sum, log) => sum + log.kg, 0);
  const feedCost = pondEntries.filter((entry) => entry.category === 'feed').reduce((sum, entry) => sum + entry.amount, 0)
    || feedDays.reduce((sum, log) => sum + log.cost, 0);
  const feedPerDay = feedDays.length === 0 ? 0 : feedKg / feedDays.length;
  const feedShare = spent === 0 ? 0 : (pondEntries.filter((e) => e.category === 'feed').reduce((s, e) => s + e.amount, 0) / spent) * 100;
  const spendPerAcre = pond.areaAcres === 0 ? 0 : spent / pond.areaAcres;
  const fcr = harvestKg > 0 ? feedKg / harvestKg : null;

  const byCat = new Map<string, number>();
  pondEntries
    .filter((entry) => entry.kind === 'expense')
    .forEach((entry) => {
      const bucket = (DONUT_ORDER as readonly string[]).includes(entry.category)
        ? CATEGORY_BY_ID[entry.category].label
        : 'Others';
      byCat.set(bucket, (byCat.get(bucket) ?? 0) + entry.amount);
    });
  const slices: ChartSlice[] = [...DONUT_ORDER.map((id) => CATEGORY_BY_ID[id].label), 'Others']
    .map((name) => ({ name, value: byCat.get(name) ?? 0, color: DONUT_COLOR[name] ?? '#C9DFC6' }))
    .filter((slice) => slice.value > 0);
  const categoryRows: CategoryRow[] = slices.map((slice) => ({
    key: slice.name.toLowerCase(),
    name: slice.name,
    amount: slice.value,
    percent: spent === 0 ? 0 : Math.round((slice.value / spent) * 100),
    color: slice.color,
    category: DONUT_ORDER.find((id) => CATEGORY_BY_ID[id].label === slice.name),
  }));

  const last14 = feedDays.slice(-14);
  const feedChart: BarPoint[] = last14.map((log) => ({
    label: format(parseISODate(log.date), 'd'),
    value: log.kg,
  }));

  const displayedProfit =
    cycle.status === 'closed' && pondEntries.length === 0 && cycle.recordedProfit != null
      ? cycle.recordedProfit
      : netProfit;

  return {
    pond,
    cycles: pondCycles,
    cycle,
    closed: cycle.status === 'closed',
    idle: pond.status !== 'active',
    spent,
    revenue,
    profit,
    allocatedCommon,
    netProfit: displayedProfit,
    harvestKg,
    costPerKg,
    costPerKgEstimated: harvestKg > 0 && cycle.status === 'active',
    changePercent,
    dayNumber,
    feedKg,
    feedPerDay,
    feedCost,
    feedShare,
    spendPerAcre,
    fcr,
    pendingDues,
    slices,
    categoryRows,
    entries: [...pondEntries].sort((a, b) => b.date.localeCompare(a.date)),
    extraEntries: extraEntriesFor(),
    feedDays: [...feedDays].sort((a, b) => b.date.localeCompare(a.date)),
    feedChart,
    sales,
  };
}

export async function loadPondDetail(
  pondId: string,
  cycleId?: string,
  source: LedgerEntry[] = allEntries,
  salesSource: HarvestSale[] = harvestSales,
): Promise<PondDetailModel | undefined> {
  return buildPondDetail(pondId, cycleId, source, salesSource);
}

export function cycleLeaseSpan(startIso: string, endIso: string): { ran: number; days: number } {
  const start = parseISODate(startIso);
  const end = parseISODate(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { ran: 1, days: 1 };
  const ran = Math.max(1, differenceInCalendarDays(end, start) + 1);
  return { ran, days: Math.min(ran, 365) };
}

export function leaseAmountForDays(yearly: number, days: number): number {
  const year = Math.max(0, Number(yearly) || 0);
  const used = Math.min(365, Math.max(0, days));
  if (year === 0 || used === 0) return 0;
  return Math.round((year * used) / 365);
}

export interface CycleExtra {
  name: string;
  amount: number;
  units?: number;
}

function categoryForExtra(name: string): CategoryId {
  const key = name.trim().toLowerCase();
  if (key === 'electricity') return 'electricity';
  if (key === 'petrol' || key === 'diesel' || key === 'fuel') return 'fuel';
  return 'misc';
}

export async function closeCycle(
  pondId: string,
  harvestDate: string,
  profit = 0,
  harvestQtyKg = 0,
  saleAmount = 0,
  leaseAmount = 0,
  leaseDays = 0,
  extras: CycleExtra[] = [],
): Promise<{ sale?: HarvestSale; entry?: LedgerEntry; lease?: LedgerEntry; extras: LedgerEntry[] }> {
  const pond = ponds.find((item) => item.id === pondId);
  const cycle = cycles.find((item) => item.pondId === pondId && item.status === 'active');
  const nextPond = pond
    ? {
        ...pond,
        status: 'harvested' as const,
        lastCycleNumber: pond.cycleNumber ?? pond.lastCycleNumber,
        lastCycleProfit: profit,
        cycleDay: undefined,
      }
    : undefined;
  const nextCycle = cycle
    ? { ...cycle, status: 'closed' as const, endDate: harvestDate, recordedProfit: profit }
    : undefined;
  if (nextPond) {
    const index = ponds.findIndex((item) => item.id === pondId);
    if (index >= 0) ponds[index] = nextPond;
  }
  if (nextCycle) {
    const index = cycles.findIndex((item) => item.id === nextCycle.id);
    if (index >= 0) cycles[index] = nextCycle;
  }

  const cycleId = cycle?.id;
  let sale: HarvestSale | undefined;
  let entry: LedgerEntry | undefined;
  let lease: LedgerEntry | undefined;
  const leaseValue = Math.max(0, Number(leaseAmount) || 0);
  if (leaseValue > 0) {
    lease = {
      id: nid('ent'),
      title: 'Lease',
      subtitle: `${Math.max(1, leaseDays)} days`,
      amount: leaseValue,
      kind: 'expense',
      category: 'lease',
      date: harvestDate.slice(0, 10),
      pondId,
      cycleId,
      payment: 'paid',
    };
  }
  const pondName = pond?.name ?? 'Pond';
  const extraEntries: LedgerEntry[] = extras
    .filter((item) => item.name.trim() && item.amount > 0)
    .map((item) => ({
      id: nid('ent'),
      title: item.name.trim(),
      subtitle: item.units && item.units > 0 ? `${item.units} units` : pondName,
      amount: item.amount,
      kind: 'expense' as const,
      category: categoryForExtra(item.name),
      date: harvestDate.slice(0, 10),
      pondId,
      cycleId,
      payment: 'paid' as const,
      qty: item.units && item.units > 0 ? item.units : undefined,
      unit: item.units && item.units > 0 ? 'units' : undefined,
    }));
  const amount = Math.max(0, Number(saleAmount) || 0);
  const qty = Math.max(0, Number(harvestQtyKg) || 0);
  if (amount > 0) {
    const rate = qty > 0 ? Math.round(amount / qty) : 0;
    sale = {
      id: nid('sale'),
      pondId,
      cycleId: cycleId ?? 'none',
      date: harvestDate.slice(0, 10),
      buyer: 'Final harvest',
      qtyKg: qty,
      countSize: '',
      ratePerKg: rate,
      netAmount: amount,
      receivedAmount: amount,
    };
    entry = {
      id: nid('ent'),
      title: 'Sale · Final harvest',
      subtitle: pondName,
      amount,
      kind: 'revenue',
      category: 'revenue',
      date: harvestDate.slice(0, 10),
      pondId,
      cycleId,
      payment: 'paid',
      qty: qty || undefined,
      unit: qty > 0 ? 'kg' : undefined,
      rate: rate || undefined,
    };
  }

  await Promise.all([
    nextPond ? upsertRows('ponds', [nextPond]) : Promise.resolve(),
    nextCycle ? upsertRows('cycles', [nextCycle]) : Promise.resolve(),
    sale ? upsertRows('sales', [sale]) : Promise.resolve(),
    entry || lease || extraEntries.length
      ? upsertRows('entries', [entry, lease, ...extraEntries].filter((row): row is LedgerEntry => Boolean(row)))
      : Promise.resolve(),
  ]);
  return { sale, entry, lease, extras: extraEntries };
}

export function matchesExpenseChip(entry: LedgerEntry, chip: ExpenseChip | 'seed'): boolean {
  if (chip === 'all') return entry.kind === 'expense';
  if (chip === 'misc') return entry.kind === 'expense' && !['feed', 'medicine', 'labour', 'transport'].includes(entry.category);
  return entry.kind === 'expense' && entry.category === chip;
}

export { farm };

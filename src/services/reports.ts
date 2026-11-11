import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { cycles } from '@/data/cycles';
import { ponds } from '@/data/farm';
import { feedLogs } from '@/data/feedLogs';
import { entryInBucket, entryInWindow } from '@/lib/entrySpan';
import { APP_TODAY, parseISODate, toISODate } from '@/lib/format';
import { cyclePeriodRange, type PondFilter } from '@/services/ledger';
import { entryBelongsToCycle } from '@/services/ponds';
import type {
  BarPoint,
  ChartSlice,
  CropCycle,
  HarvestSale,
  LedgerEntry,
  ReportPeriodId,
  SpendGrain,
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
const DONUT_LABEL: Record<(typeof DONUT_ORDER)[number], string> = {
  feed: 'Feed',
  medicine: 'Medicine',
  labour: 'Labour',
  seed: 'Seed',
  transport: 'Transport',
};

const totalArea = ponds.reduce((sum, pond) => sum + pond.areaAcres, 0);

export interface ReportRange {
  start: Date;
  end: Date;
  label: string;
}

export interface SpendSlice extends ChartSlice {
  percent: number;
}

export interface PondReportCard {
  pondId: string;
  name: string;
  spend: number;
  revenue: number;
  profit: number;
  costPerKg: number | null;
  feedShare: number;
}

export interface CycleCompare {
  id: string;
  number: number;
  status: CropCycle['status'];
  range: string;
  spend: number;
  revenue: number;
  profit: number;
}

export interface LinePoint {
  label: string;
  spend: number;
  revenue: number;
}

export function reportRangeFor(
  period: ReportPeriodId,
  customFrom: string,
  customTo: string,
  pondId: PondFilter,
): ReportRange {
  if (period === 'lastMonth') {
    const last = subMonths(APP_TODAY, 1);
    return { start: startOfMonth(last), end: endOfMonth(last), label: format(last, 'MMM yyyy') };
  }
  if (period === 'last3') {
    const start = startOfMonth(subMonths(APP_TODAY, 2));
    return { start, end: endOfMonth(APP_TODAY), label: 'Last 3 months' };
  }
  if (period === 'cycle') {
    const range = cyclePeriodRange(pondId);
    return { ...range, label: 'This cycle' };
  }
  if (period === 'custom') {
    return {
      start: parseISODate(customFrom || toISODate(startOfMonth(APP_TODAY))),
      end: parseISODate(customTo || toISODate()),
      label: 'Custom',
    };
  }
  return { start: startOfMonth(APP_TODAY), end: endOfMonth(APP_TODAY), label: format(APP_TODAY, 'MMM yyyy') };
}

export function monthsInRange(start: Date, end: Date): { key: string; label: string }[] {
  return eachMonthOfInterval({ start, end }).map((month) => ({
    key: format(month, 'yyyy-MM'),
    label: format(month, 'MMM yyyy'),
  }));
}

function asIsoDate(value: string | Date | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return toISODate(value);
}

function inRange(iso: string | Date | undefined, start: Date, end: Date): boolean {
  const date = parseISODate(asIsoDate(iso));
  if (Number.isNaN(date.getTime())) return false;
  const from = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const to = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
  return date >= from && date <= to;
}

function normalizeSale(sale: HarvestSale): HarvestSale {
  return {
    ...sale,
    date: asIsoDate(sale.date),
    qtyKg: Number(sale.qtyKg) || 0,
    ratePerKg: Number(sale.ratePerKg) || 0,
    netAmount: Number(sale.netAmount) || 0,
    receivedAmount: Number(sale.receivedAmount) || 0,
  };
}

export function harvestsForReport(sales: HarvestSale[], entries: LedgerEntry[]): HarvestSale[] {
  const fromSales = sales
    .map(normalizeSale)
    .filter((sale) => sale.netAmount > 0 || sale.qtyKg > 0);
  const seen = new Set(fromSales.map((sale) => `${sale.pondId}|${sale.date}|${sale.netAmount}`));
  const fromEntries = entries
    .filter((entry) => entry.kind === 'revenue')
    .filter((entry) => (Number(entry.amount) || 0) > 0 || (Number(entry.qty) || 0) > 0)
    .filter((entry) => !seen.has(`${entry.pondId}|${asIsoDate(entry.date)}|${Number(entry.amount) || 0}`))
    .map((entry) => ({
      id: entry.id,
      pondId: String(entry.pondId),
      cycleId: entry.cycleId ?? 'none',
      date: asIsoDate(entry.date),
      buyer: (entry.title || 'Sale').replace(/^Sale · /, ''),
      qtyKg: Number(entry.qty) || 0,
      countSize: '',
      ratePerKg: Number(entry.rate) || 0,
      netAmount: Number(entry.amount) || 0,
      receivedAmount: entry.payment === 'paid' ? Number(entry.amount) || 0 : 0,
      dueDate: entry.dueDate,
    }));
  return [...fromSales, ...fromEntries];
}

function matchesPond(pondId: string, filter: PondFilter): boolean {
  if (filter === 'all') return true;
  return pondId === filter;
}

export function scopedEntries(entries: LedgerEntry[], start: Date, end: Date, pondId: PondFilter): LedgerEntry[] {
  return entries.filter((entry) => entryInWindow(entry, start, end) && matchesPond(entry.pondId, pondId));
}

export function scopedSales(
  sales: HarvestSale[],
  start: Date,
  end: Date,
  pondId: PondFilter,
  cycleList: CropCycle[] = cycles,
): HarvestSale[] {
  return sales.filter((sale) => {
    if (!matchesPond(sale.pondId, pondId)) return false;
    if (inRange(sale.date, start, end)) return true;
    const cycle = cycleList.find((item) => item.id === sale.cycleId);
    return Boolean(cycle?.endDate && inRange(cycle.endDate, start, end));
  });
}

export function pondWithMostFeed(entries: LedgerEntry[], fallback?: string): string | undefined {
  const totals = new Map<string, number>();
  entries.forEach((entry) => {
    if (entry.category !== 'feed' || entry.pondId === 'common') return;
    totals.set(entry.pondId, (totals.get(entry.pondId) ?? 0) + (Number(entry.amount) || 0));
  });
  let best = fallback;
  let max = -1;
  totals.forEach((amount, id) => {
    if (amount > max) {
      max = amount;
      best = id;
    }
  });
  return best;
}

export function spendSlices(list: LedgerEntry[]): SpendSlice[] {
  const expenses = list.filter((entry) => entry.kind === 'expense');
  const total = expenses.reduce((sum, entry) => sum + entry.amount, 0);
  const byName = new Map<string, number>();
  expenses.forEach((entry) => {
    const name = (DONUT_ORDER as readonly string[]).includes(entry.category)
      ? DONUT_LABEL[entry.category as (typeof DONUT_ORDER)[number]]
      : 'Others';
    byName.set(name, (byName.get(name) ?? 0) + entry.amount);
  });
  const names = [...DONUT_ORDER.map((id) => DONUT_LABEL[id]), 'Others'];
  return names
    .map((name) => {
      const value = byName.get(name) ?? 0;
      return {
        name,
        value,
        color: DONUT_COLOR[name] ?? '#C9DFC6',
        percent: total === 0 ? 0 : Math.round((value / total) * 100),
      };
    })
    .filter((slice) => slice.value > 0);
}

export function trendPoints(list: LedgerEntry[], start: Date, end: Date, grain: SpendGrain): BarPoint[] {
  const expenses = list.filter((entry) => entry.kind === 'expense');
  if (grain === 'monthly') {
    return eachMonthOfInterval({ start, end }).map((month) => {
      const from = startOfMonth(month);
      const to = endOfMonth(month);
      const value = expenses
        .filter((entry) => entryInBucket(entry, from, to, start, end))
        .reduce((sum, entry) => sum + entry.amount, 0);
      return { label: format(month, 'MMM'), value };
    });
  }
  if (grain === 'weekly') {
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((week) => {
      const from = week;
      const to = new Date(week);
      to.setDate(to.getDate() + 6);
      const value = expenses
        .filter((entry) => entryInBucket(entry, from, to, start, end))
        .reduce((sum, entry) => sum + entry.amount, 0);
      return { label: format(week, 'd MMM'), value };
    });
  }
  const days = eachDayOfInterval({ start, end });
  const window = days.length > 14 ? days.slice(-14) : days;
  return window.map((day) => {
    const value = expenses
      .filter((entry) => entryInBucket(entry, day, day, start, end))
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { label: format(day, 'd'), value };
  });
}

export function topExpenses(list: LedgerEntry[], count = 5): LedgerEntry[] {
  return [...list]
    .filter((entry) => entry.kind === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, count);
}

export function revenueStats(sales: HarvestSale[]) {
  const total = sales.reduce((sum, sale) => sum + (Number(sale.netAmount) || 0), 0);
  const qty = sales.reduce((sum, sale) => sum + (Number(sale.qtyKg) || 0), 0);
  const pending = sales.reduce(
    (sum, sale) => sum + Math.max((Number(sale.netAmount) || 0) - (Number(sale.receivedAmount) || 0), 0),
    0,
  );
  return {
    total,
    qty,
    avgRate: qty === 0 ? 0 : total / qty,
    pending,
    bars: sales.map((sale) => ({
      label: format(parseISODate(asIsoDate(sale.date)), 'd MMM'),
      value: Number(sale.netAmount) || 0,
    })),
  };
}

export function profitModel(
  entries: LedgerEntry[],
  sales: HarvestSale[],
  pondId: PondFilter,
): {
  revenue: number;
  direct: number;
  allocated: number;
  net: number;
  costPerKg: number | null;
  profitPerAcre: number | null;
  fcr: number | null;
  changePercent: number;
  harvestKg: number;
  area: number;
} {
  const revenue = entries.filter((entry) => entry.kind === 'revenue').reduce((sum, entry) => sum + entry.amount, 0);
  const direct = entries
    .filter((entry) => entry.kind === 'expense' && entry.pondId !== 'common')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const common = entries
    .filter((entry) => entry.kind === 'expense' && entry.pondId === 'common')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const pond = ponds.find((item) => item.id === pondId);
  const area = pondId === 'all' ? totalArea : (pond?.areaAcres ?? 0);
  const allocated = pondId === 'all' ? common : 0;
  const net = revenue - direct - allocated;
  const harvestKg = sales.reduce((sum, sale) => sum + sale.qtyKg, 0);
  const spend = direct + allocated;
  const feedKg = feedLogs
    .filter((log) => matchesPond(log.pondId, pondId))
    .reduce((sum, log) => sum + log.kg, 0);
  return {
    revenue,
    direct,
    allocated,
    net,
    costPerKg: harvestKg > 0 ? spend / harvestKg : null,
    profitPerAcre: area > 0 ? net / area : null,
    fcr: harvestKg > 0 ? feedKg / harvestKg : null,
    changePercent: 12.6,
    harvestKg,
    area,
  };
}

export function cycleLine(entries: LedgerEntry[], pondId: PondFilter): LinePoint[] {
  const { start, end } = cyclePeriodRange(pondId);
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  let spend = 0;
  let revenue = 0;
  const scoped = entries.filter((entry) => matchesPond(entry.pondId, pondId));
  return weeks.map((week) => {
    const from = startOfWeek(week, { weekStartsOn: 1 });
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    scoped.forEach((entry) => {
      if (!entryInBucket(entry, from, to, start, end)) return;
      if (entry.kind === 'expense') spend += Number(entry.amount) || 0;
      else revenue += Number(entry.amount) || 0;
    });
    return { label: format(week, 'd MMM'), spend, revenue };
  });
}

export function pondCards(entries: LedgerEntry[], sales: HarvestSale[], start: Date, end: Date): PondReportCard[] {
  return ponds.map((pond) => {
    const list = entries.filter((entry) => entry.pondId === pond.id && inRange(entry.date, start, end));
    const spend = list.filter((entry) => entry.kind === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    const revenue = list.filter((entry) => entry.kind === 'revenue').reduce((sum, entry) => sum + entry.amount, 0);
    const kg = sales
      .filter((sale) => sale.pondId === pond.id && inRange(sale.date, start, end))
      .reduce((sum, sale) => sum + sale.qtyKg, 0);
    const feed = list.filter((entry) => entry.category === 'feed').reduce((sum, entry) => sum + entry.amount, 0);
    return {
      pondId: pond.id,
      name: pond.name,
      spend,
      revenue,
      profit: revenue - spend,
      costPerKg: kg > 0 ? spend / kg : null,
      feedShare: spend === 0 ? 0 : (feed / spend) * 100,
    };
  });
}

export function compareCycles(pondId: string, entries: LedgerEntry[]): CycleCompare[] {
  return cycles
    .filter((cycle) => cycle.pondId === pondId)
    .sort((a, b) => a.number - b.number)
    .slice(0, 3)
    .map((cycle) => {
      const end = cycle.endDate ? parseISODate(cycle.endDate) : APP_TODAY;
      const start = parseISODate(cycle.startDate);
      const pondCycles = cycles.filter((item) => item.pondId === pondId);
      const list = entries.filter((entry) => entryBelongsToCycle(entry, cycle, pondCycles));
      const spend = list.filter((entry) => entry.kind === 'expense').reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
      const revenue = list.filter((entry) => entry.kind === 'revenue').reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
      const computed = revenue - spend;
      const profit = list.length === 0 && cycle.recordedProfit != null ? cycle.recordedProfit : computed;
      return {
        id: cycle.id,
        number: cycle.number,
        status: cycle.status,
        range: `${format(start, 'MMM d')} – ${cycle.endDate ? format(end, 'MMM d') : 'now'}`,
        spend,
        revenue,
        profit,
      };
    });
}

export function monthBounds(key: string): { start: Date; end: Date } {
  const [year, month] = key.split('-').map(Number);
  const start = new Date(year ?? 2026, (month ?? 1) - 1, 1);
  return { start, end: endOfMonth(start) };
}

import { eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek, subDays, subMonths } from 'date-fns';
import { cycles } from '@/data/cycles';
import { entries as allEntries } from '@/data/entries';
import { parties, ponds } from '@/data/farm';
import { t } from '@/i18n';
import { entryInBucket, entryInWindow } from '@/lib/entrySpan';
import { APP_TODAY, formatMonthYear, parseISODate, toISODate } from '@/lib/format';
import { entryBelongsToCycle } from '@/services/ponds';
import type {
  CategoryId,
  CropCycle,
  DatePreset,
  DayPoint,
  LedgerEntry,
  LedgerStatus,
  LedgerTab,
  PeriodId,
  Pond,
} from '@/types';

export type PondFilter = 'all' | string;

export interface HomePondCard {
  pond: Pond;
  spent: number;
  speciesChip: string;
}

export interface HomeModel {
  spent: number;
  revenue: number;
  profit: number;
  changePercent: number;
  periodLabel: string;
  duesTotal: number;
  duesCount: number;
  chart: DayPoint[];
  recent: LedgerEntry[];
  pondCards: HomePondCard[];
}

function periodLabelFor(period: PeriodId): string {
  if (period === 'today') return t('vsYesterday');
  if (period === 'week') return t('vsLastWeek');
  return t('vsLastMonth');
}

const PRIOR_RATIO: Record<PeriodId, number> = {
  today: 0.9,
  week: 0.88,
  month: 1 / 1.126,
};

function onActiveCycle(entry: LedgerEntry): boolean {
  const pondCycles = cycles.filter((item) => item.pondId === entry.pondId);
  const active = pondCycles.find((item) => item.status === 'active');
  if (!active) return false;
  if (entry.cycleId) return entry.cycleId === active.id;
  return entryBelongsToCycle(entry, active, pondCycles);
}

export async function loadLedger(): Promise<LedgerEntry[]> {
  return allEntries;
}

export function pondName(pondId: string): string {
  if (pondId === 'common') return 'Common';
  return ponds.find((pond) => pond.id === pondId)?.name ?? 'Pond';
}

export function partyName(partyId: string | undefined): string {
  if (!partyId) return '—';
  return parties.find((party) => party.id === partyId)?.name ?? '—';
}

function latestCycleByPond(pondId?: string): CropCycle[] {
  const relevant = cycles.filter((cycle) => !pondId || cycle.pondId === pondId);
  const active = relevant.filter((cycle) => cycle.status === 'active');
  if (active.length > 0) return active;
  const latest = new Map<string, CropCycle>();
  relevant.forEach((cycle) => {
    const current = latest.get(cycle.pondId);
    if (!current || cycle.number > current.number) latest.set(cycle.pondId, cycle);
  });
  return [...latest.values()];
}

/** Active cycles, or the latest closed cycle per pond once a cycle is harvested. */
export function cyclePeriodRange(pondId: PondFilter): { start: Date; end: Date } {
  const pool = latestCycleByPond(pondId === 'all' ? undefined : pondId);
  if (pool.length === 0) return { start: startOfMonth(APP_TODAY), end: APP_TODAY };
  const start = pool
    .map((cycle) => parseISODate(cycle.startDate))
    .sort((a, b) => a.getTime() - b.getTime())[0] ?? APP_TODAY;
  const end = pool.reduce((max, cycle) => {
    const day = cycle.endDate ? parseISODate(cycle.endDate) : APP_TODAY;
    return day > max ? day : max;
  }, start);
  return { start, end };
}

export function periodRange(period: PeriodId): { start: Date; end: Date } {
  const end = APP_TODAY;
  if (period === 'today') return { start: end, end };
  if (period === 'week') return { start: startOfWeek(end, { weekStartsOn: 1 }), end };
  return { start: startOfMonth(end), end };
}

function inHomePeriod(entry: LedgerEntry, start: Date, end: Date): boolean {
  return onActiveCycle(entry) && entryInWindow(entry, start, end);
}

function matchesPond(entry: LedgerEntry, pondId: PondFilter): boolean {
  if (pondId === 'all') return true;
  return entry.pondId === pondId;
}

function inRange(entry: LedgerEntry, start: Date, end: Date): boolean {
  return entryInWindow(entry, start, end);
}

function sumKind(list: LedgerEntry[], kind: LedgerEntry['kind']): number {
  return list.filter((item) => item.kind === kind).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

function chartPoints(list: LedgerEntry[], start: Date, end: Date): DayPoint[] {
  const days = eachDayOfInterval({ start, end });
  if (days.length <= 7) {
    return days.map((day) => pointForRange(list, day, day, format(day, 'EEE'), start, end));
  }

  const size = days.length / 7;
  return Array.from({ length: 7 }, (_, index) => {
    const fromIndex = Math.round(index * size);
    const toIndex = Math.min(days.length - 1, Math.round((index + 1) * size) - 1);
    const from = days[fromIndex] ?? start;
    const to = days[Math.max(fromIndex, toIndex)] ?? end;
    return pointForRange(list, from, to, format(from, 'd'), start, end);
  });
}

function pointForRange(
  list: LedgerEntry[],
  from: Date,
  to: Date,
  label: string,
  windowStart: Date,
  windowEnd: Date,
): DayPoint {
  const slice = list.filter((item) => entryInBucket(item, from, to, windowStart, windowEnd));
  return {
    label,
    date: format(from, 'yyyy-MM-dd'),
    spend: sumKind(slice, 'expense'),
    revenue: sumKind(slice, 'revenue'),
  };
}

function speciesChip(pond: Pond): string {
  if (pond.species.startsWith('Vannamei')) return 'Vannamei';
  if (pond.species.startsWith('Rohu')) return 'Rohu';
  if (pond.species) return pond.species;
  return 'Idle';
}

export function buildHome(pondId: PondFilter, period: PeriodId, source: LedgerEntry[] = allEntries): HomeModel {
  const { start, end } = periodRange(period);
  const scoped = source.filter((entry) => matchesPond(entry, pondId) && inHomePeriod(entry, start, end));
  const spent = sumKind(scoped, 'expense');
  const revenue = sumKind(scoped, 'revenue');
  const profit = revenue - spent;
  const prior = profit * PRIOR_RATIO[period] * (pondId === 'all' ? 1 : 0.94);
  const changePercent = prior === 0 ? 0 : ((profit - prior) / Math.abs(prior)) * 100;

  const dues = source.filter((entry) => {
    if (!matchesPond(entry, pondId) || entry.payment !== 'credit') return false;
    const left = (Number(entry.amount) || 0) - (Number(entry.settledAmount) || 0);
    return left > 0;
  });
  const pondCards: HomePondCard[] = ponds.map((pond) => {
    const pondSpent = source
      .filter((entry) => entry.pondId === pond.id && entry.kind === 'expense' && inHomePeriod(entry, start, end))
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
    return { pond, spent: pondSpent, speciesChip: speciesChip(pond) };
  });

  const recent = [...scoped].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return {
    spent,
    revenue,
    profit,
    changePercent,
    periodLabel: periodLabelFor(period),
    duesTotal: dues.reduce(
      (sum, entry) => sum + Math.max(0, (Number(entry.amount) || 0) - (Number(entry.settledAmount) || 0)),
      0,
    ),
    duesCount: dues.length,
    chart: chartPoints(scoped, start, end),
    recent,
    pondCards,
  };
}

export const LEDGER_PAGE = 15;

export interface LedgerQuery {
  preset: DatePreset;
  customFrom: string;
  customTo: string;
  ponds: string[];
  categories: CategoryId[];
  status: LedgerStatus;
  tab: LedgerTab;
  search: string;
}

export function defaultLedgerQuery(): LedgerQuery {
  return {
    preset: 'month',
    customFrom: toISODate(startOfMonth(APP_TODAY)),
    customTo: toISODate(APP_TODAY),
    ponds: [],
    categories: [],
    status: 'all',
    tab: 'all',
    search: '',
  };
}

export function dateRangeFor(query: LedgerQuery): { start: Date; end: Date; label: string } {
  if (query.preset === 'today') {
    return { start: APP_TODAY, end: APP_TODAY, label: t('today') };
  }
  if (query.preset === '7d') {
    return { start: subDays(APP_TODAY, 6), end: APP_TODAY, label: t('last7') };
  }
  if (query.preset === 'lastMonth') {
    const last = subMonths(APP_TODAY, 1);
    return { start: startOfMonth(last), end: endOfMonth(last), label: formatMonthYear(last) };
  }
  if (query.preset === 'cycle') {
    const { start, end } = cyclePeriodRange('all');
    return { start, end, label: t('thisCycle') };
  }
  if (query.preset === 'custom') {
    return {
      start: parseISODate(query.customFrom || toISODate(startOfMonth(APP_TODAY))),
      end: parseISODate(query.customTo || toISODate()),
      label: t('custom'),
    };
  }
  return { start: startOfMonth(APP_TODAY), end: APP_TODAY, label: formatMonthYear(APP_TODAY) };
}

export function filterLedger(source: LedgerEntry[], query: LedgerQuery): LedgerEntry[] {
  const { start, end } = dateRangeFor(query);
  const q = query.search.trim().toLowerCase();
  return source.filter((entry) => {
    if (!inRange(entry, start, end)) return false;
    if (query.tab === 'expense' && entry.kind !== 'expense') return false;
    if (query.tab === 'revenue' && entry.kind !== 'revenue') return false;
    if (query.ponds.length > 0 && !query.ponds.includes(entry.pondId)) return false;
    if (query.categories.length > 0 && !query.categories.includes(entry.category)) return false;
    if (query.status === 'paid' && entry.payment !== 'paid') return false;
    if (query.status === 'credit' && entry.payment !== 'credit') return false;
    if (q) {
      const hay = `${entry.title} ${entry.subtitle} ${entry.note ?? ''} ${entry.item ?? ''} ${partyName(entry.partyId)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function groupLedger(list: LedgerEntry[]): { date: string; rows: LedgerEntry[]; total: number }[] {
  const map = new Map<string, LedgerEntry[]>();
  [...list]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .forEach((entry) => {
      const rows = map.get(entry.date) ?? [];
      rows.push(entry);
      map.set(entry.date, rows);
    });
  return [...map.entries()].map(([date, rows]) => ({
    date,
    rows,
    total: rows.reduce((sum, row) => sum + (row.kind === 'revenue' ? row.amount : -row.amount), 0),
  }));
}

export function ledgerTotals(list: LedgerEntry[]): { spent: number; revenue: number; net: number } {
  const spent = sumKind(list, 'expense');
  const revenue = sumKind(list, 'revenue');
  return { spent, revenue, net: revenue - spent };
}

export function queryIsFiltered(query: LedgerQuery): boolean {
  return (
    query.preset !== 'month' ||
    query.ponds.length > 0 ||
    query.categories.length > 0 ||
    query.status !== 'all' ||
    query.search.trim() !== ''
  );
}

export function editPath(entry: LedgerEntry): string {
  const pond = entry.pondId !== 'common' ? `&pond=${entry.pondId}` : '';
  return `/add/expense?edit=${entry.id}${pond}`;
}

export function qtyRateLabel(entry: LedgerEntry): string {
  if (!entry.qty || !entry.rate) return '—';
  const qty = new Intl.NumberFormat('en-IN').format(entry.qty);
  const rate = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(entry.rate);
  const piece = entry.unit === 'piece' || entry.unit === 'pieces';
  const units = piece ? (entry.qty === 1 ? 'pc' : 'pcs') : entry.qty === 1 || entry.unit === 'kg' ? (entry.unit ?? 'unit') : `${entry.unit ?? 'unit'}s`;
  return `${qty} ${units} × ₹${rate}`;
}

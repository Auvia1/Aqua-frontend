import { differenceInCalendarDays, subDays } from 'date-fns';
import { entries as allEntries } from '@/data/entries';
import { ponds } from '@/data/farm';
import { t } from '@/i18n';
import { entryInWindow } from '@/lib/entrySpan';
import { toISODate } from '@/lib/format';
import type { CommonFilter, LedgerEntry, SplitRule } from '@/types';

const ALLOC_KEY = 'aqua.splitRule';

export interface Allocation {
  rule: SplitRule;
  manual: Record<string, number>;
}

export interface PondShare {
  pondId: string;
  name: string;
  percent: number;
  amount: number;
}

export interface CommonMonthModel {
  total: number;
  lastTotal: number;
  changePercent: number;
  electricity: number;
  lease: number;
  vehicle: number;
  entries: LedgerEntry[];
}

const CORE: CategoryIdLike[] = ['electricity', 'vehicle'];
type CategoryIdLike = 'electricity' | 'lease' | 'vehicle';

export function defaultManual(): Record<string, number> {
  return Object.fromEntries(splitPreview(100, ponds.map((p) => p.id), 'area', {}).map((row) => [row.pondId, row.percent]));
}

export function loadAllocation(): Allocation {
  try {
    const raw = window.sessionStorage.getItem(ALLOC_KEY);
    if (raw) return JSON.parse(raw) as Allocation;
  } catch {
    /* ignore */
  }
  return { rule: 'area', manual: defaultManual() };
}

export function saveAllocation(next: Allocation): void {
  try {
    window.sessionStorage.setItem(ALLOC_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function splitLabel(rule: SplitRule): string {
  if (rule === 'equal') return t('splitEqual');
  if (rule === 'manual') return t('splitManual');
  return t('splitArea');
}

export function bannerCopy(rule: SplitRule): string {
  if (rule === 'equal') return 'Shared costs are split equally across ponds';
  if (rule === 'manual') return 'Shared costs are split by manual percentages';
  return 'Shared costs are split across ponds by area';
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function splitPreview(
  amount: number,
  pondIds: string[],
  rule: SplitRule,
  manual: Record<string, number>,
): PondShare[] {
  const selected = ponds.filter((pond) => pondIds.includes(pond.id));
  if (selected.length === 0) return [];

  const raw: Record<string, number> = {};
  if (rule === 'manual') {
    selected.forEach((pond) => {
      raw[pond.id] = Number(manual[pond.id]) || 0;
    });
  } else if (rule === 'equal') {
    selected.forEach((pond) => {
      raw[pond.id] = 100 / selected.length;
    });
  } else {
    const area = selected.reduce((sum, pond) => sum + pond.areaAcres, 0) || 1;
    selected.forEach((pond) => {
      raw[pond.id] = (pond.areaAcres / area) * 100;
    });
  }

  let accPct = 0;
  let accAmt = 0;
  return selected.map((pond, index) => {
    const last = index === selected.length - 1;
    const percent = last ? round1(100 - accPct) : round1(raw[pond.id] ?? 0);
    accPct += percent;
    const share = last ? Math.round(amount - accAmt) : Math.round((amount * percent) / 100);
    accAmt += share;
    return { pondId: pond.id, name: pond.name, percent, amount: share };
  });
}

export function percentTotal(manual: Record<string, number>, pondIds: string[]): number {
  return round1(pondIds.reduce((sum, id) => sum + (Number(manual[id]) || 0), 0));
}


function money(value: number | string | undefined): number {
  return Number(value) || 0;
}

function sumBy(list: LedgerEntry[], category?: CategoryIdLike): number {
  return list
    .filter((item) => (category ? item.category === category : true))
    .reduce((sum, item) => sum + money(item.amount), 0);
}

export function matchesCommonFilter(entry: LedgerEntry, filter: CommonFilter | 'all'): boolean {
  if (filter === 'all') return true;
  if (filter === 'other') return !CORE.includes(entry.category as CategoryIdLike);
  return entry.category === filter;
}

export function groupByDate(entries: LedgerEntry[]): { date: string; rows: LedgerEntry[] }[] {
  const map = new Map<string, LedgerEntry[]>();
  entries.forEach((entry) => {
    const list = map.get(entry.date) ?? [];
    list.push(entry);
    map.set(entry.date, list);
  });
  return [...map.entries()].map(([date, rows]) => ({ date, rows }));
}

export function buildCommonRange(start: Date, end: Date, source: LedgerEntry[] = allEntries): CommonMonthModel {
  const common = source.filter((entry) => entry.pondId === 'common' && entry.kind === 'expense');
  const from = toISODate(start);
  const to = toISODate(end);
  const current = common.filter((entry) => entryInWindow(entry, from, to));
  const days = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, days - 1);
  const last = common.filter((entry) => entryInWindow(entry, prevStart, prevEnd));
  const total = sumBy(current);
  const lastTotal = sumBy(last);
  const changePercent = lastTotal === 0 ? 0 : ((total - lastTotal) / Math.abs(lastTotal)) * 100;

  return {
    total,
    lastTotal,
    changePercent,
    electricity: sumBy(current, 'electricity'),
    lease: sumBy(current, 'lease'),
    vehicle: sumBy(current, 'vehicle'),
    entries: [...current].sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export function buildCommonMonth(year: number, month: number, source: LedgerEntry[] = allEntries): CommonMonthModel {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return buildCommonRange(start, end, source);
}

export async function loadCommonMonth(year: number, month: number): Promise<CommonMonthModel> {
  return buildCommonMonth(year, month);
}

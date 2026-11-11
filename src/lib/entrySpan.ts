import { toISODate } from '@/lib/format';

interface SpannedEntry {
  pondId?: string;
  date: string;
  dueDate?: string;
}

function iso(value: string | Date | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return toISODate(value);
}

function day(value: Date | string): string {
  return typeof value === 'string' ? value.slice(0, 10) : toISODate(value);
}

/** A common cost with a from and to date covers every day in between. */
export function coveredSpan(entry: SpannedEntry): { start: string; end: string } | null {
  if (entry.pondId !== 'common') return null;
  const start = iso(entry.date);
  const end = iso(entry.dueDate);
  if (!start || !end || end < start) return null;
  return { start, end };
}

export function entryInWindow(entry: SpannedEntry, start: Date | string, end: Date | string): boolean {
  const from = day(start);
  const to = day(end);
  const span = coveredSpan(entry);
  if (span) return span.start <= to && from <= span.end;
  const date = iso(entry.date);
  return date >= from && date <= to;
}

/** A spanned cost is counted once, on the first day it overlaps the viewed window. */
export function entryInBucket(
  entry: SpannedEntry,
  bucketStart: Date,
  bucketEnd: Date,
  windowStart: Date,
  windowEnd: Date,
): boolean {
  const span = coveredSpan(entry);
  const from = toISODate(bucketStart);
  const to = toISODate(bucketEnd);
  if (!span) {
    const date = iso(entry.date);
    return date >= from && date <= to;
  }
  const windowFrom = toISODate(windowStart);
  const windowTo = toISODate(windowEnd);
  if (!(span.start <= windowTo && windowFrom <= span.end)) return false;
  const anchor = span.start > windowFrom ? span.start : windowFrom;
  return anchor >= from && anchor <= to;
}

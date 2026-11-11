import { format, isSameDay, subDays } from 'date-fns';
import { enIN, te } from 'date-fns/locale';
import { getLang, t } from '@/i18n';
import type { AreaUnit } from '@/types';

/** Local calendar day. Add forms and the home periods share this clock. */
export const APP_TODAY = (() => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
})();

function dateLocale() {
  return getLang() === 'te' ? te : enIN;
}

export function formatArea(acres: number, unit: AreaUnit): string {
  if (unit === 'cents') {
    const cents = acres * 100;
    const text = Number.isInteger(cents)
      ? new Intl.NumberFormat('en-IN').format(cents)
      : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(cents);
    return `${text} ${t('cents').toLowerCase()}`;
  }
  const text = Number.isInteger(acres)
    ? String(acres)
    : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(acres);
  return `${text} ${acres === 1 ? t('acreUnit') : t('acresUnit')}`;
}

export function toISODate(date: Date = APP_TODAY): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatGrouped(amount: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}

export function formatINRCompact(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAxis(value: number): string {
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 100000) {
    const lakhs = abs / 100000;
    const text =
      lakhs >= 10 || Number.isInteger(lakhs) ? String(Math.round(lakhs)) : lakhs.toFixed(1).replace(/\.0$/, '');
    return `${text}L`;
  }
  if (abs >= 1000) return `${Math.round(abs / 1000)}K`;
  return String(Math.round(abs));
}

export function formatINR(
  amount: number,
  options?: { withSymbol?: boolean; withPaise?: boolean },
): string {
  const withSymbol = options?.withSymbol ?? true;
  const withPaise = options?.withPaise ?? true;
  return new Intl.NumberFormat('en-IN', {
    style: withSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: withPaise ? 2 : 0,
    maximumFractionDigits: withPaise ? 2 : 0,
  }).format(amount);
}

export function splitINR(amount: number): { rupees: string; paise: string } {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  const [rupees, paise] = formatted.split('.');
  return { rupees: rupees ?? '0', paise: paise ?? '00' };
}

export function parseISODate(iso: string): Date {
  const dayPart = String(iso ?? '').slice(0, 10);
  const [year, month, day] = dayPart.split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
}

export function formatDate(input: Date | string, today: Date = APP_TODAY): string {
  const date = typeof input === 'string' ? parseISODate(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  if (isSameDay(date, today)) return t('today');
  if (isSameDay(date, subDays(today, 1))) return t('yesterday');
  return format(date, 'MMM d, yyyy', { locale: dateLocale() });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMM yyyy', { locale: dateLocale() });
}

export function formatLongDate(input: Date | string): string {
  const date = typeof input === 'string' ? parseISODate(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'MMM d, yyyy', { locale: dateLocale() });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatDateHeader(input: Date | string, today: Date = APP_TODAY): string {
  const date = typeof input === 'string' ? parseISODate(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  if (isSameDay(date, today)) return t('today');
  if (isSameDay(date, subDays(today, 1))) return t('yesterday');
  return format(date, 'MMM d', { locale: dateLocale() });
}

export function formatCycleRange(start: string, end?: string): string {
  const from = format(parseISODate(start), 'MMM d, yyyy', { locale: dateLocale() });
  if (!end) return `${from} → ${t('now')}`;
  return `${from} → ${format(parseISODate(end), 'MMM d, yyyy', { locale: dateLocale() })}`;
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return t('goodMorning');
  if (hour < 17) return t('goodAfternoon');
  return t('goodEvening');
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length < 10) return `+91 ${digits}`;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

export function padSlideIndex(index: number, total: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

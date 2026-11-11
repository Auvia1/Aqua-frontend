import { addDays, differenceInCalendarDays, format, isBefore } from 'date-fns';
import { APP_TODAY, parseISODate } from '@/lib/format';
import type {
  DueChip,
  DueSort,
  DueTab,
  HarvestSale,
  LedgerEntry,
  Party,
  PartyPayment,
} from '@/types';

export const UNASSIGNED_PARTY: Party = { id: 'party-unassigned', name: 'Other credit', kind: 'vendor' };

function money(value: number | string | undefined): number {
  return Number(value) || 0;
}

function outstandingOf(entry: LedgerEntry): number {
  return Math.max(0, money(entry.amount) - money(entry.settledAmount));
}

export function entryBelongsToParty(entry: LedgerEntry, partyId: string): boolean {
  if (partyId === UNASSIGNED_PARTY.id) return !entry.partyId;
  return entry.partyId === partyId;
}

export interface PendingItem {
  id: string;
  date: string;
  title: string;
  amount: number;
  dueDate: string;
  kind: 'entry' | 'sale';
}

export interface HistoryEvent {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: 'bill' | 'payment';
  balance: number;
}

export interface PartyDue {
  party: Party;
  tab: DueTab;
  amount: number;
  pending: PendingItem[];
  billed: number;
  paid: number;
}

export function pendingForParty(
  party: Party,
  entries: LedgerEntry[],
  sales: HarvestSale[],
): PendingItem[] {
  if (party.kind === 'buyer') {
    return sales
      .filter((sale) => sale.buyer === party.name && sale.netAmount > sale.receivedAmount)
      .map((sale) => ({
        id: sale.id,
        date: sale.date,
        title: `Harvest sale · ${sale.qtyKg} kg`,
        amount: sale.netAmount - sale.receivedAmount,
        dueDate: sale.dueDate ?? sale.date,
        kind: 'sale' as const,
      }));
  }
  return entries
    .filter(
      (entry) =>
        entryBelongsToParty(entry, party.id) && entry.payment === 'credit' && entry.kind === 'expense',
    )
    .map((entry) => ({
      id: entry.id,
      date: entry.date,
      title: entry.item ?? entry.title,
      amount: outstandingOf(entry),
      dueDate: entry.dueDate ?? entry.date,
      kind: 'entry' as const,
    }))
    .filter((item) => item.amount > 0);
}

export function billedPaid(party: Party, entries: LedgerEntry[], sales: HarvestSale[]) {
  const outstanding = pendingForParty(party, entries, sales).reduce((sum, item) => sum + item.amount, 0);
  if (party.kind === 'buyer') {
    const billed = sales.filter((sale) => sale.buyer === party.name).reduce((sum, sale) => sum + sale.netAmount, 0);
    return { billed, paid: Math.max(0, billed - outstanding) };
  }
  const billed = entries
    .filter((entry) => entryBelongsToParty(entry, party.id) && entry.kind === 'expense')
    .reduce((sum, entry) => sum + money(entry.amount), 0);
  return { billed, paid: Math.max(0, billed - outstanding) };
}

export function buildPartyDues(parties: Party[], entries: LedgerEntry[], sales: HarvestSale[]): PartyDue[] {
  const list = [...parties];
  const hasOrphanCredit = entries.some(
    (entry) =>
      entry.kind === 'expense' && entry.payment === 'credit' && !entry.partyId && outstandingOf(entry) > 0,
  );
  if (hasOrphanCredit && !list.some((party) => party.id === UNASSIGNED_PARTY.id)) {
    list.push(UNASSIGNED_PARTY);
  }
  return list
    .map((party) => {
      const pending = pendingForParty(party, entries, sales);
      const amount = pending.reduce((sum, item) => sum + item.amount, 0);
      const { billed, paid } = billedPaid(party, entries, sales);
      const tab: DueTab = party.kind === 'buyer' ? 'receive' : 'pay';
      return { party, tab, amount, pending, billed, paid };
    })
    .filter((row) => row.amount > 0 || row.pending.length > 0);
}

export function dueStatus(items: PendingItem[]): { label: string; overdue: boolean } {
  if (items.length === 0) return { label: 'Clear', overdue: false };
  const earliest = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  if (!earliest) return { label: 'Clear', overdue: false };
  const days = differenceInCalendarDays(APP_TODAY, parseISODate(earliest.dueDate));
  if (days > 0) return { label: `Overdue ${days} days`, overdue: true };
  if (days === 0) return { label: 'Due today', overdue: false };
  return { label: `Due ${format(parseISODate(earliest.dueDate), 'MMM d')}`, overdue: false };
}

export function matchesDueChip(items: PendingItem[], chip: DueChip): boolean {
  if (chip === 'all') return true;
  const weekEnd = addDays(APP_TODAY, 7);
  return items.some((item) => {
    const due = parseISODate(item.dueDate);
    if (chip === 'overdue') return isBefore(due, APP_TODAY) && differenceInCalendarDays(APP_TODAY, due) > 0;
    return due >= APP_TODAY && due <= weekEnd;
  });
}

export function sortDues(list: PartyDue[], sort: DueSort): PartyDue[] {
  const copy = [...list];
  if (sort === 'amount') return copy.sort((a, b) => b.amount - a.amount);
  if (sort === 'name') return copy.sort((a, b) => a.party.name.localeCompare(b.party.name));
  return copy.sort((a, b) => {
    const da = a.pending.map((p) => p.dueDate).sort()[0] ?? '9999';
    const db = b.pending.map((p) => p.dueDate).sort()[0] ?? '9999';
    return da.localeCompare(db);
  });
}

export function historyFor(
  party: Party,
  entries: LedgerEntry[],
  sales: HarvestSale[],
  payments: PartyPayment[],
): HistoryEvent[] {
  const events: Omit<HistoryEvent, 'balance'>[] = [];
  if (party.kind === 'buyer') {
    sales
      .filter((sale) => sale.buyer === party.name)
      .forEach((sale) => {
        events.push({ id: `${sale.id}-bill`, date: sale.date, label: 'Harvest sale', amount: sale.netAmount, type: 'bill' });
        const opening = sale.openingReceived ?? 0;
        if (opening > 0) {
          events.push({
            id: `${sale.id}-paid`,
            date: sale.date,
            label: 'Payment received',
            amount: opening,
            type: 'payment',
          });
        }
      });
  } else {
    entries
      .filter((entry) => entryBelongsToParty(entry, party.id) && entry.kind === 'expense')
      .forEach((entry) => {
        events.push({
          id: `${entry.id}-bill`,
          date: entry.date,
          label: entry.title,
          amount: money(entry.amount),
          type: 'bill',
        });
        if (entry.payment === 'paid' && !entry.paidDate) {
          events.push({
            id: `${entry.id}-paid`,
            date: entry.date,
            label: 'Payment',
            amount: money(entry.amount),
            type: 'payment',
          });
        }
      });
  }
  payments
    .filter((item) => item.partyId === party.id)
    .forEach((item) => {
      events.push({ id: item.id, date: item.date, label: item.note || 'Payment', amount: item.amount, type: 'payment' });
    });

  const chronological = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let balance = 0;
  const withBal: HistoryEvent[] = chronological.map((event) => {
    balance += event.type === 'bill' ? event.amount : -event.amount;
    return { ...event, balance };
  });
  return withBal.reverse();
}

export function reminderLink(party: Party, amount: number, farmName: string, owner: string): string {
  const digits = (party.phone ?? '').replace(/\D/g, '').slice(-10);
  const text = encodeURIComponent(
    `Namaste ${party.name}, a payment of ₹${new Intl.NumberFormat('en-IN').format(amount)} is pending to ${farmName}. Please confirm. — ${owner}`,
  );
  return `https://wa.me/91${digits}?text=${text}`;
}

export const CREDIT_REMIND_DAYS = 10;

export interface CreditDueReminder {
  id: string;
  title: string;
  date: string;
  days: number;
  amount: number;
}

export function creditDueReminders(entries: LedgerEntry[]): CreditDueReminder[] {
  return entries
    .filter(
      (entry) =>
        entry.kind === 'expense' &&
        entry.payment === 'credit' &&
        Boolean(entry.dueDate?.trim()) &&
        outstandingOf(entry) > 0,
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.item ?? entry.title,
      date: entry.dueDate as string,
      days: differenceInCalendarDays(parseISODate(entry.dueDate as string), APP_TODAY),
      amount: outstandingOf(entry),
    }))
    .filter((item) => item.days <= CREDIT_REMIND_DAYS)
    .sort((a, b) => a.days - b.days);
}

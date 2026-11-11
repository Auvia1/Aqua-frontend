import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { entries as liveEntries } from '@/data/entries';
import { parties as liveParties } from '@/data/farm';
import { harvestSales as liveSales } from '@/data/sales';
import {
  deleteRemoteEntry,
  deleteRemoteParty,
  getRemoteCache,
  saveEntries,
  saveParties,
  savePayments,
  saveSales,
} from '@/services/remote';
import { entryBelongsToParty } from '@/services/dues';
import type { HarvestSale, LedgerEntry, Party, PartyPayment, PaymentMode } from '@/types';

interface LedgerContextValue {
  entries: LedgerEntry[];
  parties: Party[];
  sales: HarvestSale[];
  payments: PartyPayment[];
  markPaid: (id: string, date: string, mode: PaymentMode) => void;
  deleteEntry: (id: string) => void;
  recordPayment: (input: {
    partyId: string;
    amount: number;
    date: string;
    mode: PaymentMode;
    note?: string;
    entryIds?: string[];
  }) => void;
  updateParty: (id: string, patch: Partial<Party>) => void;
  deleteParty: (id: string) => void;
  addParty: (input: Omit<Party, 'id'> & { id?: string }) => void;
  addEntries: (rows: LedgerEntry[]) => void;
  updateEntry: (row: LedgerEntry) => void;
  addSales: (rows: HarvestSale[]) => void;
}

const LedgerContext = createContext<LedgerContextValue | null>(null);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LedgerEntry[]>(() => clone(getRemoteCache()?.entries ?? liveEntries));
  const [parties, setParties] = useState<Party[]>(() => clone(getRemoteCache()?.parties ?? liveParties));
  const [sales, setSales] = useState<HarvestSale[]>(() => clone(getRemoteCache()?.sales ?? liveSales));
  const [payments, setPayments] = useState<PartyPayment[]>(() => clone(getRemoteCache()?.payments ?? []));

  const markPaid = useCallback((id: string, date: string, mode: PaymentMode) => {
    const entry = entries.find((item) => item.id === id);
    const partyId = entry?.partyId;
    const remaining = entry ? entry.amount - (entry.settledAmount ?? 0) : 0;
    setEntries((current) => {
      const next = current.map((item) =>
        item.id === id ? { ...item, payment: 'paid' as const, paidDate: date, mode, settledAmount: item.amount } : item,
      );
      saveEntries(next);
      return next;
    });
    if (partyId && remaining > 0) {
      setPayments((current) => {
        const next = [
          ...current,
          {
            id: `pay-${id}-${Date.now()}`,
            partyId,
            date,
            amount: remaining,
            mode,
            entryIds: [id],
          },
        ];
        savePayments(next);
        return next;
      });
    }
  }, [entries]);

  const deleteEntry = useCallback((id: string) => {
    deleteRemoteEntry(id);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const recordPayment = useCallback(
    (input: { partyId: string; amount: number; date: string; mode: PaymentMode; note?: string; entryIds?: string[] }) => {
      const party = parties.find((item) => item.id === input.partyId);
      setPayments((current) => {
        const next = [
          ...current,
          {
            id: `pay-${Date.now()}`,
            partyId: input.partyId,
            date: input.date,
            amount: input.amount,
            mode: input.mode,
            note: input.note,
            entryIds: input.entryIds,
          },
        ];
        savePayments(next);
        return next;
      });

      if (party?.kind === 'buyer') {
        const selected = new Set(input.entryIds ?? []);
        setSales((current) => {
          let left = input.amount;
          const next = current.map((sale) => {
            if (sale.buyer !== party.name || left <= 0) return sale;
            if (selected.size > 0 && !selected.has(sale.id)) return sale;
            const pending = sale.netAmount - sale.receivedAmount;
            if (pending <= 0) return sale;
            const take = Math.min(pending, left);
            left -= take;
            return { ...sale, receivedAmount: sale.receivedAmount + take };
          });
          saveSales(next);
          return next;
        });
        return;
      }

      setEntries((current) => {
        let left = input.amount;
        const selected = new Set(input.entryIds ?? []);
        const order = [...current]
          .filter((entry) => {
            if (entry.payment !== 'credit' || !entryBelongsToParty(entry, input.partyId)) return false;
            if (selected.size > 0 && !selected.has(entry.id)) return false;
            return true;
          })
          .sort((a, b) => (a.dueDate ?? a.date).localeCompare(b.dueDate ?? b.date));
        const paidIds = new Set<string>();
        const partial: Record<string, number> = {};
        order.forEach((entry) => {
          if (left <= 0) return;
          const remain = entry.amount - (entry.settledAmount ?? 0);
          if (remain <= 0) return;
          if (left >= remain) {
            paidIds.add(entry.id);
            left -= remain;
          } else {
            partial[entry.id] = (entry.settledAmount ?? 0) + left;
            left = 0;
          }
        });
        const next = current.map((entry) => {
          if (paidIds.has(entry.id)) {
            return { ...entry, payment: 'paid' as const, paidDate: input.date, mode: input.mode, settledAmount: entry.amount };
          }
          if (partial[entry.id] != null) return { ...entry, settledAmount: partial[entry.id] };
          return entry;
        });
        saveEntries(next);
        return next;
      });
    },
    [parties],
  );

  const updateParty = useCallback((id: string, patch: Partial<Party>) => {
    setParties((current) => {
      const next = current.map((party) => (party.id === id ? { ...party, ...patch } : party));
      saveParties(next);
      return next;
    });
  }, []);

  const deleteParty = useCallback((id: string) => {
    deleteRemoteParty(id);
    setParties((current) => current.filter((party) => party.id !== id));
  }, []);

  const addParty = useCallback((input: Omit<Party, 'id'> & { id?: string }) => {
    setParties((current) => {
      const next = [...current, { ...input, id: input.id ?? `party-${Date.now()}` }];
      liveParties.splice(0, liveParties.length, ...next);
      saveParties(next);
      return next;
    });
  }, []);

  const addEntries = useCallback((rows: LedgerEntry[]) => {
    if (rows.length === 0) return;
    setEntries((current) => {
      const next = [...rows, ...current];
      liveEntries.splice(0, liveEntries.length, ...next);
      saveEntries(rows);
      return next;
    });
  }, []);

  const updateEntry = useCallback((row: LedgerEntry) => {
    setEntries((current) => {
      const next = current.map((item) => (item.id === row.id ? row : item));
      liveEntries.splice(0, liveEntries.length, ...next);
      saveEntries([row]);
      return next;
    });
  }, []);

  const addSales = useCallback((rows: HarvestSale[]) => {
    if (rows.length === 0) return;
    setSales((current) => {
      const next = [...rows, ...current];
      liveSales.splice(0, liveSales.length, ...next);
      saveSales(rows);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      entries,
      parties,
      sales,
      payments,
      markPaid,
      deleteEntry,
      recordPayment,
      updateParty,
      deleteParty,
      addParty,
      addEntries,
      updateEntry,
      addSales,
    }),
    [entries, parties, sales, payments, markPaid, deleteEntry, recordPayment, updateParty, deleteParty, addParty, addEntries, updateEntry, addSales],
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerContextValue {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider');
  return ctx;
}

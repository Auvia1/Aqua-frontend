import { cycles as liveCycles } from '@/data/cycles';
import { entries as liveEntries } from '@/data/entries';
import { farm as liveFarm, parties as liveParties, ponds as livePonds } from '@/data/farm';
import { feedLogs as liveFeed } from '@/data/feedLogs';
import { harvestSales as liveSales } from '@/data/sales';
import { farmVehicles } from '@/data/common';
import { api, getToken } from '@/lib/api';
import type {
  Farm,
  FarmVehicle,
  FeedLog,
  HarvestSale,
  LedgerEntry,
  Party,
  PartyPayment,
  Pond,
  SettingsCategory,
  SettingsNotifications,
  TeamMember,
  CropCycle,
} from '@/types';

export interface RemoteBundle {
  farm: Farm;
  notifications: SettingsNotifications;
  ponds: Pond[];
  parties: Party[];
  entries: LedgerEntry[];
  sales: HarvestSale[];
  payments: PartyPayment[];
  cycles: CropCycle[];
  feedLogs: FeedLog[];
  categories: SettingsCategory[];
  team: TeamMember[];
  vehicles: FarmVehicle[];
}

let cached: RemoteBundle | null = null;

export function getRemoteCache(): RemoteBundle | null {
  return cached;
}

function replace<T>(target: T[], next: T[]): void {
  target.splice(0, target.length, ...next);
}

function applyLive(bundle: RemoteBundle): void {
  Object.assign(liveFarm, bundle.farm);
  replace(livePonds, bundle.ponds);
  replace(liveParties, bundle.parties);
  replace(liveEntries, bundle.entries);
  replace(liveSales, bundle.sales);
  replace(liveCycles, bundle.cycles);
  replace(liveFeed, bundle.feedLogs);
  replace(farmVehicles, bundle.vehicles);
}

export async function hydrateRemote(): Promise<boolean> {
  if (!getToken()) return false;
  try {
    const bundle = await api<RemoteBundle>('/api/data');
    applyLive(bundle);
    cached = bundle;
    return true;
  } catch (error) {
    console.warn('Load farm:', error instanceof Error ? error.message : error);
    return false;
  }
}

export function clearRemote(): void {
  cached = null;
  applyLive({
    farm: {
      id: '',
      name: '',
      ownerName: '',
      village: '',
      areaUnit: 'acres',
      weightUnit: 'kg',
      language: 'en',
    },
    notifications: { daily: true, dailyTime: '19:00', dues: true, lease: true },
    ponds: [],
    parties: [],
    entries: [],
    sales: [],
    payments: [],
    cycles: [],
    feedLogs: [],
    categories: [],
    team: [],
    vehicles: [],
  });
}

export async function upsertRows(table: string, rows: object[]): Promise<void> {
  if (!getToken() || rows.length === 0) return;
  await api(`/api/data/${table}`, { method: 'POST', body: JSON.stringify({ rows }) });
}

export async function deleteRow(table: string, id: string): Promise<void> {
  if (!getToken()) return;
  await api(`/api/data/${table}/${id}`, { method: 'DELETE' });
}

export function saveFarm(farm: Farm, notifications: SettingsNotifications): void {
  void upsertRows('farms', [{ ...farm, ...notifications }]);
}

export function saveEntries(list: LedgerEntry[]): void {
  void upsertRows('entries', list);
}

export function deleteRemoteEntry(id: string): void {
  void deleteRow('entries', id);
}

export function saveParties(list: Party[]): void {
  void upsertRows('parties', list);
}

export function deleteRemoteParty(id: string): void {
  void deleteRow('parties', id);
}

export function saveSales(list: HarvestSale[]): void {
  void upsertRows('sales', list);
}

export function savePayments(list: PartyPayment[]): void {
  void upsertRows('payments', list);
}

export function saveCategories(list: SettingsCategory[]): void {
  void upsertRows(
    'categories',
    list.map((item, sort) => ({ ...item, sort })),
  );
}

export function saveTeam(list: TeamMember[]): void {
  void upsertRows('team', list);
}

export function deleteRemoteTeam(id: string): void {
  void deleteRow('team', id);
}

export function saveVehicles(list: FarmVehicle[]): void {
  void upsertRows('vehicles', list);
}

export function savePonds(list: Pond[]): void {
  void upsertRows('ponds', list);
}

export function saveCycles(list: CropCycle[]): void {
  void upsertRows('cycles', list);
}

export function saveFeedLogs(list: FeedLog[]): void {
  void upsertRows('feed_logs', list);
}

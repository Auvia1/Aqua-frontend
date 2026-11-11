import type { BarPoint, ChartSlice, LedgerEntry } from '@/types';

export const sampleEntries: LedgerEntry[] = [
  {
    id: 'tx-1',
    title: 'Gopal Feeds',
    subtitle: 'Pond 1 · Credit',
    amount: 18400,
    kind: 'expense',
    category: 'feed',
    date: '2026-11-10',
    pondId: 'pond-1',
    partyId: 'vendor-gopal',
    payment: 'credit',
  },
  {
    id: 'tx-2',
    title: 'Harvest sale',
    subtitle: 'Pond 4 · Sai Exports',
    amount: 126500,
    kind: 'revenue',
    category: 'revenue',
    date: '2026-11-09',
    pondId: 'pond-4',
    partyId: 'buyer-sai',
    payment: 'paid',
  },
  {
    id: 'tx-3',
    title: 'Vijaya Aqua Meds',
    subtitle: 'Pond 2 · Paid',
    amount: 2450,
    kind: 'expense',
    category: 'medicine',
    date: '2026-11-08',
    pondId: 'pond-2',
    partyId: 'vendor-vijaya',
    payment: 'paid',
  },
  {
    id: 'tx-4',
    title: 'Labour — Raju',
    subtitle: 'Pond 3 · Paid',
    amount: 1200,
    kind: 'expense',
    category: 'labour',
    date: '2026-11-07',
    pondId: 'pond-3',
    partyId: 'worker-raju',
    payment: 'paid',
  },
];

export const sampleSlices: ChartSlice[] = [
  { name: 'Feed', value: 42, color: '#164232' },
  { name: 'Labour', value: 18, color: '#1E5640' },
  { name: 'Medicine', value: 14, color: '#4E9A6B' },
  { name: 'Fuel', value: 10, color: '#6FB584' },
  { name: 'Common', value: 9, color: '#9CC9A8' },
  { name: 'Others', value: 7, color: '#C9DFC6' },
];

export const sampleBars: BarPoint[] = [
  { label: 'Jun', value: 42000 },
  { label: 'Jul', value: 51000 },
  { label: 'Aug', value: 38000 },
  { label: 'Sep', value: 62000 },
  { label: 'Oct', value: 54000 },
  { label: 'Nov', value: 71800 },
];

import type { CategoryId } from '@/types';

export const EXPENSE_TABS = [
  { value: 'pond', label: 'Pond expense' },
  { value: 'common', label: 'Common expense' },
] as const;

export function unitLabel(unit: string, qty: number): string {
  if (qty === 1) return unit;
  if (unit === 'kg') return 'kg';
  return `${unit}s`;
}

export const EXPENSE_CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'medicine', label: 'Medicine' },
  { id: 'labour', label: 'Labour' },
  { id: 'transport', label: 'Transport' },
  { id: 'seed', label: 'Seed' },
  { id: 'pond_prep', label: 'Pond prep' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'lab', label: 'Lab' },
  { id: 'harvest', label: 'Harvest' },
  { id: 'misc', label: 'Misc' },
];

export const ITEM_SUGGESTIONS: Record<string, string[]> = {
  feed: ['CP 2mm', 'CP 3mm', 'Grower', 'Starter'],
  medicine: ['Oxytetracycline', 'Probiotic', 'Lime', 'Mineral mix'],
  labour: ['Daily wages', 'Night watch', 'Harvest gang'],
  transport: ['Ice & transport', 'Lorry hire', 'Auto'],
  seed: ['PL 10', 'PL 12', 'Fingerlings'],
  pond_prep: ['Lime', 'Drying', 'Sludge out'],
  fuel: ['Diesel', 'Petrol'],
  lab: ['Water test', 'PCR'],
  harvest: ['Harvest labour', 'Ice boxes'],
  misc: ['Ice', 'Net repair'],
};

export const QTY_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'bag', label: 'bag' },
  { value: 'litre', label: 'litre' },
  { value: 'piece', label: 'piece' },
  { value: 'packet', label: 'packet' },
] as const;

export const FEED_BRANDS = [
  { value: 'cp', label: 'CP' },
  { value: 'avanti', label: 'Avanti' },
  { value: 'grobest', label: 'Grobest' },
  { value: 'local', label: 'Local' },
  { value: 'other', label: 'Other' },
] as const;

export const FEED_SIZES = [
  { value: '0.5mm', label: '0.5 mm' },
  { value: '1mm', label: '1 mm' },
  { value: '2mm', label: '2 mm' },
  { value: '3mm', label: '3 mm' },
  { value: 'pellet', label: 'Pellet' },
] as const;

export const WORK_DONE = [
  { value: 'feeding', label: 'Feeding' },
  { value: 'pond_prep', label: 'Pond prep' },
  { value: 'net', label: 'Net work' },
  { value: 'harvest', label: 'Harvest' },
  { value: 'guarding', label: 'Guarding' },
  { value: 'other', label: 'Other' },
] as const;

export const MEDICINE_TYPES = ['Antibiotic', 'Probiotic', 'Mineral', 'Disinfectant', 'Other'] as const;
export const VEHICLE_TYPES = ['Auto', 'Own vehicle', 'Tractor', 'Other'] as const;
export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank', label: 'Bank' },
  { value: 'cheque', label: 'Cheque' },
] as const;

export interface YesterdayFeed {
  meals: { time: string; kg: number }[];
  brand: string;
  size: string;
  bagWeight: number;
  pricePerBag: number;
  vendorId: string;
}

export const YESTERDAY_FEED: Record<string, YesterdayFeed> = {};

export const DEFAULT_MEALS = [
  { time: '06:00', kg: 0 },
  { time: '10:00', kg: 0 },
  { time: '14:00', kg: 0 },
  { time: '18:00', kg: 0 },
];

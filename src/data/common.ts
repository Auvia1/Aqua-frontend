import type { CategoryId, CommonCat, CommonFilter, LeasePeriod } from '@/types';

export const COMMON_CATS: { id: CommonCat; category: CategoryId; label: string }[] = [
  { id: 'electricity', category: 'electricity', label: 'Electricity' },
  { id: 'vehicle', category: 'vehicle', label: 'Vehicle' },
  { id: 'salary', category: 'salary', label: 'Staff salary' },
  { id: 'misc', category: 'misc', label: 'Other' },
];

export const COMMON_FILTERS: { id: CommonFilter; category: CategoryId | 'other'; label: string }[] = [
  { id: 'electricity', category: 'electricity', label: 'Electricity' },
  { id: 'vehicle', category: 'vehicle', label: 'Vehicle' },
  { id: 'other', category: 'other', label: 'Other' },
];

export const LEASE_PERIODS: { value: LeasePeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const FREQUENCIES = LEASE_PERIODS;

export const farmVehicles: { id: string; name: string; number: string }[] = [];

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  approx: boolean;
  dueDate: string;
  category: CommonFilter;
}

export const recurringItems: RecurringItem[] = [];

export const SHRIMP_COUNTS = ['20', '30', '40', '50', '60', '80', '100'].map((count) => ({
  value: count,
  label: `${count} count`,
}));

export const FISH_GRADES = [
  { value: 'large', label: 'Large' },
  { value: 'medium', label: 'Medium' },
  { value: 'small', label: 'Small' },
];

export const LOT_SIZES = [...SHRIMP_COUNTS, ...FISH_GRADES];

import type { CategoryId } from '@/types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  tint: string;
}

export const CATEGORIES: readonly CategoryMeta[] = [
  { id: 'feed', label: 'Feed', tint: 'bg-leaf-200 text-forest-800' },
  { id: 'medicine', label: 'Medicine', tint: 'bg-lime-100 text-forest-700' },
  { id: 'labour', label: 'Labour', tint: 'bg-leaf-300/40 text-forest-800' },
  { id: 'transport', label: 'Transport', tint: 'bg-tile text-forest-700' },
  { id: 'seed', label: 'Seed', tint: 'bg-leaf-200 text-forest-800' },
  { id: 'pond_prep', label: 'Pond prep', tint: 'bg-lime-100 text-forest-800' },
  { id: 'fuel', label: 'Fuel / Aeration', tint: 'bg-leaf-300/35 text-forest-800' },
  { id: 'lab', label: 'Lab', tint: 'bg-tile text-forest-700' },
  { id: 'harvest', label: 'Harvest cost', tint: 'bg-leaf-200 text-forest-800' },
  { id: 'misc', label: 'Misc', tint: 'bg-tile text-muted' },
  { id: 'electricity', label: 'Electricity', tint: 'bg-lime-100 text-forest-800' },
  { id: 'lease', label: 'Lease', tint: 'bg-leaf-200 text-forest-700' },
  { id: 'vehicle', label: 'Vehicle', tint: 'bg-tile text-forest-800' },
  { id: 'maintenance', label: 'Maintenance', tint: 'bg-leaf-300/40 text-forest-800' },
  { id: 'salary', label: 'Salary', tint: 'bg-lime-100 text-forest-800' },
  { id: 'revenue', label: 'Revenue', tint: 'bg-leaf-200 text-leaf-500' },
] as const;

export const CATEGORY_BY_ID: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>,
);

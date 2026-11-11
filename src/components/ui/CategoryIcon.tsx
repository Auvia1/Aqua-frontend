import {
  BadgeIndianRupee,
  Car,
  FileText,
  FlaskConical,
  Fuel,
  MoreHorizontal,
  Package,
  Pill,
  Shovel,
  Sprout,
  TrendingUp,
  Truck,
  Users,
  Wheat,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORY_BY_ID } from '@/data/categories';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import type { CategoryId } from '@/types';

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  feed: Wheat,
  medicine: Pill,
  labour: Users,
  transport: Truck,
  seed: Sprout,
  pond_prep: Shovel,
  fuel: Fuel,
  lab: FlaskConical,
  harvest: Package,
  misc: MoreHorizontal,
  electricity: Zap,
  lease: FileText,
  vehicle: Car,
  maintenance: Wrench,
  salary: BadgeIndianRupee,
  revenue: TrendingUp,
};

interface CategoryIconProps {
  category: CategoryId;
  size?: 'sm' | 'md';
}

export function CategoryIcon({ category, size = 'md' }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category];
  const meta = CATEGORY_BY_ID[category];
  const box = size === 'sm' ? 'h-10 w-10' : 'h-11 w-11';
  const iconSize = size === 'sm' ? 18 : ICON.size;

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full', box, meta.tint)}
      aria-hidden
    >
      <Icon size={iconSize} strokeWidth={ICON.stroke} />
    </span>
  );
}

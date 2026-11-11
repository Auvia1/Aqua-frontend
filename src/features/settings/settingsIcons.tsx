import {
  Car,
  FlaskConical,
  Fuel,
  Package,
  Pill,
  Shovel,
  Sprout,
  Truck,
  Users,
  Wheat,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import type { SettingsIconId } from '@/types';

export const SETTINGS_ICON: Record<SettingsIconId, LucideIcon> = {
  wheat: Wheat,
  pill: Pill,
  users: Users,
  truck: Truck,
  sprout: Sprout,
  shovel: Shovel,
  fuel: Fuel,
  flask: FlaskConical,
  package: Package,
  zap: Zap,
  car: Car,
  wrench: Wrench,
};

export function SettingsGlyph({
  icon,
  tint,
  size = 'md',
}: {
  icon: SettingsIconId;
  tint: string;
  size?: 'sm' | 'md';
}) {
  const Glyph = SETTINGS_ICON[icon];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        size === 'sm' ? 'h-10 w-10' : 'h-11 w-11',
        tint,
      )}
      aria-hidden
    >
      <Glyph size={size === 'sm' ? 18 : ICON.size} strokeWidth={ICON.stroke} />
    </span>
  );
}

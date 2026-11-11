import type { FarmVehicle, SettingsCategory, SettingsIconId, SettingsNotifications, TeamMember } from '@/types';

export const SETTINGS_ICONS: { id: SettingsIconId; label: string }[] = [
  { id: 'wheat', label: 'Feed' },
  { id: 'pill', label: 'Medicine' },
  { id: 'users', label: 'Labour' },
  { id: 'truck', label: 'Transport' },
  { id: 'sprout', label: 'Seed' },
  { id: 'shovel', label: 'Pond prep' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'flask', label: 'Lab' },
  { id: 'package', label: 'Harvest' },
  { id: 'zap', label: 'Power' },
  { id: 'car', label: 'Vehicle' },
  { id: 'wrench', label: 'Repair' },
];

export const SETTINGS_TINTS = [
  'bg-leaf-200 text-forest-800',
  'bg-lime-100 text-forest-700',
  'bg-leaf-300/40 text-forest-800',
  'bg-tile text-forest-700',
  'bg-leaf-200 text-leaf-500',
] as const;

export const defaultCategories: SettingsCategory[] = [
  { id: 'feed', name: 'Feed', icon: 'wheat', tint: SETTINGS_TINTS[0], group: 'pond', locked: true, enabled: true },
  { id: 'medicine', name: 'Medicine', icon: 'pill', tint: SETTINGS_TINTS[1], group: 'pond', locked: true, enabled: true },
  { id: 'labour', name: 'Labour', icon: 'users', tint: SETTINGS_TINTS[2], group: 'pond', locked: true, enabled: true },
  { id: 'transport', name: 'Transport', icon: 'truck', tint: SETTINGS_TINTS[3], group: 'pond', locked: true, enabled: true },
  { id: 'seed', name: 'Seed', icon: 'sprout', tint: SETTINGS_TINTS[0], group: 'pond', locked: true, enabled: true },
  { id: 'pond_prep', name: 'Pond prep', icon: 'shovel', tint: SETTINGS_TINTS[1], group: 'pond', locked: true, enabled: true },
  { id: 'fuel', name: 'Fuel / Aeration', icon: 'fuel', tint: SETTINGS_TINTS[2], group: 'pond', locked: true, enabled: true },
  { id: 'lab', name: 'Lab', icon: 'flask', tint: SETTINGS_TINTS[3], group: 'pond', locked: true, enabled: true },
  { id: 'harvest', name: 'Harvest cost', icon: 'package', tint: SETTINGS_TINTS[0], group: 'pond', locked: true, enabled: true },
  { id: 'misc', name: 'Misc', icon: 'wrench', tint: SETTINGS_TINTS[3], group: 'pond', locked: true, enabled: true },
  {
    id: 'custom-probiotics',
    name: 'Probiotics',
    icon: 'flask',
    tint: SETTINGS_TINTS[1],
    group: 'pond',
    locked: false,
    enabled: true,
  },
  { id: 'electricity', name: 'Electricity', icon: 'zap', tint: SETTINGS_TINTS[1], group: 'common', locked: true, enabled: true },
  { id: 'vehicle', name: 'Vehicle', icon: 'car', tint: SETTINGS_TINTS[3], group: 'common', locked: true, enabled: true },
  { id: 'salary', name: 'Salary', icon: 'users', tint: SETTINGS_TINTS[1], group: 'common', locked: true, enabled: true },
];

export const defaultTeam: TeamMember[] = [];

export const defaultVehicles: FarmVehicle[] = [];

export const defaultNotifications: SettingsNotifications = {
  daily: true,
  dailyTime: '19:00',
  dues: true,
  lease: true,
};

export const ROLE_COPY: Record<TeamMember['role'], { label: string; detail: string }> = {
  owner: { label: 'Owner', detail: 'Everything — farm, team, reports and money.' },
  manager: { label: 'Manager', detail: 'Add and edit all entries and view reports.' },
  entry: { label: 'Entry only', detail: 'Add expenses and feed only.' },
};

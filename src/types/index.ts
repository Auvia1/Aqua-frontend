export type AreaUnit = 'acres' | 'cents';
export type WeightUnit = 'kg' | 'quintal';
export type Language = 'en' | 'te';
export type PaymentStatus = 'paid' | 'credit';
export type EntryKind = 'expense' | 'revenue' | 'common';
export type PondStatus = 'active' | 'idle' | 'harvested';
export type WaterType = 'brackish' | 'fresh';
export type WaterSource = 'canal' | 'borewell' | 'sea_creek' | 'river' | 'other';
export type SpeciesId =
  | 'vannamei'
  | 'black_tiger'
  | 'rohu'
  | 'catla'
  | 'pangasius'
  | 'tilapia'
  | 'other';
export type SeedUnit = 'pieces' | 'lakh';
export type PondSort = 'name' | 'spend' | 'cycle';
export type PondListFilter = 'all' | PondStatus;
export type CycleStatus = 'active' | 'closed';
export type CloseReason = 'full' | 'partial' | 'disease' | 'other';
export type DetailTab = 'expenses' | 'feed' | 'revenue' | 'summary';
export type ExpenseChip = 'all' | 'feed' | 'medicine' | 'labour' | 'transport' | 'misc';
export type PartyKind = 'vendor' | 'worker' | 'buyer';
export type PaymentMode = 'cash' | 'upi' | 'bank' | 'cheque';
export type QtyUnit = 'kg' | 'bag' | 'litre' | 'piece' | 'packet';
export type LabourType = 'wage' | 'advance' | 'bonus';
export type WorkBasis = 'day' | 'hours' | 'piece';
export type SplitRule = 'area' | 'equal' | 'manual';
export type HarvestType = 'partial' | 'full';
export type CommonCat = 'electricity' | 'lease' | 'vehicle' | 'salary' | 'misc';
export type CommonFilter = 'electricity' | 'lease' | 'vehicle' | 'other';
export type LeasePeriod = 'monthly' | 'quarterly' | 'yearly';

export type CategoryId =
  | 'feed'
  | 'medicine'
  | 'labour'
  | 'transport'
  | 'seed'
  | 'pond_prep'
  | 'fuel'
  | 'lab'
  | 'harvest'
  | 'misc'
  | 'electricity'
  | 'lease'
  | 'vehicle'
  | 'maintenance'
  | 'salary'
  | 'revenue';

export interface Farm {
  id: string;
  name: string;
  ownerName: string;
  village: string;
  phone?: string;
  areaUnit: AreaUnit;
  weightUnit: WeightUnit;
  language: Language;
}

export interface Pond {
  id: string;
  name: string;
  code?: string;
  species: string;
  speciesIds: SpeciesId[];
  otherSpecies?: string;
  areaAcres: number;
  depthFt?: number;
  waterType: WaterType;
  waterSource?: WaterSource;
  aerators: number;
  hdpeLined: boolean;
  leased: boolean;
  leaseAmountYear?: number;
  leaseEndDate?: string;
  notes?: string;
  status: PondStatus;
  cycleDay?: number;
  cycleLength?: number;
  cycleNumber?: number;
  lastCycleNumber?: number;
  lastCycleProfit?: number;
}

export interface Party {
  id: string;
  name: string;
  kind: PartyKind;
  phone?: string;
  place?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  role: string;
  dailyWage: number;
  advanceOutstanding: number;
}

export interface LedgerEntry {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  kind: Exclude<EntryKind, 'common'>;
  category: CategoryId;
  date: string;
  pondId: string | 'common';
  cycleId?: string;
  partyId?: string;
  payment: PaymentStatus;
  note?: string;
  cycleLabel?: string;
  time?: string;
  item?: string;
  qty?: number;
  unit?: string;
  rate?: number;
  mode?: PaymentMode;
  addedBy?: string;
  photoUrl?: string;
  dueDate?: string;
  paidDate?: string;
  settledAmount?: number;
}

export interface PartyPayment {
  id: string;
  partyId: string;
  date: string;
  amount: number;
  mode: PaymentMode;
  note?: string;
  entryIds?: string[];
}

export type LedgerTab = 'all' | 'expense' | 'revenue';
export type LedgerStatus = 'all' | 'paid' | 'credit';
export type DatePreset = 'today' | '7d' | 'month' | 'lastMonth' | 'cycle' | 'custom';
export type DueChip = 'all' | 'overdue' | 'week';
export type DueSort = 'amount' | 'dueDate' | 'name';
export type DueTab = 'pay' | 'receive';

export type PeriodId = 'today' | 'week' | 'month';
export type ReportPeriodId = 'month' | 'lastMonth' | 'last3' | 'cycle' | 'custom';
export type ReportTab = 'spending' | 'revenue' | 'ponds';
export type SpendGrain = 'daily' | 'weekly' | 'monthly';
export type PondMetricSort = 'profit' | 'spend' | 'costKg';
export type TeamRole = 'owner' | 'manager' | 'entry';
export type SettingsIconId =
  | 'wheat'
  | 'pill'
  | 'users'
  | 'truck'
  | 'sprout'
  | 'shovel'
  | 'fuel'
  | 'flask'
  | 'package'
  | 'zap'
  | 'car'
  | 'wrench';

export interface SettingsCategory {
  id: string;
  name: string;
  icon: SettingsIconId;
  tint: string;
  group: 'pond' | 'common';
  locked: boolean;
  enabled: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  role: TeamRole;
}

export interface FarmVehicle {
  id: string;
  name: string;
  number: string;
}

export interface SettingsNotifications {
  daily: boolean;
  dailyTime: string;
  dues: boolean;
  lease: boolean;
}

export interface DayPoint {
  label: string;
  date: string;
  spend: number;
  revenue: number;
}

export interface HomeAlert {
  id: string;
  title: string;
  time: string;
  kind: 'dues' | 'lease' | 'missing';
}

export interface FarmSetupInput {
  name: string;
  ownerName: string;
  village: string;
  areaUnit: AreaUnit;
  weightUnit: WeightUnit;
  language: Language;
}

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface BarPoint {
  label: string;
  value: number;
}

export interface CropCycle {
  id: string;
  pondId: string;
  number: number;
  species: string;
  status: CycleStatus;
  startDate: string;
  endDate?: string;
  expectedDays: number;
  recordedProfit?: number;
  feedVendorId?: string;
  feedBrand?: string;
  feedSize?: string;
  feedBagWeight?: number;
  feedPricePerBag?: number;
  feedPayment?: PaymentStatus;
}

export interface FeedLog {
  id: string;
  pondId: string;
  cycleId: string;
  date: string;
  meals: number;
  kg: number;
  cost: number;
}

export interface HarvestSale {
  id: string;
  pondId: string;
  cycleId: string;
  date: string;
  buyer: string;
  qtyKg: number;
  countSize: string;
  ratePerKg: number;
  netAmount: number;
  receivedAmount: number;
  openingReceived?: number;
  dueDate?: string;
}

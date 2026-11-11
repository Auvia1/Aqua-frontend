import { farm } from '@/data/farm';
import { nid } from '@/lib/api';
import { SPECIES_OPTIONS } from '@/services/ponds';
import type { AreaUnit, Pond, SpeciesId, WaterSource, WaterType } from '@/types';

export interface PondFormValues {
  name: string;
  code: string;
  area: string;
  areaUnit: AreaUnit;
  depth: string;
  waterType: WaterType;
  speciesIds: SpeciesId[];
  otherSpecies: string;
  waterSource: WaterSource | '';
  aerators: number;
  hdpeLined: boolean;
  leased: boolean;
  leaseAmount: string;
  leaseEnd: string;
  notes: string;
  photoName: string;
}

export const REQUIRED = 'This field is required';

export function emptyPondForm(): PondFormValues {
  return {
    name: '',
    code: '',
    area: '',
    areaUnit: farm.areaUnit,
    depth: '',
    waterType: 'brackish',
    speciesIds: [],
    otherSpecies: '',
    waterSource: '',
    aerators: 0,
    hdpeLined: false,
    leased: false,
    leaseAmount: '',
    leaseEnd: '',
    notes: '',
    photoName: '',
  };
}

export function pondToForm(pond: Pond): PondFormValues {
  return {
    name: pond.name,
    code: pond.code ?? '',
    area: farm.areaUnit === 'cents' ? String(pond.areaAcres * 100) : String(pond.areaAcres),
    areaUnit: farm.areaUnit,
    depth: pond.depthFt != null ? String(pond.depthFt) : '',
    waterType: pond.waterType,
    speciesIds: [...pond.speciesIds],
    otherSpecies: pond.otherSpecies ?? '',
    waterSource: pond.waterSource ?? '',
    aerators: pond.aerators,
    hdpeLined: pond.hdpeLined,
    leased: pond.leased,
    leaseAmount: pond.leaseAmountYear != null ? String(pond.leaseAmountYear) : '',
    leaseEnd: pond.leaseEndDate ?? '',
    notes: pond.notes ?? '',
    photoName: '',
  };
}

export function snapshot(values: PondFormValues): string {
  return JSON.stringify(values);
}

export function parsePositive(value: string): number | null {
  const n = Number(value);
  if (value.trim() === '' || Number.isNaN(n)) return null;
  return n;
}

export function validatePondForm(values: PondFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = REQUIRED;
  const area = parsePositive(values.area);
  if (values.area.trim() === '') errors.area = REQUIRED;
  else if (area == null || area <= 0) errors.area = 'Enter an area greater than 0';
  return errors;
}

export function formToPond(values: PondFormValues, existing?: Pond): Pond {
  const raw = Number(values.area) || 0;
  const acres = values.areaUnit === 'cents' ? raw / 100 : raw;
  const labels = values.speciesIds
    .map((id) => (id === 'other' ? values.otherSpecies.trim() : SPECIES_OPTIONS.find((item) => item.id === id)?.label))
    .filter((label): label is string => Boolean(label));
  return {
    id: existing?.id ?? nid('pond'),
    name: values.name.trim(),
    code: values.code.trim() || undefined,
    species: labels.join(' + ') || values.otherSpecies.trim(),
    speciesIds: [...values.speciesIds],
    otherSpecies: values.otherSpecies.trim() || undefined,
    areaAcres: acres,
    depthFt: values.depth.trim() ? Number(values.depth) : undefined,
    waterType: values.waterType,
    waterSource: values.waterSource || undefined,
    aerators: values.aerators,
    hdpeLined: values.hdpeLined,
    leased: false,
    notes: values.notes.trim() || undefined,
    status: existing?.status ?? 'idle',
    cycleDay: existing?.cycleDay,
    cycleLength: existing?.cycleLength,
    cycleNumber: existing?.cycleNumber,
    lastCycleNumber: existing?.lastCycleNumber,
    lastCycleProfit: existing?.lastCycleProfit,
  };
}

export function convertArea(value: string, from: AreaUnit, to: AreaUnit): string {
  if (from === to) return value;
  const n = Number(value);
  if (value.trim() === '' || Number.isNaN(n)) return value;
  const acres = from === 'acres' ? n : n / 100;
  const next = to === 'acres' ? acres : acres * 100;
  return Number.isInteger(next) ? String(next) : String(Number(next.toFixed(2)));
}

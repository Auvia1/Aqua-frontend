import type { Farm, Party, Pond } from '@/types';

export const farm: Farm = {
  id: '',
  name: '',
  ownerName: '',
  village: '',
  areaUnit: 'acres',
  weightUnit: 'kg',
  language: 'en',
};

export const ponds: Pond[] = [];
export const parties: Party[] = [];

export const hatcheries = [
  { id: 'hatch-andhra', name: 'Andhra Hatcheries' },
  { id: 'hatch-ciba', name: 'CIBA hatchery' },
  { id: 'hatch-local', name: 'Local seed dealer' },
] as const;

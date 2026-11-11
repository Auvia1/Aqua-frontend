import { farm } from '@/data/farm';
import type { Farm } from '@/types';

export async function loadFarm(): Promise<Farm> {
  return farm;
}

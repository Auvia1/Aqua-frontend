import { DEFAULT_MEALS } from '@/data/addCatalog';
import { entries } from '@/data/entries';
import { feedLogs } from '@/data/feedLogs';

export interface MealSnap {
  time: string;
  kg: number;
}

const MEMORY_KEY = 'aqua.feedMeals';

function day(value: string): string {
  return value.slice(0, 10);
}

function shiftDay(iso: string, days: number): string {
  const [year, month, date] = iso.split('-').map(Number);
  const next = new Date(year ?? 1970, (month ?? 1) - 1, date ?? 1);
  next.setDate(next.getDate() + days);
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${next.getFullYear()}-${mm}-${dd}`;
}

function readAll(): Record<string, MealSnap[]> {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, MealSnap[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function memoryKey(pondId: string, date: string): string {
  return `${pondId}|${day(date)}`;
}

export function rememberMeals(pondId: string, date: string, meals: MealSnap[]): void {
  const map = readAll();
  map[memoryKey(pondId, date)] = meals.map((meal) => ({ time: meal.time, kg: meal.kg }));
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(map));
  } catch {
    /* private mode */
  }
}

function usable(meals: MealSnap[] | undefined): boolean {
  return Boolean(meals?.some((meal) => meal.kg > 0));
}

function splitKg(kg: number, count: number): MealSnap[] {
  const slots = count > 0 ? Math.min(6, count) : 1;
  const times = DEFAULT_MEALS.map((meal) => meal.time);
  while (times.length < slots) times.push('12:00');
  const each = Math.floor((kg / slots) * 10) / 10;
  const meals = times.slice(0, slots).map((time) => ({ time, kg: each }));
  const used = Math.round(meals.reduce((sum, meal) => sum + meal.kg, 0) * 10) / 10;
  const last = meals[meals.length - 1];
  if (last) last.kg = Math.round((last.kg + (kg - used)) * 10) / 10;
  return meals;
}

export function mealsToCopy(
  pondId: string,
  date: string,
): { meals: MealSnap[]; fromYesterday: boolean; sourceDate: string } | null {
  const selected = day(date);
  const yesterday = shiftDay(selected, -1);
  const memory = readAll();
  const dates = new Set<string>();

  for (const [key, meals] of Object.entries(memory)) {
    const splitAt = key.lastIndexOf('|');
    if (splitAt < 0) continue;
    const pond = key.slice(0, splitAt);
    const logged = key.slice(splitAt + 1);
    if (pond === pondId && logged < selected && usable(meals)) dates.add(logged);
  }

  for (const log of feedLogs) {
    const logged = day(log.date);
    if (log.pondId === pondId && logged < selected && Number(log.kg) > 0) dates.add(logged);
  }

  for (const entry of entries) {
    const logged = day(entry.date);
    const qty = Number(entry.qty) || 0;
    if (
      entry.pondId === pondId &&
      entry.category === 'feed' &&
      logged < selected &&
      qty > 0 &&
      (entry.unit === 'kg' || entry.unit == null)
    ) {
      dates.add(logged);
    }
  }

  if (dates.size === 0) return null;
  const sorted = [...dates].sort();
  const latest = sorted[sorted.length - 1];
  if (!latest) return null;
  const sourceDate = dates.has(yesterday) ? yesterday : latest;
  const stored = memory[memoryKey(pondId, sourceDate)];
  const fromYesterday = sourceDate === yesterday;
  if (stored && usable(stored)) {
    return { meals: stored.map((meal) => ({ ...meal })), fromYesterday, sourceDate };
  }

  const log = feedLogs.find((item) => item.pondId === pondId && day(item.date) === sourceDate && Number(item.kg) > 0);
  const loggedRows = log?.rows;
  if (log && loggedRows && usable(loggedRows)) {
    return {
      meals: loggedRows.map((meal) => ({ time: meal.time, kg: meal.kg })),
      fromYesterday,
      sourceDate,
    };
  }
  if (log) {
    return {
      meals: splitKg(Number(log.kg), Number(log.meals) || 0),
      fromYesterday,
      sourceDate,
    };
  }

  const entry = entries.find(
    (item) => item.pondId === pondId && item.category === 'feed' && day(item.date) === sourceDate && Number(item.qty) > 0,
  );
  if (entry) {
    return { meals: splitKg(Number(entry.qty), 4), fromYesterday, sourceDate };
  }
  return null;
}

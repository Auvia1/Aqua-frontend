import { EN, TE, type TKey } from '@/i18n/strings';
import type { Language, TeamRole } from '@/types';

const TABLES = { en: EN, te: TE } as const;
const LANG_KEY = 'aqua.lang';

let currentLang: Language = 'en';

export type { TKey };

export function getLang(): Language {
  return currentLang;
}

export function readStoredLang(): Language | null {
  try {
    const value = sessionStorage.getItem(LANG_KEY);
    if (value === 'en' || value === 'te') return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function applyLanguage(lang: Language): void {
  currentLang = lang;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang === 'te' ? 'te' : 'en';
  }
  try {
    sessionStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

export function translate(lang: Language, key: TKey, vars?: Record<string, string | number>): string {
  let text: string = TABLES[lang][key] ?? EN[key];
  if (vars) {
    Object.entries(vars).forEach(([name, value]) => {
      text = text.split(`{${name}}`).join(String(value));
    });
  }
  return text;
}

export function t(key: TKey, vars?: Record<string, string | number>): string {
  return translate(currentLang, key, vars);
}

export function displayPondName(lang: Language, pondId: string, fallback?: string): string {
  if (pondId === 'all') return translate(lang, 'allPonds');
  if (pondId === 'common') return translate(lang, 'common');
  if (fallback) return fallback;
  const match = pondId.match(/^pond-(\d+)$/);
  if (match?.[1]) return translate(lang, 'pondN', { n: match[1] });
  return pondId;
}

const CAT_KEY: Record<string, TKey> = {
  feed: 'cat_feed',
  medicine: 'cat_medicine',
  labour: 'cat_labour',
  transport: 'cat_transport',
  seed: 'cat_seed',
  pond_prep: 'cat_pond_prep',
  fuel: 'cat_fuel',
  lab: 'cat_lab',
  harvest: 'cat_harvest',
  misc: 'cat_misc',
  electricity: 'cat_electricity',
  lease: 'cat_lease',
  vehicle: 'cat_vehicle',
  maintenance: 'cat_maintenance',
  salary: 'cat_salary',
  revenue: 'cat_revenue',
};

export function categoryLabel(lang: Language, id: string, fallback?: string): string {
  const key = CAT_KEY[id];
  if (key) return translate(lang, key);
  return fallback ?? id;
}

const DONUT_NAME_KEY: Record<string, TKey> = {
  Feed: 'cat_feed',
  Medicine: 'cat_medicine',
  Labour: 'cat_labour',
  Seed: 'cat_seed',
  Transport: 'cat_transport',
  Others: 'others',
};

export function donutLabel(lang: Language, name: string): string {
  const key = DONUT_NAME_KEY[name];
  return key ? translate(lang, key) : name;
}

export function roleCopy(lang: Language, role: TeamRole): { label: string; detail: string } {
  if (role === 'owner') return { label: translate(lang, 'owner'), detail: translate(lang, 'ownerDetail') };
  if (role === 'manager') return { label: translate(lang, 'manager'), detail: translate(lang, 'managerDetail') };
  return { label: translate(lang, 'entryOnly'), detail: translate(lang, 'entryDetail') };
}

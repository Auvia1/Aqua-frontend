import { ponds } from '@/data/farm';

const LAST_POND_KEY = 'aqua.lastPond';

export function recallPond(): string | null {
  try {
    return window.sessionStorage.getItem(LAST_POND_KEY);
  } catch {
    return null;
  }
}

export function rememberPond(id: string): void {
  try {
    window.sessionStorage.setItem(LAST_POND_KEY, id);
  } catch {
    /* ignore */
  }
}

export function activePonds() {
  return ponds.filter((pond) => pond.status === 'active');
}

export function pickDefaultPond(param?: string | null): string {
  const active = activePonds();
  if (param && active.some((pond) => pond.id === param)) return param;
  const last = recallPond();
  if (last && active.some((pond) => pond.id === last)) return last;
  return active[0]?.id ?? '';
}

export function nextActivePond(currentId: string): string {
  const active = activePonds();
  const index = active.findIndex((pond) => pond.id === currentId);
  if (index < 0) return active[0]?.id ?? currentId;
  return active[(index + 1) % active.length]?.id ?? currentId;
}

export function appendAmount(current: string, key: string): string {
  if (key === '00') {
    if (current === '' || current === '0') return current || '0';
    return `${current}00`;
  }
  if (key === '0' && (current === '' || current === '0')) return '0';
  if (current === '' || current === '0') return key;
  return `${current}${key}`;
}

export function backspaceAmount(current: string): string {
  if (current.length <= 1) return '0';
  return current.slice(0, -1);
}

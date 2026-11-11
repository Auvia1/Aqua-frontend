import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { farm as liveFarm } from '@/data/farm';
import {
  defaultCategories,
  defaultNotifications,
  defaultTeam,
  defaultVehicles,
} from '@/data/settings';
import { applyLanguage, readStoredLang } from '@/i18n';
import {
  deleteRemoteTeam,
  getRemoteCache,
  saveCategories,
  saveFarm,
  saveTeam,
  saveVehicles,
} from '@/services/remote';
import type { Farm, FarmVehicle, SettingsCategory, SettingsNotifications, TeamMember } from '@/types';

interface SettingsContextValue {
  profile: Farm;
  setProfile: (patch: Partial<Farm>) => void;
  notifications: SettingsNotifications;
  setNotifications: (patch: Partial<SettingsNotifications>) => void;
  categories: SettingsCategory[];
  setCategories: (next: SettingsCategory[] | ((current: SettingsCategory[]) => SettingsCategory[])) => void;
  team: TeamMember[];
  setTeam: (next: TeamMember[] | ((current: TeamMember[]) => TeamMember[])) => void;
  vehicles: FarmVehicle[];
  setVehicles: (next: FarmVehicle[] | ((current: FarmVehicle[]) => FarmVehicle[])) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function withoutLease(list: SettingsCategory[]): SettingsCategory[] {
  return list.filter((item) => item.id !== 'lease');
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Farm>(() => {
    const next = clone(getRemoteCache()?.farm ?? liveFarm);
    const stored = readStoredLang();
    if (stored) next.language = stored;
    applyLanguage(next.language);
    return next;
  });
  const [notifications, setNotificationsState] = useState<SettingsNotifications>(
    () => clone(getRemoteCache()?.notifications ?? defaultNotifications),
  );
  const [categories, setCategoriesState] = useState<SettingsCategory[]>(
    () => withoutLease(clone(getRemoteCache()?.categories ?? defaultCategories)),
  );
  const [team, setTeamState] = useState<TeamMember[]>(() => clone(getRemoteCache()?.team ?? defaultTeam));
  const [vehicles, setVehiclesState] = useState<FarmVehicle[]>(() => clone(getRemoteCache()?.vehicles ?? defaultVehicles));

  const setProfile = useCallback((patch: Partial<Farm>) => {
    setProfileState((current) => {
      const next = { ...current, ...patch };
      if (patch.language && patch.language !== current.language) {
        applyLanguage(patch.language);
      }
      setNotificationsState((notes) => {
        saveFarm(next, notes);
        return notes;
      });
      return next;
    });
  }, []);

  const setNotifications = useCallback((patch: Partial<SettingsNotifications>) => {
    setNotificationsState((current) => {
      const next = { ...current, ...patch };
      setProfileState((farm) => {
        saveFarm(farm, next);
        return farm;
      });
      return next;
    });
  }, []);

  const setCategories = useCallback(
    (next: SettingsCategory[] | ((current: SettingsCategory[]) => SettingsCategory[])) => {
      setCategoriesState((current) => {
        const resolved = withoutLease(typeof next === 'function' ? next(current) : next);
        saveCategories(resolved);
        return resolved;
      });
    },
    [],
  );

  const setTeam = useCallback((next: TeamMember[] | ((current: TeamMember[]) => TeamMember[])) => {
    setTeamState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      const removed = current.filter((item) => !resolved.some((row) => row.id === item.id));
      removed.forEach((item) => deleteRemoteTeam(item.id));
      saveTeam(resolved);
      return resolved;
    });
  }, []);

  const setVehicles = useCallback((next: FarmVehicle[] | ((current: FarmVehicle[]) => FarmVehicle[])) => {
    setVehiclesState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      saveVehicles(resolved);
      return resolved;
    });
  }, []);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      notifications,
      setNotifications,
      categories,
      setCategories,
      team,
      setTeam,
      vehicles,
      setVehicles,
    }),
    [profile, setProfile, notifications, setNotifications, categories, setCategories, team, setTeam, vehicles, setVehicles],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

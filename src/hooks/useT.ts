import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsProvider';
import { translate, type TKey } from '@/i18n';

export function useT() {
  const { profile } = useSettings();
  const lang = profile.language;
  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );
  return { t, lang };
}

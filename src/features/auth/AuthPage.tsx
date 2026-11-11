import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fish } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/context/AuthProvider';
import { useSettings } from '@/context/SettingsProvider';
import { useUi } from '@/context/UiProvider';
import { useT } from '@/hooks/useT';
import { ICON } from '@/lib/tokens';
import type { Language } from '@/types';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const { showToast } = useUi();
  const { profile, setProfile } = useSettings();
  const { t } = useT();
  const language = profile.language;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [error, setError] = useState('');
  const [userError, setUserError] = useState('');
  const [passError, setPassError] = useState('');
  const [farmError, setFarmError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError('');
    setUserError('');
    setPassError('');
    setFarmError('');
    const name = username.trim();
    if (name.length < 3) {
      setUserError(t('usernameHint'));
      return;
    }
    if (password.length < 6) {
      setPassError(t('passwordHint'));
      return;
    }
    if (mode === 'register' && !farmName.trim()) {
      setFarmError(t('farmRequired'));
      return;
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        await register({
          username: name,
          password,
          farmName: farmName.trim(),
          language: profile.language,
        });
      } else {
        await login(name, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signInFailed'));
      showToast(err instanceof Error ? err.message : t('signInFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto bg-bg px-page pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest-800">
            <Fish size={ICON.size} strokeWidth={ICON.stroke} className="text-lime-300" />
          </span>
          <span className="truncate text-title text-forest-800">Aqua Ledger</span>
        </div>
        <div className="flex shrink-0 gap-1">
          <Chip
            selected={language === 'en'}
            onClick={() => setProfile({ language: 'en' as Language })}
            className="min-h-touch px-3 text-caption"
          >
            English
          </Chip>
          <Chip
            selected={language === 'te'}
            onClick={() => setProfile({ language: 'te' as Language })}
            className="min-h-touch px-3 text-caption"
          >
            తెలుగు
          </Chip>
        </div>
      </div>

      <div className="mt-10">
        <h1 className="text-h1 text-ink">{mode === 'login' ? t('welcomeBack') : t('createAccount')}</h1>
        <p className="mt-2 text-body text-muted">{mode === 'login' ? t('signInHint') : t('createHint')}</p>
      </div>

      <form
        className="mt-8 space-y-5 rounded-card bg-card p-4 shadow-soft"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        {mode === 'register' ? (
          <TextField
            label={t('farmName')}
            value={farmName}
            error={farmError}
            autoComplete="organization"
            onChange={(event) => {
              setFarmName(event.target.value);
              if (farmError) setFarmError('');
            }}
          />
        ) : null}
        <TextField
          label={t('username')}
          value={username}
          error={userError}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => {
            setUsername(event.target.value);
            if (userError) setUserError('');
          }}
        />
        <TextField
          label={t('password')}
          type="password"
          value={password}
          error={passError}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          onChange={(event) => {
            setPassword(event.target.value);
            if (passError) setPassError('');
          }}
        />
        {error ? <p className="text-caption text-danger">{error}</p> : null}
        <Button type="submit" loading={busy}>
          {mode === 'login' ? t('signIn') : t('createAccount')}
        </Button>
      </form>

      <p className="mt-6 text-center text-body text-muted">
        {mode === 'login' ? (
          <>
            {t('noAccount')}{' '}
            <Link to="/register" className="font-semibold text-forest-800">
              {t('createAccount')}
            </Link>
          </>
        ) : (
          <>
            {t('haveAccount')}{' '}
            <Link to="/login" className="font-semibold text-forest-800">
              {t('signIn')}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  FileText,
  Folders,
  HelpCircle,
  IndianRupee,
  Info,
  LogOut,
  Shield,
  Users,
  Car,
  Landmark,
  Waves,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { Toggle } from '@/components/ui/Toggle';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthProvider';
import { useSettings } from '@/context/SettingsProvider';
import { useUi } from '@/context/UiProvider';
import { LegalSheet, PartiesSheet, ProfileSheet, VehiclesSheet } from '@/features/settings/SettingsSheets';
import { SettingsGroup, SettingsRow } from '@/features/settings/SettingsRows';
import { useT } from '@/hooks/useT';
import { translate } from '@/i18n';
import { formatPhoneDisplay, initials } from '@/lib/format';
import type { Language } from '@/types';

export function SettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { logout: signOut } = useAuth();
  const { profile, setProfile, notifications, setNotifications } = useSettings();
  const { t } = useT();
  const setLanguage = (language: Language) => {
    setProfile({ language });
    showToast(language === 'te' ? translate('te', 'langChanged') : translate('en', 'langChangedEn'), 'success');
  };
  const [editOpen, setEditOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null);
  const [logout, setLogout] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader variant="b" title={t('settings')} />
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-page pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
        <section className="flex items-center gap-3 rounded-card bg-card p-4 shadow-soft">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 text-h2 text-white">
            {initials(profile.ownerName).slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-title text-ink">{profile.name}</p>
            <p className="text-caption text-muted">{profile.ownerName}</p>
            <p className="text-caption text-muted">{profile.phone ? formatPhoneDisplay(profile.phone) : '—'}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
            {t('edit')}
          </Button>
        </section>

        <SettingsGroup title={t('farm')}>
          <SettingsRow icon={Landmark} label={t('farmProfile')} onClick={() => setEditOpen(true)} />
          <SettingsRow icon={Waves} label={t('pondsTitle')} onClick={() => navigate('/ponds')} />
          <div className="border-b border-line px-4 py-3">
            <p className="mb-2 text-title text-ink">{t('areaUnit')}</p>
            <SegmentedTabs
              value={profile.areaUnit}
              onChange={(areaUnit) => setProfile({ areaUnit })}
              tabs={[
                { value: 'acres', label: t('acres') },
                { value: 'cents', label: t('cents') },
              ]}
            />
          </div>
          <div className="border-b border-line px-4 py-3">
            <p className="mb-2 text-title text-ink">{t('weightUnit')}</p>
            <SegmentedTabs
              value={profile.weightUnit}
              onChange={(weightUnit) => setProfile({ weightUnit })}
              tabs={[
                { value: 'kg', label: t('kg') },
                { value: 'quintal', label: t('quintal') },
              ]}
            />
          </div>
          <div className="px-4 py-3">
            <p className="mb-2 text-title text-ink">{t('language')}</p>
            <div className="flex gap-2">
              <Chip selected={profile.language === 'en'} onClick={() => setLanguage('en')}>
                English
              </Chip>
              <Chip selected={profile.language === 'te'} onClick={() => setLanguage('te')}>
                తెలుగు
              </Chip>
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title={t('data')}>
          <SettingsRow icon={Folders} label={t('categories')} onClick={() => navigate('/settings/categories')} />
          <SettingsRow icon={Users} label={t('people')} onClick={() => setPeopleOpen(true)} />
          <SettingsRow icon={Car} label={t('vehicles')} onClick={() => setVehiclesOpen(true)} last />
        </SettingsGroup>

        <SettingsGroup title={t('team')}>
          <SettingsRow icon={Shield} label={t('teamAccess')} onClick={() => navigate('/settings/team')} last />
        </SettingsGroup>

        <SettingsGroup title={t('notificationsGroup')}>
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-title text-ink">{t('dailyReminder')}</p>
              <Toggle
                label={t('dailyReminder')}
                checked={notifications.daily}
                onChange={(daily) => setNotifications({ daily })}
              />
            </div>
            {notifications.daily ? (
              <label className="mt-3 block">
                <span className="mb-1 block text-caption text-muted">{t('time')}</span>
                <input
                  type="time"
                  value={notifications.dailyTime}
                  onChange={(event) => setNotifications({ dailyTime: event.target.value })}
                  className="h-12 rounded-input bg-surface px-3 text-body text-ink"
                />
              </label>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="text-title text-ink">{t('duesReminders')}</p>
            <Toggle label={t('duesReminders')} checked={notifications.dues} onChange={(dues) => setNotifications({ dues })} />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-title text-ink">{t('leaseReminders')}</p>
            <Toggle
              label={t('leaseReminders')}
              checked={notifications.lease}
              onChange={(lease) => setNotifications({ lease })}
            />
          </div>
        </SettingsGroup>

        <SettingsGroup title={t('backup')}>
          <SettingsRow icon={Cloud} label={t('exportCsv')} onClick={() => showToast(t('csvSoon'))} />
          <SettingsRow icon={Cloud} label={t('backupNow')} onClick={() => showToast(t('backupSoon'))} last />
        </SettingsGroup>

        <SettingsGroup title={t('about')}>
          <SettingsRow icon={IndianRupee} label={t('currency')} value="₹" disabled />
          <SettingsRow
            icon={HelpCircle}
            label={t('help')}
            onClick={() =>
              window.open(
                `https://wa.me/91${(profile.phone ?? '').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(t('helpText'))}`,
                '_blank',
              )
            }
          />
          <SettingsRow icon={FileText} label={t('privacy')} onClick={() => setLegal('privacy')} />
          <SettingsRow icon={FileText} label={t('terms')} onClick={() => setLegal('terms')} />
          <SettingsRow icon={Info} label={t('appVersion')} value="v0.1.0 (MVP)" last />
        </SettingsGroup>

        <Button variant="destructive" onClick={() => setLogout(true)}>
          <span className="mr-2 inline-flex">
            <LogOut size={18} />
          </span>
          {t('logOut')}
        </Button>
      </div>

      <ProfileSheet
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => {
          setProfile(patch);
          showToast(t('profileSaved'), 'success');
        }}
      />
      <PartiesSheet open={peopleOpen} onClose={() => setPeopleOpen(false)} />
      <VehiclesSheet open={vehiclesOpen} onClose={() => setVehiclesOpen(false)} />
      <LegalSheet
        open={legal === 'privacy'}
        title={t('privacy')}
        body={t('privacyBody')}
        onClose={() => setLegal(null)}
      />
      <LegalSheet
        open={legal === 'terms'}
        title={t('terms')}
        body={t('termsBody')}
        onClose={() => setLegal(null)}
      />
      <ConfirmSheet
        open={logout}
        title={t('logOutQ')}
        message={t('logOutMsg')}
        confirmLabel={t('logOut')}
        onClose={() => setLogout(false)}
        onConfirm={() => {
          setLogout(false);
          signOut();
          navigate('/login');
        }}
      />
    </div>
  );
}

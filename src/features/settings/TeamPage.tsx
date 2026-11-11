import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { IconButton } from '@/components/ui/IconButton';
import { InsightBanner } from '@/components/ui/InsightBanner';
import { TextField } from '@/components/ui/TextField';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSettings } from '@/context/SettingsProvider';
import { useUi } from '@/context/UiProvider';
import { roleCopy } from '@/i18n';
import { useT } from '@/hooks/useT';
import { cn } from '@/lib/cn';
import { formatPhoneDisplay, initials, isValidIndianMobile } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import type { TeamMember, TeamRole } from '@/types';

const ROLES: TeamRole[] = ['owner', 'manager', 'entry'];

export function TeamPage() {
  const { showToast } = useUi();
  const { team, setTeam } = useSettings();
  const { t, lang } = useT();
  const [active, setActive] = useState<TeamMember | null>(null);
  const [invite, setInvite] = useState(false);
  const [remove, setRemove] = useState<TeamMember | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<TeamRole>('entry');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title={t('teamAccess')}
        right={
          <IconButton label={t('inviteMember')} onClick={() => setInvite(true)}>
            <UserPlus size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
        }
      />
      <div className="flex-1 space-y-4 overflow-y-auto px-page pb-8 pt-4">
        <InsightBanner title={t('entryOnlyBanner')} />
        <ul className="overflow-hidden rounded-card bg-card shadow-soft">
          {team.map((member, index) => (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => setActive(member)}
                className={`pressable flex min-h-touch w-full items-center gap-3 px-4 py-3 text-left ${index < team.length - 1 ? 'border-b border-line' : ''}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-200 text-caption font-bold text-forest-800">
                  {initials(member.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-title text-ink">{member.name}</span>
                  <span className="text-caption text-muted">{formatPhoneDisplay(member.phone)}</span>
                </span>
                <span className="rounded-pill bg-tile px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {roleCopy(lang, member.role).label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <BottomSheet open={Boolean(active)} onClose={() => setActive(null)} title={active?.name ?? t('member')}>
        {active ? (
          <div className="space-y-3 pb-2">
            {active.role === 'owner' ? (
              <p className="text-body text-muted">{t('ownerLocked')}</p>
            ) : (
              <RoleRadios
                value={active.role}
                onChange={(next) => {
                  setTeam((current) => current.map((item) => (item.id === active.id ? { ...item, role: next } : item)));
                  setActive({ ...active, role: next });
                }}
              />
            )}
            {active.role === 'owner' ? null : (
              <button
                type="button"
                onClick={() => {
                  setRemove(active);
                  setActive(null);
                }}
                className="pressable flex min-h-touch w-full items-center justify-center text-body font-semibold text-danger"
              >
                {t('removeMember')}
              </button>
            )}
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        open={invite}
        onClose={() => setInvite(false)}
        title={t('inviteMember')}
      >
        <div className="space-y-3 pb-2">
          <TextField label={t('name')} value={name} error={errors.name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label={t('phone')}
            inputMode="tel"
            value={phone}
            error={errors.phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <RoleRadios value={role} onChange={setRole} hideOwner />
          <Button
            onClick={() => {
              const next = {
                name: name.trim() ? undefined : t('enterName'),
                phone: isValidIndianMobile(phone) ? undefined : t('enterMobile'),
              };
              setErrors(next);
              if (next.name || next.phone) return;
              setTeam((current) => [
                ...current,
                { id: `mem-${Date.now()}`, name: name.trim(), phone: phone.replace(/\D/g, '').slice(-10), role },
              ]);
              setInvite(false);
              setName('');
              setPhone('');
              setRole('entry');
              showToast(t('inviteSent'), 'success');
            }}
          >
            {t('sendInvite')}
          </Button>
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={Boolean(remove)}
        title={t('removeMemberQ')}
        message={t('removeMemberMsg', { name: remove?.name ?? t('member') })}
        confirmLabel={t('removeMember')}
        onClose={() => setRemove(null)}
        onConfirm={() => {
          if (remove) setTeam((current) => current.filter((item) => item.id !== remove.id));
          setRemove(null);
          showToast(t('memberRemoved'));
        }}
      />
    </div>
  );
}

function RoleRadios({
  value,
  onChange,
  hideOwner,
}: {
  value: TeamRole;
  onChange: (role: TeamRole) => void;
  hideOwner?: boolean;
}) {
  const { t, lang } = useT();
  return (
    <div className="space-y-1" role="radiogroup" aria-label={t('role')}>
      {ROLES.filter((item) => !(hideOwner && item === 'owner')).map((item) => {
        const selected = value === item;
        const copy = roleCopy(lang, item);
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item)}
            className={cn(
              'pressable w-full rounded-input px-4 py-3 text-left',
              selected ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
            )}
          >
            <span className="block text-title">{copy.label}</span>
            <span className={cn('mt-0.5 block text-caption', selected ? 'text-white/70' : 'text-muted')}>
              {copy.detail}
            </span>
          </button>
        );
      })}
    </div>
  );
}

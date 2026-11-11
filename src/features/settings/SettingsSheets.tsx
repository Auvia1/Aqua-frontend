import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { TextField } from '@/components/ui/TextField';
import { useLedger } from '@/context/LedgerProvider';
import { useSettings } from '@/context/SettingsProvider';
import { useUi } from '@/context/UiProvider';
import { SETTINGS_ICON } from '@/features/settings/settingsIcons';
import { SETTINGS_ICONS, SETTINGS_TINTS } from '@/data/settings';
import { ICON } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { useT } from '@/hooks/useT';
import { formatPhoneDisplay, initials, isValidIndianMobile } from '@/lib/format';
import type { Farm, PartyKind, SettingsCategory, SettingsIconId } from '@/types';

export function ProfileSheet({
  open,
  profile,
  onClose,
  onSave,
}: {
  open: boolean;
  profile: Farm;
  onClose: () => void;
  onSave: (patch: Partial<Farm>) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [owner, setOwner] = useState(profile.ownerName);
  const [place, setPlace] = useState(profile.village);
  const { t } = useT();
  const [errors, setErrors] = useState<{ name?: string; owner?: string }>({});

  useEffect(() => {
    if (!open) return;
    setName(profile.name);
    setOwner(profile.ownerName);
    setPlace(profile.village);
    setErrors({});
  }, [open, profile]);

  return (
    <BottomSheet open={open} onClose={onClose} title={t('farmProfile')}>
      <div className="space-y-3 pb-2">
        <TextField label={t('farmName')} value={name} error={errors.name} onChange={(e) => setName(e.target.value)} />
        <TextField label={t('yourName')} value={owner} error={errors.owner} onChange={(e) => setOwner(e.target.value)} />
        <TextField label={t('location')} value={place} onChange={(e) => setPlace(e.target.value)} />
        <Button
          onClick={() => {
            const next = {
              name: name.trim() ? undefined : t('enterFarmName'),
              owner: owner.trim() ? undefined : t('enterYourName'),
            };
            setErrors(next);
            if (next.name || next.owner) return;
            onSave({ name: name.trim(), ownerName: owner.trim(), village: place.trim() });
            onClose();
          }}
        >
          {t('save')}
        </Button>
      </div>
    </BottomSheet>
  );
}

export function PartiesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { parties, addParty } = useLedger();
  const { showToast } = useUi();
  const { t } = useT();
  const [tab, setTab] = useState<PartyKind>('vendor');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const rows = parties.filter((party) => {
    if (party.kind !== tab) return false;
    const q = search.trim().toLowerCase();
    return !q || party.name.toLowerCase().includes(q);
  });

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={t('peopleTitle')}>
        <div className="space-y-3 pb-2">
          <SegmentedTabs
            tabs={[
              { value: 'vendor', label: t('vendors') },
              { value: 'worker', label: t('workers') },
              { value: 'buyer', label: t('buyers') },
            ]}
            value={tab}
            onChange={setTab}
          />
          <TextField label={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchParty')} />
          <ul className="space-y-1">
            {rows.map((party) => (
              <li key={party.id} className="flex min-h-touch items-center gap-3 rounded-input bg-surface px-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-200 text-caption font-bold text-forest-800">
                  {initials(party.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-title text-ink">{party.name}</span>
                  <span className="text-caption text-muted">{party.phone ? formatPhoneDisplay(party.phone) : '—'}</span>
                </span>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => {
              setName('');
              setPhone('');
              setError('');
              setAddOpen(true);
            }}
          >
            {t('add')}
          </Button>
        </div>
      </BottomSheet>
      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title={t('add')} layer="nested">
        <div className="space-y-3 pb-2">
          <TextField label={t('name')} value={name} onChange={(e) => setName(e.target.value)} error={error && !name.trim() ? error : undefined} />
          <TextField
            label={t('phone')}
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error && name.trim() ? error : undefined}
          />
          <Button
            onClick={() => {
              if (!name.trim()) {
                setError(t('enterName'));
                return;
              }
              if (phone && !isValidIndianMobile(phone)) {
                setError(t('enterMobile'));
                return;
              }
              addParty({ name: name.trim(), phone, kind: tab });
              setAddOpen(false);
              showToast(t('added'), 'success');
            }}
          >
            {t('save')}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}

export function VehiclesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicles, setVehicles } = useSettings();
  const { showToast } = useUi();
  const { t } = useT();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={t('vehicles')}>
        <ul className="space-y-1 pb-3">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="rounded-input bg-surface px-4 py-3">
              <p className="text-title text-ink">{vehicle.name}</p>
              <p className="text-caption text-muted">{vehicle.number}</p>
            </li>
          ))}
        </ul>
        <Button
          onClick={() => {
            setName('');
            setNumber('');
            setError('');
            setAddOpen(true);
          }}
        >
          {t('add')}
        </Button>
      </BottomSheet>
      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title={t('addVehicle')} layer="nested">
        <div className="space-y-3 pb-2">
          <TextField label={t('vehicleName')} value={name} error={error} onChange={(e) => setName(e.target.value)} />
          <TextField label={t('vehicleNumber')} value={number} onChange={(e) => setNumber(e.target.value)} />
          <Button
            onClick={() => {
              if (!name.trim()) {
                setError(t('enterName'));
                return;
              }
              setVehicles((current) => [
                ...current,
                { id: `veh-${Date.now()}`, name: name.trim(), number: number.trim() },
              ]);
              setAddOpen(false);
              showToast(t('vehicleAdded'), 'success');
            }}
          >
            {t('save')}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}

export function LegalSheet({
  open,
  title,
  body,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <p className="pb-2 text-body text-muted">{body}</p>
    </BottomSheet>
  );
}

export function CategoryFormSheet({
  open,
  title,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  initial?: Pick<SettingsCategory, 'name' | 'icon' | 'tint'>;
  onClose: () => void;
  onSave: (input: { name: string; icon: SettingsIconId; tint: string }) => void;
}) {
  const { t } = useT();
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState<SettingsIconId>(initial?.icon ?? 'wheat');
  const [tint, setTint] = useState(initial?.tint ?? SETTINGS_TINTS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setIcon(initial?.icon ?? 'wheat');
    setTint(initial?.tint ?? SETTINGS_TINTS[0]);
    setError('');
  }, [open, initial]);

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4 pb-2">
        <TextField label={t('name')} value={name} error={error} onChange={(e) => setName(e.target.value)} />
        <div>
          <p className="mb-2 text-body font-medium text-ink">{t('icon')}</p>
          <div className="grid grid-cols-6 gap-2">
            {SETTINGS_ICONS.map((item) => {
              const Glyph = SETTINGS_ICON[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  onClick={() => setIcon(item.id)}
                  className={cn(
                    'pressable flex h-12 items-center justify-center rounded-input',
                    icon === item.id ? 'bg-forest-800 text-white' : 'bg-tile text-forest-800',
                  )}
                >
                  <Glyph size={ICON.size} strokeWidth={ICON.stroke} />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-body font-medium text-ink">{t('colour')}</p>
          <div className="flex gap-2">
            {SETTINGS_TINTS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={t('colour')}
                onClick={() => setTint(swatch)}
                className={cn(
                  'pressable h-12 w-12 rounded-full ring-2 ring-offset-2 ring-offset-card',
                  swatch,
                  tint === swatch ? 'ring-forest-800' : 'ring-transparent',
                )}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={() => {
            if (!name.trim()) {
              setError(t('enterName'));
              return;
            }
            onSave({ name: name.trim(), icon, tint });
            onClose();
          }}
        >
          {t('save')}
        </Button>
      </div>
    </BottomSheet>
  );
}

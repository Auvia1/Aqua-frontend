import { MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { displayPondName } from '@/i18n';
import { useT } from '@/hooks/useT';
import { formatArea, formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import { isInactivePond, speciesLabel, type PondListItem } from '@/services/ponds';
import type { AreaUnit, PondStatus } from '@/types';

const STATUS_PILL: Record<PondStatus, string> = {
  active: 'bg-leaf-200 text-forest-800',
  idle: 'bg-tile text-muted',
  harvested: 'bg-lime-100 text-forest-800',
};

export function PondListCard({
  item,
  areaUnit,
  onOpen,
  onMenu,
  onExpense,
  onStartCycle,
}: {
  item: PondListItem;
  areaUnit: AreaUnit;
  onOpen: () => void;
  onMenu: () => void;
  onExpense: () => void;
  onStartCycle: () => void;
}) {
  const { t, lang } = useT();
  const statusLabel: Record<PondStatus, string> = {
    active: t('active'),
    idle: t('idle'),
    harvested: t('harvested'),
  };
  const { pond, spent, revenue, profit } = item;
  const pondTitle = displayPondName(lang, pond.id, pond.name);
  const inactive = isInactivePond(pond);

  return (
    <article className="rounded-card bg-card p-4 shadow-soft">
      <div className="flex items-start gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-title text-ink">{pondTitle}</h2>
            <span className="rounded-pill bg-tile px-2 py-0.5 text-[11px] font-medium text-forest-800">
              {speciesLabel(pond)}
            </span>
          </div>
        </button>
        <span
          className={cn(
            'shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-semibold',
            STATUS_PILL[pond.status],
          )}
        >
          {statusLabel[pond.status]}
        </span>
        <IconButton label={t('pondActions', { name: pondTitle })} tone="ghost" onClick={onMenu}>
          <MoreVertical size={ICON.size} strokeWidth={ICON.stroke} />
        </IconButton>
      </div>

      <button type="button" className="mt-3 flex w-full items-center justify-between gap-3 text-left" onClick={onOpen}>
        <p className="text-caption text-muted">{formatArea(pond.areaAcres, areaUnit)}</p>
        {inactive ? (
          <p className="text-caption text-muted">{t('noActiveCycle')}</p>
        ) : (
          <p className="text-caption font-medium text-ink">{t('dayN', { n: pond.cycleDay ?? 0 })}</p>
        )}
      </button>

      <button type="button" className="mt-4 grid w-full grid-cols-3 gap-2 text-left" onClick={onOpen}>
        <Stat label={t('spent')} value={formatINRCompact(spent)} />
        <Stat label={t('revenue')} value={formatINRCompact(revenue)} />
        <Stat
          label={t('balance')}
          value={formatINRCompact(profit)}
          tone={profit > 0 ? 'good' : profit < 0 ? 'bad' : 'muted'}
        />
      </button>
      {inactive ? (
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={onStartCycle}>
            {t('startCycle')}
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button size="sm" variant="secondary" onClick={onExpense}>
            {t('plusExpense')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onOpen}>
            {t('viewDetails')}
          </Button>
        </div>
      )}
    </article>
  );
}

function Stat({
  label,
  value,
  tone = 'ink',
}: {
  label: string;
  value: string;
  tone?: 'ink' | 'good' | 'bad' | 'muted';
}) {
  const color =
    tone === 'good' ? 'text-leaf-500' : tone === 'bad' ? 'text-danger' : tone === 'muted' ? 'text-muted' : 'text-ink';
  return (
    <div>
      <p className="text-caption text-muted">{label}</p>
      <p className={cn('mt-0.5 text-caption font-semibold tabular-nums', color)}>{value}</p>
    </div>
  );
}

export function AddPondCard({ onClick }: { onClick: () => void }) {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable flex min-h-[88px] w-full flex-col items-center justify-center rounded-card border border-dashed border-line bg-transparent text-forest-800"
    >
      <Plus size={ICON.size} strokeWidth={ICON.stroke} />
      <span className="mt-2 text-caption font-semibold">{t('addPond')}</span>
    </button>
  );
}

export function PondCardSkeleton() {
  return (
    <div className="space-y-3 rounded-card bg-card p-4">
      <div className="h-5 w-28 animate-pulse rounded bg-tile" />
      <div className="h-3 w-40 animate-pulse rounded bg-tile" />
      <div className="h-1 w-full animate-pulse rounded-pill bg-tile" />
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="h-8 animate-pulse rounded bg-tile" />
        <div className="h-8 animate-pulse rounded bg-tile" />
        <div className="h-8 animate-pulse rounded bg-tile" />
      </div>
    </div>
  );
}

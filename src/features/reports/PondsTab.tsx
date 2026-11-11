import { SelectField } from '@/components/ui/SelectField';
import { ponds } from '@/data/farm';
import { displayPondName } from '@/i18n';
import { useT } from '@/hooks/useT';
import { cn } from '@/lib/cn';
import { formatINRCompact } from '@/lib/format';
import type { CycleCompare } from '@/services/reports';

export function PondsTab({
  compareId,
  onCompare,
  cycles,
}: {
  compareId: string;
  onCompare: (id: string) => void;
  cycles: CycleCompare[];
}) {
  const { t, lang } = useT();
  return (
    <section className="rounded-card bg-card p-4 shadow-soft">
      <h2 className="mb-3 text-title text-ink">{t('compareCycles')}</h2>
      <SelectField
        label={t('pond')}
        value={compareId}
        onChange={onCompare}
        options={ponds.map((pond) => ({ value: pond.id, label: displayPondName(lang, pond.id, pond.name) }))}
      />
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {cycles.map((cycle) => (
          <article key={cycle.id} className="w-[148px] shrink-0 rounded-tile bg-surface p-3">
            <p className="text-caption font-semibold text-forest-800">{t('cycleN', { n: cycle.number })}</p>
            <p className="mt-0.5 text-caption text-muted">{cycle.range}</p>
            <p className="mt-3 text-caption text-muted">{t('netProfitRow')}</p>
            <p className={cn('text-title tabular-nums', cycle.profit >= 0 ? 'text-leaf-500' : 'text-danger')}>
              {formatINRCompact(cycle.profit)}
            </p>
            <p className="mt-2 text-caption text-muted">
              {t('spend')} {formatINRCompact(cycle.spend)}
            </p>
            <p className="text-caption text-muted">
              {t('revenue')} {formatINRCompact(cycle.revenue)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

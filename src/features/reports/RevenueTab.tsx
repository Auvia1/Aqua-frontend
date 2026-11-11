import { Button } from '@/components/ui/Button';
import { SpendBarChart } from '@/components/ui/BarChart';
import { useT } from '@/hooks/useT';
import { formatAxis, formatINRCompact, formatLongDate } from '@/lib/format';
import type { HarvestSale } from '@/types';

export function RevenueTab({
  total,
  qty,
  avgRate,
  pending,
  bars,
  sales,
  onDues,
}: {
  total: number;
  qty: number;
  avgRate: number;
  pending: number;
  bars: { label: string; value: number }[];
  sales: HarvestSale[];
  onDues: () => void;
}) {
  const { t } = useT();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={t('totalRevenue')} value={formatINRCompact(total)} />
        <StatCard label={t('qtySold')} value={`${new Intl.NumberFormat('en-IN').format(qty)} kg`} />
        <StatCard label={t('avgRate')} value={`${formatINRCompact(avgRate)}/kg`} />
      </div>

      <section className="rounded-card bg-card p-4 shadow-soft">
        <h2 className="mb-3 text-title text-ink">{t('revenueByHarvest')}</h2>
        {bars.length === 0 ? (
          <p className="py-6 text-center text-body text-muted">{t('noHarvests')}</p>
        ) : (
          <SpendBarChart data={bars} formatTick={formatAxis} />
        )}
      </section>

      {pending > 0 ? (
        <section className="rounded-card bg-warn/15 p-4">
          <p className="text-caption text-muted">{t('pendingBuyers')}</p>
          <p className="mt-1 text-h2 tabular-nums text-ink">{formatINRCompact(pending)}</p>
          <Button size="sm" className="mt-3" onClick={onDues}>
            {t('viewDues')}
          </Button>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-title text-ink">{t('sales')}</h2>
        {sales.length === 0 ? (
          <p className="rounded-card bg-card px-4 py-6 text-center text-body text-muted shadow-soft">{t('noHarvests')}</p>
        ) : (
          <ul className="overflow-hidden rounded-card bg-card shadow-soft">
            {sales.map((sale, index) => (
              <li
                key={sale.id}
                className={`flex items-start justify-between gap-3 px-4 py-3 ${index < sales.length - 1 ? 'border-b border-line' : ''}`}
              >
                <div className="min-w-0">
                  <p className="text-title text-ink">{sale.buyer || t('sales')}</p>
                  <p className="text-caption text-muted">
                    {sale.qtyKg} kg · {formatINRCompact(sale.ratePerKg)}/kg
                  </p>
                  <p className="text-caption text-muted">{formatLongDate(sale.date)}</p>
                </div>
                <p className="text-title tabular-nums text-leaf-500">+ {formatINRCompact(sale.netAmount)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-card p-3 shadow-soft">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 text-caption font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

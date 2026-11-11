import { formatINRCompact } from '@/lib/format';
import type { PondReportCard } from '@/services/reports';

export function ProfitHBar({ rows }: { rows: PondReportCard[] }) {
  const max = Math.max(...rows.map((row) => Math.abs(row.profit)), 1);

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const width = `${Math.round((Math.abs(row.profit) / max) * 100)}%`;
        const positive = row.profit >= 0;
        return (
          <li key={row.pondId}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-caption font-semibold text-ink">{row.name}</span>
              <span className={`text-caption font-semibold tabular-nums ${positive ? 'text-leaf-500' : 'text-danger'}`}>
                {positive ? '+' : '−'}
                {formatINRCompact(Math.abs(row.profit))}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-pill bg-tile">
              <div
                className={`h-full rounded-pill ${positive ? 'bg-forest-800' : 'bg-danger/70'}`}
                style={{ width }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

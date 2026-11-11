import { BottomSheet } from '@/components/ui/BottomSheet';
import { formatDate, formatINRCompact } from '@/lib/format';
import type { FeedLog } from '@/types';

export function FeedLogSheet({ log, onClose }: { log: FeedLog | null; onClose: () => void }) {
  return (
    <BottomSheet open={Boolean(log)} onClose={onClose} title="Feed log">
      {log ? (
        <dl className="space-y-3 pb-2 text-body">
          <Row label="Date" value={formatDate(log.date)} />
          <Row label="Meals" value={String(log.meals)} />
          <Row label="Total" value={`${log.kg} kg`} />
          <Row label="Cost" value={formatINRCompact(log.cost)} />
        </dl>
      ) : null}
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

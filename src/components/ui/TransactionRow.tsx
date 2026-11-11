import type { ReactNode } from 'react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { MoneyAmount } from '@/components/ui/MoneyAmount';
import { t } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import type { LedgerEntry } from '@/types';

interface TransactionRowProps {
  entry: LedgerEntry;
  onClick?: () => void;
  showDivider?: boolean;
  showDate?: boolean;
  tag?: string;
}

export function TransactionRow({
  entry,
  onClick,
  showDivider = true,
  showDate = true,
  tag,
}: TransactionRowProps) {
  const isRevenue = entry.kind === 'revenue';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        'focus-visible:outline-none focus-visible:bg-surface',
        showDivider && 'border-b border-line',
      )}
    >
      <CategoryIcon category={entry.category} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-title text-ink">{entry.title}</span>
          {isRevenue && entry.payment !== 'credit' ? null : (
            <span
              className={cn(
                'shrink-0 rounded-pill px-1.5 py-0.5 text-[10px] font-semibold',
                entry.payment === 'credit' ? 'bg-danger/10 text-danger' : 'bg-leaf-200 text-forest-800',
              )}
            >
              {entry.payment === 'credit' ? t('credit') : t('paid')}
            </span>
          )}
        </span>
        <span className="line-clamp-2 whitespace-normal text-caption text-muted">{entry.subtitle}</span>
        {tag ? (
          <span className="mt-1 inline-flex rounded-pill bg-tile px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            {tag}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-right">
        <MoneyAmount
          amount={entry.amount}
          signed
          withPaise={false}
          tone={isRevenue ? 'revenue' : 'expense'}
          size="sm"
        />
        {showDate ? (
          <span className="mt-0.5 block text-caption text-muted">{formatDate(entry.date)}</span>
        ) : null}
      </span>
    </button>
  );
}

export function TransactionList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('overflow-hidden rounded-card bg-card', className)}>{children}</div>;
}

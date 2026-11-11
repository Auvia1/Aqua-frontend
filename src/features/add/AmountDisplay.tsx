import { MoneyAmount } from '@/components/ui/MoneyAmount';

export function AmountDisplay({
  digits,
  locked,
  caption,
  onEdit,
  onActivate,
}: {
  digits: string;
  locked: boolean;
  caption?: string;
  onEdit: () => void;
  onActivate: () => void;
}) {
  const amount = Number(digits) || 0;

  return (
    <div className="text-center">
      <button type="button" onClick={onActivate} className="pressable" aria-label="Amount">
        <MoneyAmount amount={amount} size="lg" withPaise={false} />
      </button>
      {caption ? (
        <p className="mt-1 text-caption text-muted">
          {caption}
          {locked ? (
            <button type="button" onClick={onEdit} className="ml-2 font-semibold text-forest-800">
              Edit
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

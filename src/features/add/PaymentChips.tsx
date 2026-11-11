import { Chip } from '@/components/ui/Chip';
import { PAYMENT_MODES } from '@/data/addCatalog';
import type { PaymentMode } from '@/types';

export function PaymentChips({
  value,
  onChange,
}: {
  value: PaymentMode;
  onChange: (value: PaymentMode) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-body font-medium text-ink">Payment mode</p>
      <div className="flex flex-wrap gap-2">
        {PAYMENT_MODES.map((mode) => (
          <Chip key={mode.value} selected={value === mode.value} onClick={() => onChange(mode.value)}>
            {mode.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

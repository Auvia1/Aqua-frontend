import { PaidCreditToggle } from '@/components/ui/PaidCreditToggle';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { FEED_SIZES, feedBrandLabel } from '@/data/addCatalog';
import { formatGrouped } from '@/lib/format';
import type { PaymentStatus } from '@/types';

export function FeedPlanCard({
  saved,
  editing,
  brand,
  size,
  bagWeight,
  price,
  vendorName,
  payment,
  pricePerBag,
  bagKg,
  onEdit,
  onCancel,
  onBrand,
  onSize,
  onBagWeight,
  onPrice,
  onVendorName,
  onPayment,
}: {
  saved: boolean;
  editing: boolean;
  brand: string;
  size: string;
  bagWeight: string;
  price: string;
  vendorName: string;
  payment: PaymentStatus;
  pricePerBag: number;
  bagKg: number;
  onEdit: () => void;
  onCancel: () => void;
  onBrand: (value: string) => void;
  onSize: (value: string) => void;
  onBagWeight: (value: string) => void;
  onPrice: (value: string) => void;
  onVendorName: (value: string) => void;
  onPayment: (value: PaymentStatus) => void;
}) {
  const brandLabel = feedBrandLabel(brand);
  const planTitle = [brandLabel, size].filter(Boolean).join(' ') || 'Feed';

  if (saved && !editing) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="pressable w-full rounded-card bg-card px-4 py-3 text-left shadow-soft"
      >
        <p className="text-caption text-muted">This cycle's feed plan</p>
        <p className="mt-1 text-body font-semibold text-ink">
          {planTitle} · ₹{formatGrouped(pricePerBag)} / {bagKg} kg
        </p>
        <p className="mt-0.5 text-caption text-muted">
          {vendorName || 'No vendor'} · {payment === 'credit' ? 'Credit' : 'Paid'}
        </p>
        <p className="mt-2 text-caption font-semibold text-forest-800">Change</p>
      </button>
    );
  }

  return (
    <section className="space-y-3 rounded-card bg-card p-4 shadow-soft">
      <h2 className="text-title text-ink">{saved ? 'Change feed plan' : 'Feed plan for this cycle'}</h2>
      <p className="text-caption text-muted">Bag price is reused on each daily log. Vendor and brand are optional.</p>
      <TextField
        label="Vendor"
        placeholder="Optional"
        value={vendorName}
        onChange={(event) => onVendorName(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Bag weight"
          inputMode="decimal"
          suffix={<span className="text-muted">kg</span>}
          value={bagWeight}
          onChange={(event) => onBagWeight(event.target.value.replace(/[^\d.]/g, ''))}
        />
        <TextField
          label="Price per bag"
          inputMode="decimal"
          prefix={<span className="text-muted">₹</span>}
          value={price}
          onChange={(event) => onPrice(event.target.value.replace(/[^\d.]/g, ''))}
        />
      </div>
      <TextField
        label="Feed brand"
        placeholder="Optional"
        value={brand}
        onChange={(event) => onBrand(event.target.value)}
      />
      <SelectField label="Size / grade" value={size} options={[...FEED_SIZES]} onChange={onSize} />
      <PaidCreditToggle value={payment} onChange={onPayment} />
      {saved ? (
        <button
          type="button"
          className="pressable flex min-h-touch w-full items-center justify-center text-body font-semibold text-forest-800"
          onClick={onCancel}
        >
          Cancel
        </button>
      ) : null}
    </section>
  );
}

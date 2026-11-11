import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { FEED_BRANDS, FEED_SIZES } from '@/data/addCatalog';
import { FormSection } from '@/features/ponds/FormSection';
import { cn } from '@/lib/cn';
import type { SeedUnit } from '@/types';

const ADD_HATCHERY = '__add__';

export { ADD_HATCHERY };

export function StartCycleSeedFields({
  qty,
  unit,
  hatchery,
  sources,
  batch,
  errors,
  onQty,
  onUnit,
  onHatchery,
  onAddHatchery,
  onBatch,
}: {
  qty: string;
  unit: SeedUnit;
  hatchery: string;
  sources: { value: string; label: string }[];
  batch: string;
  errors: Record<string, string>;
  onQty: (value: string) => void;
  onUnit: (value: SeedUnit) => void;
  onHatchery: (value: string) => void;
  onAddHatchery: () => void;
  onBatch: (value: string) => void;
}) {
  return (
    <FormSection title="Seed">
      <div>
        <span className="mb-2 block text-body font-medium text-ink">Seed quantity</span>
        <div className="flex items-center gap-2">
          <input
            inputMode="decimal"
            placeholder="Optional"
            value={qty}
            aria-invalid={Boolean(errors.qty)}
            onChange={(event) => onQty(event.target.value.replace(/[^\d.]/g, ''))}
            className={cn(
              'h-14 min-w-0 flex-1 rounded-input bg-surface px-4 text-body text-ink outline-none',
              'placeholder:text-muted focus-visible:ring-2 focus-visible:ring-forest-800/30',
              errors.qty && 'ring-2 ring-danger/70',
            )}
          />
          <div className="w-[148px] shrink-0">
            <SegmentedTabs
              ariaLabel="Seed unit"
              value={unit}
              onChange={onUnit}
              tabs={[
                { value: 'pieces', label: 'Pieces' },
                { value: 'lakh', label: 'Lakh' },
              ]}
            />
          </div>
        </div>
        {errors.qty ? <p className="mt-1.5 text-caption text-danger">{errors.qty}</p> : null}
      </div>
      <SelectField
        label="Hatchery / source"
        placeholder="Select hatchery"
        value={hatchery}
        onChange={(value) => {
          if (value === ADD_HATCHERY) {
            onAddHatchery();
            return;
          }
          onHatchery(value);
        }}
        options={[...sources, { value: ADD_HATCHERY, label: '+ Add new' }]}
      />
      <TextField label="Batch number" placeholder="Optional" value={batch} onChange={(event) => onBatch(event.target.value)} />
    </FormSection>
  );
}

export const ADD_VENDOR = '__add__';

export function StartCycleFeedFields({
  brand,
  size,
  bagWeight,
  price,
  vendorId,
  vendors,
  errors,
  onBrand,
  onSize,
  onBagWeight,
  onPrice,
  onVendor,
  onAddVendor,
}: {
  brand: string;
  size: string;
  bagWeight: string;
  price: string;
  vendorId: string;
  vendors: { value: string; label: string }[];
  errors: Record<string, string>;
  onBrand: (value: string) => void;
  onSize: (value: string) => void;
  onBagWeight: (value: string) => void;
  onPrice: (value: string) => void;
  onVendor: (value: string) => void;
  onAddVendor: () => void;
}) {
  return (
    <FormSection title="Daily feed plan">
      <p className="-mt-1 text-caption text-muted">
        Set once. Daily feed only asks how many kg you used.
      </p>
      <SelectField
        label="Feed vendor*"
        placeholder="Select vendor"
        value={vendorId}
        error={errors.feedVendor}
        onChange={(value) => {
          if (value === ADD_VENDOR) {
            onAddVendor();
            return;
          }
          onVendor(value);
        }}
        options={[...vendors, { value: ADD_VENDOR, label: '+ Add new' }]}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Bag weight*"
          inputMode="decimal"
          suffix={<span className="text-muted">kg</span>}
          value={bagWeight}
          error={errors.feedBag}
          onChange={(event) => onBagWeight(event.target.value.replace(/[^\d.]/g, ''))}
        />
        <TextField
          label="Price per bag*"
          inputMode="decimal"
          prefix={<span className="text-forest-800">₹</span>}
          value={price}
          error={errors.feedPrice}
          onChange={(event) => onPrice(event.target.value.replace(/[^\d.]/g, ''))}
        />
      </div>
      <SelectField label="Feed brand" value={brand} options={[...FEED_BRANDS]} onChange={onBrand} />
      <SelectField label="Size / grade" value={size} options={[...FEED_SIZES]} onChange={onSize} />
    </FormSection>
  );
}

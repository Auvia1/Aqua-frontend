import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { TextField } from '@/components/ui/TextField';
import { toISODate } from '@/lib/format';

export function formatPerKg(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(rounded);
}

function decimalInput(value: string, places: number): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole ?? '';
  return `${whole}.${rest.join('').slice(0, places)}`;
}

function positive(value: string): number | null {
  const amount = Number(value);
  if (!value.trim() || Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

export function FeedPlanCard({
  perKg,
  onSavePrice,
  onAddOld,
}: {
  perKg: number;
  onSavePrice: (rate: number) => Promise<boolean>;
  onAddOld: (input: { kg: number; rate: number; date: string }) => Promise<boolean>;
}) {
  const [priceOpen, setPriceOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [kg, setKg] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkDate, setBulkDate] = useState(toISODate());
  const [kgError, setKgError] = useState('');
  const [bulkPriceError, setBulkPriceError] = useState('');
  const [saving, setSaving] = useState<'price' | 'bulk' | null>(null);

  const openPrice = () => {
    setPrice(perKg > 0 ? formatPerKg(perKg).replace(/,/g, '') : '');
    setPriceError('');
    setPriceOpen(true);
  };

  const openBulk = () => {
    setKg('');
    setBulkPrice(perKg > 0 ? formatPerKg(perKg).replace(/,/g, '') : '');
    setBulkDate(toISODate());
    setKgError('');
    setBulkPriceError('');
    setBulkOpen(true);
  };

  const savePrice = async () => {
    const rate = positive(price);
    if (rate == null) {
      setPriceError('Enter a price per kg');
      return;
    }
    setSaving('price');
    const ok = await onSavePrice(rate);
    setSaving(null);
    if (ok) setPriceOpen(false);
  };

  const saveBulk = async () => {
    const quantity = positive(kg);
    const rate = positive(bulkPrice);
    setKgError(quantity == null ? 'Enter quantity' : '');
    setBulkPriceError(rate == null ? 'Enter a price per kg' : '');
    if (quantity == null || rate == null) return;
    setSaving('bulk');
    const ok = await onAddOld({ kg: quantity, rate, date: bulkDate });
    setSaving(null);
    if (ok) setBulkOpen(false);
  };

  return (
    <>
      <section className="rounded-card bg-card px-4 py-3 shadow-soft">
        <p className="text-caption text-muted">Feed price</p>
        <p className="mt-1 text-body font-semibold text-ink">
          {perKg > 0 ? `₹${formatPerKg(perKg)} / kg` : 'Not set'}
        </p>
        <p className="mt-0.5 text-caption text-muted">
          {perKg > 0 ? 'New feed uses this rate. Saved feed keeps its own.' : 'Set a rate before logging today’s feed.'}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openPrice}
            className="pressable flex h-12 items-center justify-center rounded-pill bg-tile px-3 text-body font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30"
          >
            {perKg > 0 ? 'Change price' : 'Set price'}
          </button>
          <button
            type="button"
            onClick={openBulk}
            className="pressable flex h-12 items-center justify-center rounded-pill bg-tile px-3 text-body font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30"
          >
            Add old feed
          </button>
        </div>
      </section>

      <BottomSheet open={priceOpen} onClose={() => setPriceOpen(false)} title="Feed price">
        <div className="space-y-3 pb-2">
          <TextField
            label="Price per kg"
            inputMode="decimal"
            prefix={<span className="text-muted">₹</span>}
            suffix={<span className="text-muted">/ kg</span>}
            value={price}
            error={priceError}
            onChange={(event) => {
              setPrice(decimalInput(event.target.value, 2));
              if (priceError) setPriceError('');
            }}
          />
          <p className="text-caption text-muted">Only feed you add from now on uses this. Feed already saved stays as it was.</p>
          <Button loading={saving === 'price'} onClick={() => void savePrice()}>
            Save price
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={bulkOpen} onClose={() => setBulkOpen(false)} title="Add old feed">
        <div className="space-y-3 pb-2">
          <TextField
            label="Quantity"
            inputMode="decimal"
            suffix={<span className="text-muted">kg</span>}
            value={kg}
            error={kgError}
            onChange={(event) => {
              setKg(decimalInput(event.target.value, 1));
              if (kgError) setKgError('');
            }}
          />
          <TextField
            label="Price per kg"
            inputMode="decimal"
            prefix={<span className="text-muted">₹</span>}
            value={bulkPrice}
            error={bulkPriceError}
            onChange={(event) => {
              setBulkPrice(decimalInput(event.target.value, 2));
              if (bulkPriceError) setBulkPriceError('');
            }}
          />
          <DateField label="Date" value={bulkDate} onChange={setBulkDate} />
          <p className="text-caption text-muted">Saved at this price only. It does not change the rate for new feed.</p>
          <Button loading={saving === 'bulk'} onClick={() => void saveBulk()}>
            Add feed
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}

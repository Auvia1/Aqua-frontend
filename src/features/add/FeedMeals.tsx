import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Numpad } from '@/components/ui/Numpad';
import { Stepper } from '@/features/add/Stepper';
import { appendDecimal, backspaceAmount } from '@/services/add';
import { ICON } from '@/lib/tokens';

export interface MealRow {
  time: string;
  kg: number;
}

const EXTRA_TIMES = ['20:00', '08:00'];

export function nextMealTime(meals: MealRow[]): string {
  return EXTRA_TIMES[meals.length - 4] ?? '12:00';
}

export function FeedMeals({
  meals,
  onChange,
}: {
  meals: MealRow[];
  onChange: (meals: MealRow[]) => void;
}) {
  const [padIndex, setPadIndex] = useState<number | null>(null);
  const [digits, setDigits] = useState('0');

  const patch = (index: number, next: Partial<MealRow>) => {
    onChange(meals.map((meal, i) => (i === index ? { ...meal, ...next } : meal)));
  };

  const openPad = (index: number) => {
    const kg = meals[index]?.kg ?? 0;
    setDigits(kg > 0 ? String(kg) : '0');
    setPadIndex(index);
  };

  const commitPad = () => {
    if (padIndex == null) return;
    const kg = Math.round((Number(digits) || 0) * 100) / 100;
    patch(padIndex, { kg });
    setPadIndex(null);
  };

  return (
    <section className="rounded-card bg-card p-4 shadow-soft">
      <h2 className="mb-3 text-title text-ink">Meals</h2>
      <ul className="space-y-3">
        {meals.map((meal, index) => (
          <li key={`${meal.time}-${index}`} className="min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption font-semibold text-muted">Meal {index + 1}</span>
              <IconButton
                label="Remove meal"
                tone="ghost"
                className="h-10 w-10"
                disabled={meals.length <= 1}
                onClick={() => onChange(meals.filter((_, i) => i !== index))}
              >
                <Trash2 size={18} strokeWidth={ICON.stroke} />
              </IconButton>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <input
                type="time"
                aria-label={`Meal ${index + 1} time`}
                value={meal.time}
                onChange={(event) => patch(index, { time: event.target.value })}
                className="h-12 min-w-0 flex-1 rounded-input bg-surface px-2 text-body text-ink outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30"
              />
              <Stepper
                value={meal.kg}
                step={0.5}
                suffix="kg"
                valueLabel={`Enter kilograms for meal ${index + 1}`}
                onValueClick={() => openPad(index)}
                onChange={(kg) => patch(index, { kg })}
              />
            </div>
          </li>
        ))}
      </ul>
      {meals.length < 6 ? (
        <button
          type="button"
          onClick={() => onChange([...meals, { time: nextMealTime(meals), kg: 0 }])}
          className="pressable mt-2 flex min-h-touch w-full items-center justify-center text-body font-semibold text-forest-800"
        >
          + Add meal
        </button>
      ) : null}

      <BottomSheet
        open={padIndex != null}
        onClose={() => setPadIndex(null)}
        title={padIndex == null ? 'Kilograms' : `Meal ${padIndex + 1} · kg`}
      >
        <div className="space-y-3 pb-2">
          <p className="text-center text-display tabular-nums text-ink" aria-live="polite">
            {digits || '0'}
            <span className="ml-1 text-title font-medium text-muted">kg</span>
          </p>
          <Numpad
            decimal
            onKey={(key) => setDigits((current) => appendDecimal(current, key))}
            onBackspace={() => setDigits((current) => backspaceAmount(current))}
          />
          <Button onClick={commitPad}>Done</Button>
        </div>
      </BottomSheet>
    </section>
  );
}

import { Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Stepper } from '@/features/add/Stepper';
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
  const patch = (index: number, next: Partial<MealRow>) => {
    onChange(meals.map((meal, i) => (i === index ? { ...meal, ...next } : meal)));
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
              <Stepper value={meal.kg} step={0.5} suffix="kg" onChange={(kg) => patch(index, { kg })} />
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
    </section>
  );
}

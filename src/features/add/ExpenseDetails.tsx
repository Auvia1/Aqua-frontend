import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { CATEGORY_ICONS } from '@/components/ui/CategoryIcon';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { EXPENSE_CATEGORIES } from '@/data/addCatalog';
import { ICON } from '@/lib/tokens';
import type { CategoryId } from '@/types';

export function CategoryGrid({
  value,
  customLabel,
  onSelect,
  onCustom,
}: {
  value: CategoryId | null;
  customLabel: string;
  onSelect: (id: CategoryId) => void;
  onCustom: () => void;
}) {
  return (
    <div>
      <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Category</p>
      <div className="flex flex-wrap gap-2">
        {EXPENSE_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          const selected = value === cat.id && !customLabel;
          return (
            <Chip key={cat.id} selected={selected} onClick={() => onSelect(cat.id)} className="gap-1.5 px-3">
              <Icon size={16} strokeWidth={ICON.stroke} />
              {cat.label}
            </Chip>
          );
        })}
        <Chip selected={Boolean(customLabel)} onClick={onCustom} className="px-3">
          + Custom
        </Chip>
      </div>
    </div>
  );
}

export function CustomCategorySheet({
  open,
  value,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Custom category">
      <div className="space-y-3 pb-2">
        <TextField label="Category name" value={value} onChange={(event) => onChange(event.target.value)} />
        <Button onClick={onSave}>Add category</Button>
      </div>
    </BottomSheet>
  );
}

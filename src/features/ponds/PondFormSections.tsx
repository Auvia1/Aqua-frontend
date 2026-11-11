import { useRef } from 'react';
import { Camera, Minus, Plus, X } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { SelectField } from '@/components/ui/SelectField';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { FormSection } from '@/features/ponds/FormSection';
import { convertArea, type PondFormValues } from '@/features/ponds/formModel';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import { SPECIES_OPTIONS, WATER_SOURCES } from '@/services/ponds';
import type { AreaUnit, SpeciesId, WaterType } from '@/types';

interface FieldsProps {
  values: PondFormValues;
  errors: Record<string, string>;
  photoUrl: string;
  onChange: (patch: Partial<PondFormValues>) => void;
  onBlurField: (key: string) => void;
  onPhoto: (file: File | null) => void;
}

export function PondBasicsFields({ values, errors, onChange, onBlurField }: Omit<FieldsProps, 'photoUrl' | 'onPhoto'>) {
  return (
    <FormSection title="Basics">
      <TextField
        label="Pond name*"
        placeholder="e.g. Pond 5"
        value={values.name}
        error={errors.name}
        onBlur={() => onBlurField('name')}
        onChange={(event) => onChange({ name: event.target.value })}
      />
      <TextField
        label="Pond code"
        placeholder="e.g. P5"
        value={values.code}
        onChange={(event) => onChange({ code: event.target.value })}
      />
      <div>
        <span className="mb-2 block text-body font-medium text-ink">Area*</span>
        <div className="flex items-center gap-2">
          <input
            inputMode="decimal"
            placeholder="0"
            value={values.area}
            aria-invalid={Boolean(errors.area)}
            onBlur={() => onBlurField('area')}
            onChange={(event) => onChange({ area: event.target.value.replace(/[^\d.]/g, '') })}
            className={cn(
              'h-14 min-w-0 flex-1 rounded-input bg-surface px-4 text-body text-ink outline-none',
              'placeholder:text-muted focus-visible:ring-2 focus-visible:ring-forest-800/30',
              errors.area && 'ring-2 ring-danger/70',
            )}
          />
          <div className="w-[148px] shrink-0">
            <SegmentedTabs
              ariaLabel="Area unit"
              value={values.areaUnit}
              onChange={(unit: AreaUnit) =>
                onChange({
                  areaUnit: unit,
                  area: convertArea(values.area, values.areaUnit, unit),
                })
              }
              tabs={[
                { value: 'acres', label: 'Acres' },
                { value: 'cents', label: 'Cents' },
              ]}
            />
          </div>
        </div>
        {errors.area ? <p className="mt-1.5 text-caption text-danger">{errors.area}</p> : null}
      </div>
      <TextField
        label="Depth in feet"
        placeholder="e.g. 4.5"
        inputMode="decimal"
        value={values.depth}
        onChange={(event) => onChange({ depth: event.target.value.replace(/[^\d.]/g, '') })}
      />
    </FormSection>
  );
}

export function PondTypeFields({ values, onChange }: Pick<FieldsProps, 'values' | 'onChange'>) {
  const toggleSpecies = (id: SpeciesId) => {
    const selected = values.speciesIds.includes(id);
    onChange({
      speciesIds: selected ? values.speciesIds.filter((item) => item !== id) : [...values.speciesIds, id],
    });
  };

  return (
    <FormSection title="Type">
      <div>
        <p className="mb-2 text-body font-medium text-ink">Water type</p>
        <div className="flex flex-wrap gap-2">
          {(['brackish', 'fresh'] as WaterType[]).map((type) => (
            <Chip key={type} selected={values.waterType === type} onClick={() => onChange({ waterType: type })}>
              {type === 'brackish' ? 'Brackish' : 'Fresh'}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-body font-medium text-ink">Species</p>
        <div className="flex flex-wrap gap-2">
          {SPECIES_OPTIONS.map((option) => (
            <Chip
              key={option.id}
              selected={values.speciesIds.includes(option.id)}
              onClick={() => toggleSpecies(option.id)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>
      {values.speciesIds.includes('other') ? (
        <TextField
          label="Other species"
          placeholder="e.g. Milkfish"
          value={values.otherSpecies}
          onChange={(event) => onChange({ otherSpecies: event.target.value })}
        />
      ) : null}
    </FormSection>
  );
}

export function PondSetupFields({ values, onChange }: Pick<FieldsProps, 'values' | 'onChange'>) {
  return (
    <FormSection title="Setup">
      <SelectField
        label="Water source"
        placeholder="Select source"
        value={values.waterSource}
        onChange={(value) => onChange({ waterSource: value as PondFormValues['waterSource'] })}
        options={WATER_SOURCES.map((item) => ({ value: item.value, label: item.label }))}
      />
      <div className="flex min-h-touch items-center justify-between gap-3">
        <span className="text-body text-ink">Number of aerators</span>
        <div className="flex items-center gap-1">
          <IconButton
            label="Decrease aerators"
            tone="ghost"
            disabled={values.aerators <= 0}
            onClick={() => onChange({ aerators: Math.max(0, values.aerators - 1) })}
          >
            <Minus size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
          <span className="w-8 text-center text-title tabular-nums">{values.aerators}</span>
          <IconButton
            label="Increase aerators"
            tone="ghost"
            onClick={() => onChange({ aerators: values.aerators + 1 })}
          >
            <Plus size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
        </div>
      </div>
    </FormSection>
  );
}

export function PondExtrasFields({
  values,
  photoUrl,
  onChange,
  onPhoto,
}: Pick<FieldsProps, 'values' | 'photoUrl' | 'onChange' | 'onPhoto'>) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormSection title="Extras">
      <TextArea
        label="Notes"
        rows={3}
        placeholder="Anything to remember about this pond"
        value={values.notes}
        onChange={(event) => onChange({ notes: event.target.value })}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onPhoto(file);
          event.target.value = '';
        }}
      />
      {photoUrl ? (
        <div className="relative">
          <img src={photoUrl} alt="Pond preview" className="h-36 w-full rounded-input object-cover" />
          <span className="absolute right-2 top-2">
            <IconButton label="Remove photo" onClick={() => onPhoto(null)}>
              <X size={ICON.size} strokeWidth={ICON.stroke} />
            </IconButton>
          </span>
          {values.photoName ? (
            <p className="mt-2 truncate text-caption text-muted">{values.photoName}</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="pressable flex min-h-[96px] w-full flex-col items-center justify-center rounded-input border border-dashed border-line text-forest-800"
        >
          <Camera size={ICON.size} strokeWidth={ICON.stroke} />
          <span className="mt-2 text-caption font-semibold">Add pond photo</span>
        </button>
      )}
    </FormSection>
  );
}

import { BottomSheet } from '@/components/ui/BottomSheet';
import { useT } from '@/hooks/useT';
import type { TKey } from '@/i18n';

export function ExportSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (label: string) => void;
}) {
  const { t } = useT();
  const options: TKey[] = ['pdf', 'excelCsv', 'shareWhatsapp'];
  return (
    <BottomSheet open={open} onClose={onClose} title={t('export')}>
      <div className="space-y-1 pb-2">
        {options.map((key) => {
          const label = t(key);
          return (
          <button
            key={label}
            type="button"
            onClick={() => {
              onPick(label);
              onClose();
            }}
            className="pressable flex h-12 w-full items-center rounded-input bg-surface px-4 text-body text-ink"
          >
            {label}
          </button>
            );
        })}
      </div>
    </BottomSheet>
  );
}

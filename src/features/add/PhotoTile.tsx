import { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { ICON } from '@/lib/tokens';

export function PhotoTile({
  url,
  label,
  onPick,
}: {
  url: string;
  label: string;
  onPick: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onPick(event.target.files?.[0] ?? null);
          event.target.value = '';
        }}
      />
      {url ? (
        <div className="relative w-20">
          <img src={url} alt="" className="h-20 w-20 rounded-input object-cover" />
          <span className="absolute -right-2 -top-2">
            <IconButton label="Remove photo" className="h-10 w-10" onClick={() => onPick(null)}>
              <X size={16} strokeWidth={ICON.stroke} />
            </IconButton>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="pressable flex h-20 w-20 flex-col items-center justify-center rounded-input border border-dashed border-line text-forest-800"
        >
          <Camera size={ICON.size} strokeWidth={ICON.stroke} />
          <span className="mt-1 text-[10px] font-semibold leading-3">{label}</span>
        </button>
      )}
    </div>
  );
}

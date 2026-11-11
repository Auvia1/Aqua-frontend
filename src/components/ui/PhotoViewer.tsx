import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useSheetHost } from '@/context/SheetHost';
import { ICON } from '@/lib/tokens';

export function PhotoViewer({ url, onClose }: { url: string | null; onClose: () => void }) {
  const host = useSheetHost();

  useEffect(() => {
    if (!url) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [url, onClose]);

  if (!host || !url) return null;

  return createPortal(
    <div className="absolute inset-0 z-[60] flex flex-col bg-forest-900">
      <div className="flex justify-end px-page pt-[max(12px,env(safe-area-inset-top))]">
        <IconButton label="Close" tone="dark" onClick={onClose}>
          <X size={ICON.size} strokeWidth={ICON.stroke} />
        </IconButton>
      </div>
      <img src={url} alt="Bill" className="min-h-0 flex-1 object-contain p-4" />
    </div>,
    host,
  );
}

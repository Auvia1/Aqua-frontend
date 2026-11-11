import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useSheetHost } from '@/context/SheetHost';
import { cn } from '@/lib/cn';
import { ICON, MOTION, SHEET_CLOSE_OFFSET } from '@/lib/tokens';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  layer?: 'base' | 'nested';
}

export function BottomSheet({ open, onClose, title, children, className, layer = 'base' }: BottomSheetProps) {
  const host = useSheetHost();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!host) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className={cn('absolute inset-0 flex flex-col justify-end', layer === 'nested' ? 'z-[45]' : 'z-sheet')}>
          <motion.button
            type="button"
            aria-label="Close sheet"
            className="absolute inset-0 bg-forest-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration, ease: MOTION.ease }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative z-10 max-h-[86%] overflow-y-auto rounded-t-nav bg-card px-page pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-sheet',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: MOTION.duration, ease: MOTION.ease }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.4 }}
            onDragEnd={(_event, info) => {
              if (info.offset.y > SHEET_CLOSE_OFFSET || info.velocity.y > 640) {
                onClose();
              }
            }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-pill bg-line" />
            {title ? (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-h2 text-ink">{title}</h2>
                <IconButton label="Close" onClick={onClose} tone="ghost">
                  <X size={ICON.size} strokeWidth={ICON.stroke} />
                </IconButton>
              </div>
            ) : null}
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    host,
  );
}

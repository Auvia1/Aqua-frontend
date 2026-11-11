import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { MOTION } from '@/lib/tokens';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
}

interface ToastViewportProps {
  toasts: ToastItem[];
}

const TONE: Record<ToastTone, string> = {
  success: 'bg-forest-800 text-white',
  error: 'bg-danger text-white',
  info: 'bg-ink text-white',
};

export function ToastViewport({ toasts }: ToastViewportProps) {
  return (
    <div className="pointer-events-none absolute inset-x-page top-[max(12px,env(safe-area-inset-top))] z-toast flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: MOTION.duration, ease: MOTION.ease }}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-pill px-4 py-3 text-body font-medium shadow-soft',
              TONE[toast.tone],
            )}
          >
            <span className={toast.action ? 'text-left' : 'flex-1 text-center'}>{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className="shrink-0 font-semibold underline decoration-white/70 underline-offset-2"
                onClick={toast.action.onClick}
              >
                {toast.action.label}
              </button>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

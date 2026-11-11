import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { type ToastAction, type ToastItem, type ToastTone } from '@/components/ui/Toast';
import { TOAST_MS } from '@/lib/tokens';

interface UiContextValue {
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastTone, action?: ToastAction) => void;
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);

  const showToast = useCallback((message: string, tone: ToastTone = 'info', action?: ToastAction) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current.slice(-2), { id, message, tone, action }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, action ? 4000 : TOAST_MS);
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({
      toasts,
      showToast,
      isQuickAddOpen,
      openQuickAdd: () => setQuickAddOpen(true),
      closeQuickAdd: () => setQuickAddOpen(false),
    }),
    [showToast, isQuickAddOpen, toasts],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within UiProvider');
  }
  return context;
}

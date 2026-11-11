import { useRef, type PointerEventHandler } from 'react';
import { SWIPE_THRESHOLD } from '@/lib/tokens';

export function useSwipe(
  onLeft: () => void,
  onRight: () => void,
  threshold: number = SWIPE_THRESHOLD,
): {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
} {
  const startX = useRef<number | null>(null);

  return {
    onPointerDown: (event) => {
      startX.current = event.clientX;
    },
    onPointerUp: (event) => {
      if (startX.current == null) return;
      const dx = event.clientX - startX.current;
      startX.current = null;
      if (dx <= -threshold) onLeft();
      if (dx >= threshold) onRight();
    },
    onPointerCancel: () => {
      startX.current = null;
    },
  };
}

import { useRef, useState, type ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ICON } from '@/lib/tokens';

const OPEN = -128;

export function SwipeRow({
  children,
  onEdit,
  onDelete,
}: {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [x, setX] = useState(0);
  const start = useRef<{ x: number; y: number; open: number } | null>(null);
  const axis = useRef<'h' | 'v' | null>(null);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex">
        <button
          type="button"
          aria-label="Edit"
          onClick={onEdit}
          className="flex w-16 items-center justify-center bg-leaf-500 text-white"
        >
          <Pencil size={ICON.size} strokeWidth={ICON.stroke} />
        </button>
        <button
          type="button"
          aria-label="Delete"
          onClick={onDelete}
          className="flex w-16 items-center justify-center bg-danger text-white"
        >
          <Trash2 size={ICON.size} strokeWidth={ICON.stroke} />
        </button>
      </div>
      <div
        className="relative bg-card"
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={(event) => {
          start.current = { x: event.clientX, y: event.clientY, open: x };
          axis.current = null;
        }}
        onPointerMove={(event) => {
          if (!start.current) return;
          const dx = event.clientX - start.current.x;
          const dy = event.clientY - start.current.y;
          if (!axis.current) {
            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
            axis.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
          }
          if (axis.current !== 'h') return;
          event.preventDefault();
          const next = Math.min(0, Math.max(OPEN, start.current.open + dx));
          setX(next);
        }}
        onPointerUp={() => {
          if (axis.current === 'h') setX((current) => (current < OPEN / 2 ? OPEN : 0));
          start.current = null;
          axis.current = null;
        }}
        onPointerCancel={() => {
          start.current = null;
          axis.current = null;
        }}
      >
        {children}
      </div>
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ICON } from '@/lib/tokens';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tile text-forest-800">
        <Icon size={ICON.tile} strokeWidth={ICON.stroke} />
      </div>
      <h2 className="text-title text-ink">{title}</h2>
      {description ? <p className="mt-2 max-w-[260px] text-body text-muted">{description}</p> : null}
      {action ? <div className="mt-6 w-full">{action}</div> : null}
    </div>
  );
}

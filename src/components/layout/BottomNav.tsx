import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Home, Plus, Waves } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { cn } from '@/lib/cn';
import { ICON } from '@/lib/tokens';
import type { TKey } from '@/i18n';

interface BottomNavProps {
  onFabClick: () => void;
  embedded?: boolean;
}

const ITEMS = [
  { to: '/home', labelKey: 'navHome' as const, icon: Home },
  { to: '/ponds', labelKey: 'navPonds' as const, icon: Waves },
] as const;

const RIGHT_ITEMS = [
  { to: '/ledger', labelKey: 'navLedger' as const, icon: BookOpen },
  { to: '/reports', labelKey: 'navReports' as const, icon: BarChart3 },
] as const;

function NavItem({
  to,
  labelKey,
  icon: Icon,
}: {
  to: string;
  labelKey: TKey;
  icon: typeof Home;
}) {
  const { t } = useT();
  const label = t(labelKey);
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'pressable flex min-h-touch min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30',
          isActive ? 'text-forest-800' : 'text-muted',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={ICON.size} strokeWidth={isActive ? 2.1 : ICON.stroke} />
          <span className={cn('text-caption', isActive ? 'font-bold' : 'font-medium')}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function BottomNav({ onFabClick, embedded = false }: BottomNavProps) {
  const { t } = useT();
  return (
    <nav
      aria-label={t('primaryNav')}
      className={cn(
        'z-nav bg-card px-2 pt-2 shadow-soft',
        embedded ? 'relative rounded-t-nav' : 'absolute inset-x-0 bottom-0 rounded-t-nav',
      )}
    >
      <div className="flex items-end pb-[max(8px,env(safe-area-inset-bottom))]">
        {ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="flex flex-1 justify-center">
          <button
            type="button"
            aria-label={t('addNew')}
            onClick={onFabClick}
            className="pressable relative -top-5 flex h-fab w-fab items-center justify-center rounded-full bg-forest-800 text-white shadow-fab ring-[6px] ring-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
          >
            <Plus size={ICON.fab} strokeWidth={2.2} />
          </button>
        </div>

        {RIGHT_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}

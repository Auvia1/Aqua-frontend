import { useNavigate } from 'react-router-dom';
import { Receipt, TrendingUp, Wheat } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { QuickActionTile } from '@/components/ui/QuickActionTile';
import { useT } from '@/hooks/useT';
import type { TKey } from '@/i18n';

const ACTIONS = [
  { to: '/add/expense', labelKey: 'addExpense' as const, icon: Receipt },
  { to: '/add/feed', labelKey: 'addFeed' as const, icon: Wheat },
  { to: '/add/sale', labelKey: 'addSale' as const, icon: TrendingUp },
] satisfies { to: string; labelKey: TKey; icon: typeof Receipt }[];

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAddSheet({ open, onClose }: QuickAddSheetProps) {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <BottomSheet open={open} onClose={onClose} title={t('addNew')}>
      <div className="grid grid-cols-3 gap-x-2 gap-y-5 pb-4">
        {ACTIONS.map((action) => (
          <QuickActionTile
            key={action.to}
            icon={action.icon}
            label={t(action.labelKey)}
            onClick={() => {
              onClose();
              navigate(action.to);
            }}
          />
        ))}
      </div>
    </BottomSheet>
  );
}

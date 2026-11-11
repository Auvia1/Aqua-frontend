import { Button } from '@/components/ui/Button';

export function AddFooter({
  primary,
  secondary,
  disabled,
  loading,
  onPrimary,
  onSecondary,
}: {
  primary: string;
  secondary?: string;
  disabled: boolean;
  loading: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
}) {
  return (
    <div className="shrink-0 space-y-1 border-t border-line bg-bg px-page pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      <Button loading={loading} disabled={disabled} onClick={onPrimary}>
        {primary}
      </Button>
      {secondary && onSecondary ? (
        <Button variant="ghost" disabled={disabled || loading} onClick={onSecondary}>
          {secondary}
        </Button>
      ) : null}
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Search, X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { t } from '@/i18n';
import { ICON } from '@/lib/tokens';

type HomeHeaderProps = {
  variant: 'a';
  greeting: string;
  subtitle?: string;
  onSearch: () => void;
  onBell: () => void;
  bellDot?: boolean;
  onAvatar?: () => void;
  avatarText?: string;
};

type PageHeaderBProps = {
  variant: 'b';
  title: string;
  subtitle?: string;
  onBack?: () => void;
  hideBack?: boolean;
  close?: boolean;
  right?: ReactNode;
  rightIcon?: LucideIcon;
  rightAriaLabel?: string;
  onRightClick?: () => void;
};

type PageHeaderProps = HomeHeaderProps | PageHeaderBProps;

export function PageHeader(props: PageHeaderProps) {
  const navigate = useNavigate();

  if (props.variant === 'a') {
    return (
      <header className="flex items-center justify-between gap-3 px-page pt-[max(12px,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-3">
          {props.onAvatar ? (
            <button
              type="button"
              aria-label={t('openSettings')}
              onClick={props.onAvatar}
              className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-800 text-title text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/35"
            >
              {props.avatarText ?? 'R'}
            </button>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-h2 text-ink">{props.greeting}</h1>
            {props.subtitle ? <p className="mt-0.5 text-caption text-muted">{props.subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label={t('search')} onClick={props.onSearch}>
            <Search size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
          <span className="relative">
            <IconButton label={t('notifications')} onClick={props.onBell}>
              <Bell size={ICON.size} strokeWidth={ICON.stroke} />
            </IconButton>
            {props.bellDot ? (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger" aria-hidden />
            ) : null}
          </span>
        </div>
      </header>
    );
  }

  const handleBack = props.onBack ?? (() => navigate(-1));
  const RightIcon = props.rightIcon;

  return (
    <header className="grid grid-cols-[48px_1fr_auto] items-center gap-2 px-page pt-[max(12px,env(safe-area-inset-top))]">
      {props.hideBack ? (
        <span />
      ) : (
        <IconButton label={props.close ? t('close') : t('back')} onClick={handleBack}>
          {props.close ? (
            <X size={ICON.size} strokeWidth={ICON.stroke} />
          ) : (
            <ArrowLeft size={ICON.size} strokeWidth={ICON.stroke} />
          )}
        </IconButton>
      )}
      <div className="min-w-0 text-center">
        <h1 className="text-title text-ink">{props.title}</h1>
        {props.subtitle ? <p className="text-caption text-muted">{props.subtitle}</p> : null}
      </div>
      {props.right ? (
        <div className="flex justify-end">{props.right}</div>
      ) : RightIcon && props.onRightClick ? (
        <IconButton label={props.rightAriaLabel ?? 'Action'} onClick={props.onRightClick}>
          <RightIcon size={ICON.size} strokeWidth={ICON.stroke} />
        </IconButton>
      ) : (
        <span className="w-12" />
      )}
    </header>
  );
}

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { BottomNav } from '@/components/layout/BottomNav';
import { QuickAddSheet } from '@/components/layout/QuickAddSheet';
import { ToastViewport } from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthProvider';
import { SheetHostProvider } from '@/context/SheetHost';
import { LedgerProvider } from '@/context/LedgerProvider';
import { RemoteProvider } from '@/context/RemoteProvider';
import { SettingsProvider } from '@/context/SettingsProvider';
import { UiProvider, useUi } from '@/context/UiProvider';
import { cn } from '@/lib/cn';
import { shouldHideNav } from '@/lib/nav';

function ShellInner() {
  const location = useLocation();
  const { toasts, isQuickAddOpen, openQuickAdd, closeQuickAdd } = useUi();
  const hideNav = shouldHideNav(location.pathname);
  const [host, setHost] = useState<HTMLElement | null>(null);

  return (
    <div className="flex min-h-full justify-center bg-frame">
      <div
        ref={setHost}
        className={cn(
          'app-frame relative w-full min-w-0 max-w-app overflow-hidden',
          'bg-bg md:my-8 md:rounded-frame md:shadow-[0_16px_48px_rgba(14,51,38,0.12)]',
        )}
      >
        <SheetHostProvider host={host}>
          <div
            className={cn(
              'absolute inset-0',
              hideNav ? 'overflow-hidden' : 'app-scroll',
              !hideNav && 'pb-nav',
            )}
          >
            <div
              key={location.pathname}
              className={cn('rise-in', hideNav ? 'h-full min-h-0 overflow-hidden' : 'min-h-full')}
            >
              <Outlet />
            </div>
          </div>
          {hideNav ? null : <BottomNav onFabClick={openQuickAdd} />}
          <QuickAddSheet open={isQuickAddOpen} onClose={closeQuickAdd} />
          <ToastViewport toasts={toasts} />
        </SheetHostProvider>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <MotionConfig reducedMotion="user">
      <UiProvider>
        <AuthProvider>
          <RemoteProvider>
            <LedgerProvider>
              <SettingsProvider>
                <ShellInner />
              </SettingsProvider>
            </LedgerProvider>
          </RemoteProvider>
        </AuthProvider>
      </UiProvider>
    </MotionConfig>
  );
}

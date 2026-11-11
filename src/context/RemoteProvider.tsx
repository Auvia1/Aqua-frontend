import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { hydrateRemote } from '@/services/remote';

export function RemoteProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [ready, setReady] = useState(!token);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return undefined;
    }
    setReady(false);
    let cancelled = false;
    void hydrateRemote().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center bg-bg">
        <div className="h-12 w-12 animate-pulse rounded-full bg-tile" />
      </div>
    );
  }

  return <>{children}</>;
}

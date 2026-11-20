import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api, getToken, setToken } from '@/lib/api';
import { clearRemote } from '@/services/remote';

interface AuthValue {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (input: { username: string; password: string; farmName: string; language?: 'en' | 'te' }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(() => getToken());

  const value = useMemo<AuthValue>(
    () => ({
      token,
      async login(username, password) {
        const next = await api<{ token: string }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        setToken(next.token);
        setTok(next.token);
      },
      async register(input) {
        const next = await api<{ token: string }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        setToken(next.token);
        setTok(next.token);
      },
      logout() {
        setToken(null);
        setTok(null);
        clearRemote();
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function returnPath(state: unknown): string {
  if (!state || typeof state !== 'object' || !('from' in state)) return '/home';
  const from = (state as { from?: unknown }).from;
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return '/home';
  if (from === '/login' || from.startsWith('/login?') || from === '/register' || from.startsWith('/register?')) {
    return '/home';
  }
  return from;
}

export function RequireAuth() {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return <Outlet />;
}

export function GuestOnly() {
  const { token } = useAuth();
  const location = useLocation();
  if (token) return <Navigate to={returnPath(location.state)} replace />;
  return <Outlet />;
}

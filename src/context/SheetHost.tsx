import { createContext, useContext, type ReactNode } from 'react';

const SheetHostContext = createContext<HTMLElement | null>(null);

export function SheetHostProvider({
  host,
  children,
}: {
  host: HTMLElement | null;
  children: ReactNode;
}) {
  return <SheetHostContext.Provider value={host}>{children}</SheetHostContext.Provider>;
}

export function useSheetHost(): HTMLElement | null {
  return useContext(SheetHostContext);
}

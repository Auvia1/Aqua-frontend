import type { ReactNode } from 'react';

export function DevSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-caption font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
      {children}
    </section>
  );
}

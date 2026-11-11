import type { ReactNode } from 'react';

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-caption font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="space-y-4 rounded-card bg-card p-4 shadow-soft">{children}</div>
    </section>
  );
}

export function ToggleRow({
  label,
  control,
}: {
  label: string;
  control: ReactNode;
}) {
  return (
    <div className="flex min-h-touch items-center justify-between gap-3">
      <span className="text-body text-ink">{label}</span>
      {control}
    </div>
  );
}

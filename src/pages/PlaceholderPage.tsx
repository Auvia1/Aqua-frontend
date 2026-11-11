import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="min-h-full bg-bg">
      <PageHeader variant="b" title={title} />
      <EmptyState
        icon={ClipboardList}
        title="Coming in a later part"
        description="This screen is wired for navigation now. The real layout arrives in a later part."
      />
    </div>
  );
}

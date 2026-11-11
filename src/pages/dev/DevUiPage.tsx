import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUi } from '@/context/UiProvider';
import { DevForms } from '@/pages/dev/DevForms';
import { DevVisuals } from '@/pages/dev/DevVisuals';

export function DevUiPage() {
  const navigate = useNavigate();
  const { showToast, openQuickAdd } = useUi();

  return (
    <div className="min-h-full bg-bg pb-10">
      <PageHeader variant="b" title="UI kit" onBack={() => navigate('/home')} />
      <div className="mt-4 space-y-8 px-page">
        <p className="text-body text-muted">Visual check against the reference. Not shown in the product nav.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={openQuickAdd}>
            Open add sheet
          </Button>
          <Button variant="secondary" onClick={() => showToast('Coming soon', 'success')}>
            Show toast
          </Button>
        </div>
        <DevVisuals />
        <DevForms />
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUi } from '@/context/UiProvider';

export function AddRedirectPage() {
  const navigate = useNavigate();
  const { openQuickAdd } = useUi();

  useEffect(() => {
    openQuickAdd();
    navigate('/home', { replace: true });
  }, [navigate, openQuickAdd]);

  return null;
}

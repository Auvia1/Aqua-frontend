import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUi } from '@/context/UiProvider';
import {
  PondBasicsFields,
  PondExtrasFields,
  PondSetupFields,
  PondTypeFields,
} from '@/features/ponds/PondFormSections';
import { ArchivePondSheet, DiscardSheet } from '@/features/ponds/PondSheets';
import {
  emptyPondForm,
  formToPond,
  pondToForm,
  snapshot,
  validatePondForm,
  type PondFormValues,
} from '@/features/ponds/formModel';
import { archivePond, loadPond, savePond } from '@/services/ponds';
import type { Pond } from '@/types';

export function PondFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useUi();

  const [values, setValues] = useState<PondFormValues>(emptyPondForm);
  const [initial, setInitial] = useState(snapshot(emptyPondForm()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState('');
  const [pondName, setPondName] = useState('this pond');
  const [existing, setExisting] = useState<Pond | undefined>();
  const [busy, setBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    let alive = true;
    loadPond(id).then((pond) => {
      if (!alive || !pond) return;
      const next = pondToForm(pond);
      setExisting(pond);
      setValues(next);
      setInitial(snapshot(next));
      setPondName(pond.name);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  const dirty = useMemo(() => snapshot(values) !== initial, [values, initial]);

  const patch = (next: Partial<PondFormValues>) => {
    setValues((current) => ({ ...current, ...next }));
    const keys = Object.keys(next);
    if (keys.some((key) => errors[key])) {
      setErrors((current) => {
        const copy = { ...current };
        keys.forEach((key) => {
          delete copy[key];
        });
        return copy;
      });
    }
  };

  const onBlurField = (key: string) => {
    const message = validatePondForm(values)[key];
    if (message) setErrors((current) => ({ ...current, [key]: message }));
  };

  const onPhoto = (file: File | null) => {
    setPhotoUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : '';
    });
    patch({ photoName: file?.name ?? '' });
  };

  const goBack = () => navigate('/ponds');

  const onSave = async () => {
    const nextErrors = validatePondForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setBusy(true);
    try {
      await savePond(formToPond(values, existing));
      showToast('Pond saved', 'success');
      goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title={isEdit ? 'Edit pond' : 'Add pond'}
        onBack={() => {
          if (dirty) setDiscardOpen(true);
          else goBack();
        }}
      />

      <div className="flex-1 space-y-5 overflow-y-auto px-page pb-4 pt-4">
        <PondBasicsFields values={values} errors={errors} onChange={patch} onBlurField={onBlurField} />
        <PondTypeFields values={values} onChange={patch} />
        <PondSetupFields values={values} onChange={patch} />
        <PondExtrasFields values={values} photoUrl={photoUrl} onChange={patch} onPhoto={onPhoto} />
      </div>

      <div className="shrink-0 border-t border-line bg-bg px-page pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <Button loading={busy} onClick={() => void onSave()}>
          Save pond
        </Button>
        {isEdit ? (
          <button
            type="button"
            onClick={() => setArchiveOpen(true)}
            className="pressable mt-1 flex min-h-touch w-full items-center justify-center text-body font-semibold text-danger"
          >
            Archive pond
          </button>
        ) : null}
      </div>

      <DiscardSheet
        open={discardOpen}
        onKeep={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          goBack();
        }}
      />
      <ArchivePondSheet
        open={archiveOpen}
        pondName={pondName}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          void archivePond(id).then(() => {
            setArchiveOpen(false);
            showToast('Pond archived', 'success');
            navigate('/ponds?filter=idle');
          });
        }}
      />
    </div>
  );
}

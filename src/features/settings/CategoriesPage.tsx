import { useState } from 'react';
import { GripVertical, Lock, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { Toggle } from '@/components/ui/Toggle';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSettings } from '@/context/SettingsProvider';
import { useUi } from '@/context/UiProvider';
import { CategoryFormSheet } from '@/features/settings/SettingsSheets';
import { SettingsGlyph } from '@/features/settings/settingsIcons';
import { categoryLabel } from '@/i18n';
import { useT } from '@/hooks/useT';
import { ICON } from '@/lib/tokens';
import type { SettingsCategory } from '@/types';

export function CategoriesPage() {
  const { showToast } = useUi();
  const { categories, setCategories } = useSettings();
  const { t, lang } = useT();
  const [group, setGroup] = useState<'pond' | 'common'>('pond');
  const [form, setForm] = useState<'add' | SettingsCategory | 'icon' | null>(null);
  const [menu, setMenu] = useState<SettingsCategory | null>(null);
  const [remove, setRemove] = useState<SettingsCategory | null>(null);
  const [move, setMove] = useState<SettingsCategory | null>(null);

  const rows = categories.filter((item) => item.group === group);
  const editing = form && form !== 'add' && form !== 'icon' ? form : null;
  const iconOnly = form === 'icon' && menu ? menu : null;

  const shift = (id: string, dir: -1 | 1) => {
    setCategories((current) => {
      const list = [...current];
      const index = list.findIndex((item) => item.id === id);
      const swap = index + dir;
      if (index < 0 || swap < 0 || swap >= list.length) return current;
      if (list[index]?.group !== list[swap]?.group) return current;
      const a = list[index];
      const b = list[swap];
      if (!a || !b) return current;
      list[index] = b;
      list[swap] = a;
      return list;
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title={t('categories')}
        right={
          <IconButton label={t('addCategory')} onClick={() => setForm('add')}>
            <Plus size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
        }
      />
      <div className="flex-1 space-y-4 overflow-y-auto px-page pb-8 pt-4">
        <SegmentedTabs
          value={group}
          onChange={setGroup}
          tabs={[
            { value: 'pond', label: t('pondTab') },
            { value: 'common', label: t('commonTab') },
          ]}
        />
        <ul className="overflow-hidden rounded-card bg-card shadow-soft">
          {rows.map((item, index) => (
            <li key={item.id} className={`flex items-center gap-2 px-3 py-2.5 ${index < rows.length - 1 ? 'border-b border-line' : ''}`}>
              <button
                type="button"
                aria-label={t('reorderNamed', { name: categoryLabel(lang, item.id, item.name) })}
                onClick={() => setMove(item)}
                className="pressable flex h-12 w-12 items-center justify-center text-muted"
              >
                <GripVertical size={ICON.size} strokeWidth={ICON.stroke} />
              </button>
              <SettingsGlyph icon={item.icon} tint={item.tint} />
              <span className="min-w-0 flex-1 text-title text-ink">{categoryLabel(lang, item.id, item.name)}</span>
              {item.locked ? <Lock size={16} strokeWidth={ICON.stroke} className="text-muted" /> : null}
              <Toggle
                label={t('enableNamed', { name: categoryLabel(lang, item.id, item.name) })}
                checked={item.enabled}
                onChange={(enabled) =>
                  setCategories((current) => current.map((row) => (row.id === item.id ? { ...row, enabled } : row)))
                }
              />
              {item.locked ? null : (
                <IconButton label={t('more')} tone="ghost" onClick={() => setMenu(item)}>
                  <MoreVertical size={ICON.size} strokeWidth={ICON.stroke} />
                </IconButton>
              )}
            </li>
          ))}
        </ul>
        <Button variant="secondary" onClick={() => setForm('add')}>
          {t('addCategory')}
        </Button>
      </div>

      <CategoryFormSheet
        open={form === 'add' || Boolean(editing)}
        title={editing ? t('rename') : t('addCategory')}
        initial={editing ? { name: editing.name, icon: editing.icon, tint: editing.tint } : undefined}
        onClose={() => setForm(null)}
        onSave={(input) => {
          if (editing) {
            setCategories((current) => current.map((row) => (row.id === editing.id ? { ...row, ...input } : row)));
            showToast(t('categoryUpdated'), 'success');
            return;
          }
          setCategories((current) => [
            ...current,
            {
              id: `custom-${Date.now()}`,
              name: input.name,
              icon: input.icon,
              tint: input.tint,
              group,
              locked: false,
              enabled: true,
            },
          ]);
          showToast(t('categoryAdded'), 'success');
        }}
      />
      <CategoryFormSheet
        open={Boolean(iconOnly)}
        title={t('changeIcon')}
        initial={iconOnly ? { name: iconOnly.name, icon: iconOnly.icon, tint: iconOnly.tint } : undefined}
        onClose={() => {
          setForm(null);
          setMenu(null);
        }}
        onSave={(input) => {
          if (!iconOnly) return;
          setCategories((current) => current.map((row) => (row.id === iconOnly.id ? { ...row, icon: input.icon, tint: input.tint } : row)));
          showToast(t('iconUpdated'), 'success');
        }}
      />

      <BottomSheet open={Boolean(menu) && form == null} onClose={() => setMenu(null)} title={menu ? categoryLabel(lang, menu.id, menu.name) : undefined}>
        <div className="space-y-1 pb-2">
          <MenuBtn
            label={t('rename')}
            onClick={() => {
              if (menu) setForm(menu);
              setMenu(null);
            }}
          />
          <MenuBtn
            label={t('changeIcon')}
            onClick={() => {
              setForm('icon');
            }}
          />
          <MenuBtn
            label={t('delete')}
            danger
            onClick={() => {
              setRemove(menu);
              setMenu(null);
            }}
          />
        </div>
      </BottomSheet>

      <BottomSheet open={Boolean(move)} onClose={() => setMove(null)} title={t('reorder')}>
        <div className="space-y-1 pb-2">
          <MenuBtn
            label={t('moveUp')}
            onClick={() => {
              if (move) shift(move.id, -1);
              setMove(null);
            }}
          />
          <MenuBtn
            label={t('moveDown')}
            onClick={() => {
              if (move) shift(move.id, 1);
              setMove(null);
            }}
          />
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={Boolean(remove)}
        title={t('deleteCategoryQ')}
        message={t('deleteCategoryMsg', { name: remove ? categoryLabel(lang, remove.id, remove.name) : t('thisPond') })}
        confirmLabel={t('delete')}
        onClose={() => setRemove(null)}
        onConfirm={() => {
          if (remove) setCategories((current) => current.filter((item) => item.id !== remove.id));
          setRemove(null);
          showToast(t('categoryDeleted'));
        }}
      />
    </div>
  );
}

function MenuBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pressable flex h-12 w-full items-center rounded-input bg-surface px-4 text-body ${danger ? 'text-danger' : 'text-ink'}`}
    >
      {label}
    </button>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Plus, Search, Waves } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { useUi } from '@/context/UiProvider';
import { AddPondCard, PondCardSkeleton, PondListCard } from '@/features/ponds/PondListCard';
import { ArchivePondSheet, PondActionSheet, SortSheet } from '@/features/ponds/PondSheets';
import { useT } from '@/hooks/useT';
import { formatArea } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import {
  archivePond,
  filterPonds,
  loadPondsPage,
  type PondListItem,
} from '@/services/ponds';
import type { AreaUnit, Pond, PondListFilter, PondSort } from '@/types';

export function PondsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const empty = params.get('empty') === '1';
  const { showToast } = useUi();
  const { t } = useT();

  const [loading, setLoading] = useState(!empty);
  const [items, setItems] = useState<PondListItem[]>([]);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('acres');
  const [filter, setFilter] = useState<PondListFilter>(() => {
    const value = params.get('filter');
    if (value === 'active' || value === 'idle' || value === 'harvested' || value === 'all') return value;
    return 'all';
  });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<PondSort>('name');
  const [sortOpen, setSortOpen] = useState(false);
  const [menuPond, setMenuPond] = useState<Pond | null>(null);
  const [archivePondItem, setArchivePondItem] = useState<Pond | null>(null);

  useEffect(() => {
    if (empty) return undefined;
    let alive = true;
    loadPondsPage().then((model) => {
      if (!alive) return;
      setItems(model.items);
      setAreaUnit(model.farm.areaUnit);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [empty]);

  const counts = useMemo(
    () => ({
      all: items.length,
      active: items.filter((item) => item.pond.status === 'active').length,
      idle: items.filter((item) => item.pond.status === 'idle').length,
      harvested: items.filter((item) => item.pond.status === 'harvested').length,
    }),
    [items],
  );

  const visible = useMemo(() => filterPonds(items, filter, query, sort), [items, filter, query, sort]);
  const totalArea = items.reduce((sum, item) => sum + item.pond.areaAcres, 0);

  const closeMenu = () => setMenuPond(null);

  return (
    <div className="min-h-full bg-bg pb-6">
      <header className="flex items-center justify-between gap-3 px-page pt-[max(12px,env(safe-area-inset-top))]">
        <h1 className="text-h1 text-ink">{t('pondsTitle')}</h1>
        <IconButton label={t('addPondCta')} onClick={() => navigate('/ponds/new')}>
          <Plus size={ICON.size} strokeWidth={ICON.stroke} />
        </IconButton>
      </header>

      {empty ? (
        <EmptyState
          icon={Waves}
          title={t('noPonds')}
          description={t('noPondsHint')}
          action={<Button onClick={() => navigate('/ponds/new')}>{t('addPondCta')}</Button>}
        />
      ) : loading ? (
        <div className="mt-4 space-y-3 px-page">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 animate-pulse rounded-card bg-tile" />
            <div className="h-16 animate-pulse rounded-card bg-tile" />
            <div className="h-16 animate-pulse rounded-card bg-tile" />
          </div>
          <PondCardSkeleton />
          <PondCardSkeleton />
          <PondCardSkeleton />
        </div>
      ) : (
        <div className="mt-4 space-y-4 px-page">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label={t('totalPonds')} value={String(items.length)} />
            <MiniStat label={t('active')} value={String(counts.active)} />
            <MiniStat label={t('totalArea')} value={formatArea(totalArea, areaUnit)} />
          </div>

          <SegmentedTabs
            ariaLabel={t('status')}
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: 'all', label: `${t('all')} ${counts.all}` },
              { value: 'active', label: `${t('active')} ${counts.active}` },
              { value: 'idle', label: `${t('idle')} ${counts.idle}` },
              { value: 'harvested', label: `${t('harvested')} ${counts.harvested}` },
            ]}
          />

          <div className="flex items-center gap-2">
            <label className="flex h-12 min-h-touch min-w-0 flex-1 items-center gap-2 rounded-input bg-card px-3 shadow-soft">
              <Search size={18} strokeWidth={ICON.stroke} className="shrink-0 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPond')}
                className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-muted"
              />
            </label>
            <IconButton label={t('sortPonds')} onClick={() => setSortOpen(true)}>
              <ArrowUpDown size={ICON.size} strokeWidth={ICON.stroke} />
            </IconButton>
          </div>

          {visible.length === 0 ? (
            <>
              <EmptyState
                icon={Waves}
                title={t('noPondsMatch')}
                description={t('tryDifferentFilter')}
                action={
                  query ? (
                    <Button variant="secondary" onClick={() => setQuery('')}>
                      {t('clearAll')}
                    </Button>
                  ) : undefined
                }
              />
              <AddPondCard onClick={() => navigate('/ponds/new')} />
            </>
          ) : (
            <div className="space-y-3">
              {visible.map((item) => (
                <PondListCard
                  key={item.pond.id}
                  item={item}
                  areaUnit={areaUnit}
                  onOpen={() => navigate(`/ponds/${item.pond.id}`)}
                  onMenu={() => setMenuPond(item.pond)}
                  onExpense={() => navigate('/add/expense')}
                  onStartCycle={() => navigate(`/ponds/${item.pond.id}/start-cycle`)}
                />
              ))}
              <AddPondCard onClick={() => navigate('/ponds/new')} />
            </div>
          )}
        </div>
      )}

      <SortSheet open={sortOpen} value={sort} onClose={() => setSortOpen(false)} onChange={setSort} />
      <PondActionSheet
        pond={menuPond}
        onClose={closeMenu}
        onEdit={() => {
          if (!menuPond) return;
          const id = menuPond.id;
          closeMenu();
          navigate(`/ponds/${id}/edit`);
        }}
        onCycle={() => {
          if (!menuPond) return;
          const id = menuPond.id;
          const inactive = menuPond.status !== 'active';
          closeMenu();
          navigate(inactive ? `/ponds/${id}/start-cycle` : `/ponds/${id}/close-cycle`);
        }}
        onExpense={() => {
          closeMenu();
          navigate('/add/expense');
        }}
        onArchive={() => {
          if (!menuPond) return;
          setArchivePondItem(menuPond);
          closeMenu();
        }}
      />
      <ArchivePondSheet
        open={Boolean(archivePondItem)}
        pondName={archivePondItem?.name ?? t('thisPond')}
        onClose={() => setArchivePondItem(null)}
        onConfirm={() => {
          const id = archivePondItem?.id;
          void archivePond(id).then(() => {
            if (id) {
              setItems((current) =>
                current.map((item) =>
                  item.pond.id === id ? { ...item, pond: { ...item.pond, status: 'idle' } } : item,
                ),
              );
              setFilter('idle');
            }
            setArchivePondItem(null);
            showToast(t('pondArchived'), 'success');
          });
        }}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-card px-2.5 py-3 shadow-soft">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 text-title tabular-nums text-ink">{value}</p>
    </div>
  );
}

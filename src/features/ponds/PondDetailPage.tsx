import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, Lock, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntryDetailSheet } from '@/components/ui/EntryDetailSheet';
import { InsightBanner } from '@/components/ui/InsightBanner';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { FeedLogSheet } from '@/features/ponds/FeedLogSheet';
import { PondDetailExpenses } from '@/features/ponds/PondDetailExpenses';
import { PondDetailFeed } from '@/features/ponds/PondDetailFeed';
import { PondDetailHero } from '@/features/ponds/PondDetailHero';
import { PondDetailRevenue } from '@/features/ponds/PondDetailRevenue';
import { CyclePickerSheet, PondDetailMenuSheet } from '@/features/ponds/PondDetailSheets';
import { PondDetailSummary } from '@/features/ponds/PondDetailSummary';
import { ArchivePondSheet } from '@/features/ponds/PondSheets';
import { formatCycleRange } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import { archivePond } from '@/services/ponds';
import { buildPondDetail, loadPondDetail, type PondDetailModel } from '@/services/pondDetail';
import type { DetailTab, FeedLog, LedgerEntry } from '@/types';

export function PondDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { entries: ledgerEntries, sales } = useLedger();
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<PondDetailModel | undefined>();
  const [cycleId, setCycleId] = useState<string>();
  const [hidden, setHidden] = useState(false);
  const [tab, setTab] = useState<DetailTab>(() => {
    const value = params.get('tab');
    if (value === 'feed' || value === 'revenue' || value === 'summary' || value === 'expenses') return value;
    return 'expenses';
  });
  const [extra, setExtra] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cyclesOpen, setCyclesOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [feedLog, setFeedLog] = useState<FeedLog | null>(null);

  useEffect(() => {
    if (!id) return undefined;
    let alive = true;
    setLoading(true);
    loadPondDetail(id, cycleId, ledgerEntries, sales).then((next) => {
      if (!alive) return;
      setModel(next);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [id, cycleId]);

  useEffect(() => {
    if (!id || loading) return;
    const next = buildPondDetail(id, cycleId, ledgerEntries, sales);
    if (next) setModel(next);
  }, [ledgerEntries, sales, id, cycleId, loading]);

  const visible = useMemo(() => {
    if (!model) return [];
    return [...model.entries, ...model.extraEntries.slice(0, extra)];
  }, [model, extra]);

  const goAdd = (path: string) => {
    if (!model) return;
    const recordingSale = path.includes('/add/sale');
    if (model.closed && !recordingSale) {
      showToast('This cycle is closed');
      return;
    }
    const cycle = model.cycle.id && model.cycle.id !== 'none' ? `&cycle=${model.cycle.id}` : '';
    navigate(`${path}?pond=${model.pond.id}${cycle}`);
  };

  if (loading || !model) {
    return (
      <div className="absolute inset-0 bg-bg">
        <PageHeader variant="b" title="Pond" onBack={() => navigate('/ponds')} />
        {loading ? (
          <div className="space-y-4 px-page pt-4">
            <div className="h-10 animate-pulse rounded-pill bg-tile" />
            <div className="h-56 animate-pulse rounded-hero bg-tile" />
            <div className="h-16 animate-pulse rounded-card bg-tile" />
          </div>
        ) : (
          <EmptyState icon={Lock} title="Pond not found" action={<Button onClick={() => navigate('/ponds')}>Back to ponds</Button>} />
        )}
      </div>
    );
  }

  const pill = `Cycle ${model.cycle.number} · ${formatCycleRange(model.cycle.startDate, model.cycle.endDate)}`;

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <PageHeader
        variant="b"
        title={model.pond.name}
        onBack={() => navigate('/ponds')}
        rightIcon={MoreVertical}
        rightAriaLabel="Pond actions"
        onRightClick={() => setMenuOpen(true)}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-page pb-8 pt-3">
        <button
          type="button"
          onClick={() => setCyclesOpen(true)}
          className="pressable flex min-h-touch w-full items-center justify-between rounded-pill bg-card px-4 text-caption font-semibold text-ink shadow-soft"
        >
          <span className="truncate">{pill}</span>
          <ChevronDown size={16} strokeWidth={ICON.stroke} />
        </button>

        {model.closed ? (
          <div className="mt-3">
            <InsightBanner
              icon={Lock}
              title="This cycle is closed"
              caption="You can view numbers, but you cannot add entries."
            />
          </div>
        ) : null}

        <div className="mt-4">
          <PondDetailHero model={model} hidden={hidden} onToggleHidden={() => setHidden((value) => !value)} />
        </div>

        <div className="mt-5">
          <SegmentedTabs
            scrollable
            ariaLabel="Pond sections"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'expenses', label: 'Expenses' },
              { value: 'feed', label: 'Feed' },
              { value: 'revenue', label: 'Revenue' },
              { value: 'summary', label: 'Summary' },
            ]}
          />
        </div>

        <div className="mt-4">
          {tab === 'expenses' ? (
            <PondDetailExpenses
              model={model}
              visible={visible}
              onEntry={setEntry}
              onLoadMore={() => setExtra((count) => count + 10)}
              canLoadMore={extra < model.extraEntries.length}
            />
          ) : null}
          {tab === 'feed' ? (
            <PondDetailFeed model={model} onAdd={() => goAdd('/add/feed')} onOpen={setFeedLog} />
          ) : null}
          {tab === 'revenue' ? <PondDetailRevenue model={model} onAdd={() => goAdd('/add/sale')} /> : null}
          {tab === 'summary' ? <PondDetailSummary model={model} /> : null}
        </div>

        {!model.closed && !model.idle ? (
          <Button
            variant="outline"
            className="mt-8 w-full"
            onClick={() => navigate(`/ponds/${model.pond.id}/close-cycle`)}
          >
            Close cycle
          </Button>
        ) : null}
      </div>

      {model.idle || !model.closed ? (
        <div className="shrink-0 border-t border-line bg-bg px-page pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          {model.idle ? (
            <Button onClick={() => navigate(`/ponds/${model.pond.id}/start-cycle`)}>Start new cycle</Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => goAdd('/add/expense')}>+ Add expense</Button>
              <Button variant="outline" onClick={() => goAdd('/add/feed')}>
                + Add feed
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <PondDetailMenuSheet
        pond={model.pond}
        idle={model.idle}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEdit={() => {
          setMenuOpen(false);
          navigate(`/ponds/${model.pond.id}/edit`);
        }}
        onCycle={() => {
          setMenuOpen(false);
          navigate(model.idle ? `/ponds/${model.pond.id}/start-cycle` : `/ponds/${model.pond.id}/close-cycle`);
        }}
        onHistory={() => {
          setMenuOpen(false);
          setCyclesOpen(true);
        }}
        onArchive={() => {
          setMenuOpen(false);
          setArchiveOpen(true);
        }}
      />
      <CyclePickerSheet
        open={cyclesOpen}
        cycles={model.cycles}
        selectedId={model.cycle.id}
        activeProfit={model.netProfit}
        onClose={() => setCyclesOpen(false)}
        onSelect={(next) => {
          setCycleId(next);
          setExtra(0);
        }}
      />
      <ArchivePondSheet
        open={archiveOpen}
        pondName={model.pond.name}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          void archivePond(model.pond.id).then(() => {
            showToast('Pond archived', 'success');
            navigate('/ponds?filter=idle');
          });
        }}
      />
      <EntryDetailSheet entry={entry} onClose={() => setEntry(null)} />
      <FeedLogSheet log={feedLog} onClose={() => setFeedLog(null)} />
    </div>
  );
}

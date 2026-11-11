import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeroCard } from '@/components/ui/HeroCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUi } from '@/context/UiProvider';
import { ponds } from '@/data/farm';
import {
  HomeBanners,
  HomeChart,
  HomeFilters,
  HomePonds,
  HomeSkeleton,
  HomeTransactions,
  pondFilterLabel,
} from '@/features/home/HomeSections';
import {
  ChartRangeSheet,
  EntryDetailSheet,
  NotificationsSheet,
  PondPickerSheet,
} from '@/features/home/HomeSheets';
import { useLedger } from '@/context/LedgerProvider';
import { useSettings } from '@/context/SettingsProvider';
import { useT } from '@/hooks/useT';
import { formatDate, formatINRCompact, greeting, initials } from '@/lib/format';
import { HOME_SKELETON_MS } from '@/lib/tokens';
import { creditDueReminders } from '@/services/dues';
import { buildHome, type PondFilter } from '@/services/ledger';
import type { HomeAlert, LedgerEntry, PeriodId } from '@/types';

export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const empty = params.get('empty') === '1' || ponds.length === 0;
  const { showToast } = useUi();
  const { entries } = useLedger();
  const { profile, notifications } = useSettings();
  const { t, lang } = useT();

  const [pondId, setPondId] = useState<PondFilter>('all');
  const [period, setPeriod] = useState<PeriodId>('today');
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(!empty);
  const [unread, setUnread] = useState(true);
  const [pondSheet, setPondSheet] = useState(false);
  const [rangeSheet, setRangeSheet] = useState(false);
  const [notesSheet, setNotesSheet] = useState(false);
  const [activeEntry, setActiveEntry] = useState<LedgerEntry | null>(null);

  useEffect(() => {
    if (empty) return undefined;
    const t = window.setTimeout(() => setLoading(false), HOME_SKELETON_MS);
    return () => window.clearTimeout(t);
  }, [empty]);

  const model = useMemo(() => buildHome(pondId, period, entries), [pondId, period, entries]);
  const creditAlerts = useMemo(() => {
    if (!notifications.dues && !notifications.lease) return [];
    return creditDueReminders(entries);
  }, [entries, notifications.dues, notifications.lease]);
  const nextCredit = creditAlerts[0];
  const creditTitle = (item: (typeof creditAlerts)[number]) =>
    item.days < 0
      ? t('creditOverdue', { title: item.title })
      : item.days === 0
        ? t('creditDueToday', { title: item.title })
        : t('creditDueIn', { title: item.title, n: item.days });
  const leaseTitle = nextCredit ? creditTitle(nextCredit) : undefined;
  const leaseCaption = nextCredit ? formatINRCompact(nextCredit.amount) : undefined;
  const alerts: HomeAlert[] = creditAlerts.map((item) => ({
    id: `credit-${item.id}`,
    kind: 'dues',
    title: creditTitle(item),
    time: formatDate(item.date),
  }));

  return (
    <div className="min-h-full bg-bg">
      <PageHeader
        variant="a"
        greeting={greeting()}
        subtitle={t('homeSubtitle')}
        avatarText={initials(profile.ownerName).slice(0, 1) || 'R'}
        onAvatar={() => navigate('/settings')}
        bellDot={unread && alerts.length > 0}
        onSearch={() => showToast(t('searchSoon'))}
        onBell={() => setNotesSheet(true)}
      />

      {empty ? (
        <EmptyState
          icon={Waves}
          title={t('noPonds')}
          description={t('noPondsHint')}
          action={
            <Button onClick={() => navigate('/ponds/new')}>{t('addPondCta')}</Button>
          }
        />
      ) : loading ? (
        <HomeSkeleton />
      ) : (
        <>
          <div className="px-page">
            <HomeFilters
              pondLabel={pondFilterLabel(pondId, lang)}
              period={period}
              onOpenPonds={() => setPondSheet(true)}
              onPeriod={setPeriod}
            />
            <div className="mt-4">
              <HeroCard
                label={t('balance')}
                amount={model.profit}
                changePercent={model.changePercent}
                periodLabel={model.periodLabel}
                spent={model.spent}
                revenue={model.revenue}
                hidden={hidden}
                onToggleHidden={() => setHidden((value) => !value)}
                onChartClick={() => navigate('/reports')}
              />
            </div>
            <HomeChart period={period} data={model.chart} onOpenRange={() => setRangeSheet(true)} />
            <HomeBanners
              duesTotal={model.duesTotal}
              duesCount={model.duesCount}
              onDues={() => navigate('/dues')}
              onLease={() => navigate('/dues')}
              leaseTitle={leaseTitle}
              leaseCaption={leaseCaption}
            />
          </div>
          <HomePonds
            cards={model.pondCards}
            onOpen={(id) => navigate(`/ponds/${id}`)}
            onAdd={() => navigate('/ponds/new')}
            onSeeAll={() => navigate('/ponds')}
          />
          <HomeTransactions
            entries={model.recent}
            onOpen={setActiveEntry}
            onSeeAll={() => navigate('/ledger')}
          />
        </>
      )}

      <NotificationsSheet
        open={notesSheet}
        alerts={alerts}
        onClose={() => setNotesSheet(false)}
        onMarkRead={() => {
          setUnread(false);
          setNotesSheet(false);
        }}
      />
      <PondPickerSheet
        open={pondSheet}
        value={pondId}
        onClose={() => setPondSheet(false)}
        onChange={setPondId}
      />
      <ChartRangeSheet
        open={rangeSheet}
        value={period}
        onClose={() => setRangeSheet(false)}
        onChange={setPeriod}
      />
      <EntryDetailSheet entry={activeEntry} onClose={() => setActiveEntry(null)} />
    </div>
  );
}

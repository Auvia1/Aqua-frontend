import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Search, Sparkles } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useLedger } from '@/context/LedgerProvider';
import { useUi } from '@/context/UiProvider';
import { PartyDueCard } from '@/features/dues/DuesCards';
import { PaymentSheet } from '@/features/dues/PaymentSheet';
import { cn } from '@/lib/cn';
import { useT } from '@/hooks/useT';
import { formatINRCompact } from '@/lib/format';
import { ICON } from '@/lib/tokens';
import { buildPartyDues, matchesDueChip, sortDues, type PartyDue } from '@/services/dues';
import type { DueChip, DueSort, DueTab } from '@/types';

export function DuesPage() {
  const navigate = useNavigate();
  const { showToast } = useUi();
  const { t } = useT();
  const tabs: { value: DueTab; label: string }[] = [
    { value: 'pay', label: t('toPay') },
    { value: 'receive', label: t('toReceive') },
  ];
  const chips: { value: DueChip; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'overdue', label: t('overdue') },
    { value: 'week', label: t('dueThisWeek') },
  ];
  const sorts: { value: DueSort; label: string }[] = [
    { value: 'amount', label: t('amount') },
    { value: 'dueDate', label: t('dueDate') },
    { value: 'name', label: t('name') },
  ];
  const { entries, parties, sales, recordPayment } = useLedger();
  const [tab, setTab] = useState<DueTab>('pay');
  const [chip, setChip] = useState<DueChip>('all');
  const [sort, setSort] = useState<DueSort>('amount');
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [payRow, setPayRow] = useState<PartyDue | null>(null);

  const rows = useMemo(() => {
    const all = buildPartyDues(parties, entries, sales);
    const q = search.trim().toLowerCase();
    const scoped = all.filter((row) => {
      if (row.tab !== tab) return false;
      if (!matchesDueChip(row.pending, chip)) return false;
      if (q && !row.party.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortDues(scoped, sort);
  }, [parties, entries, sales, tab, chip, search, sort]);

  const owe = useMemo(
    () => buildPartyDues(parties, entries, sales).filter((row) => row.tab === 'pay').reduce((s, r) => s + r.amount, 0),
    [parties, entries, sales],
  );
  const receive = useMemo(
    () =>
      buildPartyDues(parties, entries, sales)
        .filter((row) => row.tab === 'receive')
        .reduce((s, r) => s + r.amount, 0),
    [parties, entries, sales],
  );

  return (
    <div className="min-h-full bg-bg pb-4">
      <PageHeader variant="b" title={t('dues')} />

      <div className="space-y-4 px-page pt-4">
        <section className="grid grid-cols-2 rounded-hero bg-forest-800 text-white">
          <div className="p-5">
            <p className="text-caption text-white/70">{t('youOwe')}</p>
            <p className="mt-1 text-title tabular-nums">{formatINRCompact(owe)}</p>
          </div>
          <div className="border-l border-white/10 p-5">
            <p className="text-caption text-white/70">{t('youWillReceive')}</p>
            <p className="mt-1 text-title tabular-nums">{formatINRCompact(receive)}</p>
          </div>
        </section>

        <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} ariaLabel={t('dues')} />

        <label className="flex h-14 items-center rounded-input bg-surface px-4">
          <Search size={18} strokeWidth={ICON.stroke} className="mr-2 text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchParty')}
            className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted"
          />
        </label>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {chips.map((item) => (
            <Chip key={item.value} selected={chip === item.value} onClick={() => setChip(item.value)} className="shrink-0">
              {item.label}
            </Chip>
          ))}
          <IconButton label={t('sort')} onClick={() => setSortOpen(true)}>
            <ArrowUpDown size={ICON.size} strokeWidth={ICON.stroke} />
          </IconButton>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Sparkles} title={t('noDues')} />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <PartyDueCard
                key={row.party.id}
                row={row}
                actionLabel={tab === 'pay' ? t('pay') : t('receive')}
                onOpen={() => navigate(`/dues/${row.party.id}`)}
                onPay={() => setPayRow(row)}
              />
            ))}
          </div>
        )}
      </div>

      <PaymentSheet
        open={Boolean(payRow)}
        title={tab === 'pay' ? t('recordPayment') : t('recordReceipt')}
        outstanding={payRow?.amount ?? 0}
        onClose={() => setPayRow(null)}
        onSave={(input) => {
          if (!payRow) return;
          recordPayment({ partyId: payRow.party.id, ...input });
          showToast(t('paymentRecorded'), 'success');
        }}
      />

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title={t('sort')}>
        <div className="space-y-1 pb-2">
          {sorts.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSort(option.value);
                setSortOpen(false);
              }}
              className={cn(
                'pressable flex h-12 w-full items-center rounded-input px-4 text-body',
                sort === option.value ? 'bg-forest-800 text-white' : 'bg-surface text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

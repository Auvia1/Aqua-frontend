import { ArrowUpRight, Plus, Send, Wheat } from 'lucide-react';
import { SpendBarChart } from '@/components/ui/BarChart';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { DonutChart } from '@/components/ui/DonutChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeroCard } from '@/components/ui/HeroCard';
import { InsightBanner } from '@/components/ui/InsightBanner';
import { MoneyAmount } from '@/components/ui/MoneyAmount';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { QuickActionTile } from '@/components/ui/QuickActionTile';
import { SkeletonHero, SkeletonRows } from '@/components/ui/Skeleton';
import { TransactionList, TransactionRow } from '@/components/ui/TransactionRow';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { CATEGORIES } from '@/data/categories';
import { sampleBars, sampleEntries, sampleSlices } from '@/data/sampleUi';
import { useUi } from '@/context/UiProvider';
import { DevSection } from '@/pages/dev/DevSection';

export function DevVisuals() {
  const { showToast, openQuickAdd } = useUi();

  return (
    <>
      <DevSection title="Page header A">
        <div className="-mx-page rounded-card bg-bg pb-4">
          <PageHeader
            variant="a"
            greeting="Good morning"
            subtitle="Sri Lakshmi Aqua Farm"
            onSearch={() => showToast('Coming soon')}
            onBell={() => showToast('Coming soon')}
          />
        </div>
      </DevSection>

      <DevSection title="Hero">
        <HeroCard
          label="This cycle"
          amount={248300.5}
          changePercent={12.6}
          periodLabel="vs last period"
          hidden={false}
          onToggleHidden={() => showToast('Coming soon')}
          onChartClick={() => showToast('Coming soon')}
        />
        <div className="flex justify-between pt-1">
          <QuickActionTile icon={Plus} label="Add" onClick={openQuickAdd} />
          <QuickActionTile icon={Wheat} label="Feed" onClick={() => showToast('Coming soon')} />
          <QuickActionTile icon={Send} label="Labour" onClick={() => showToast('Coming soon')} />
          <QuickActionTile icon={ArrowUpRight} label="Sale" onClick={() => showToast('Coming soon')} />
        </div>
      </DevSection>

      <DevSection title="Transactions">
        <TransactionList>
          {sampleEntries.map((entry, index) => (
            <TransactionRow
              key={entry.id}
              entry={entry}
              showDivider={index < sampleEntries.length - 1}
              onClick={() => showToast('Coming soon')}
            />
          ))}
        </TransactionList>
        <div className="flex items-baseline justify-between rounded-card bg-card px-4 py-3">
          <span className="text-caption text-muted">Money</span>
          <MoneyAmount amount={18400} signed tone="expense" />
        </div>
      </DevSection>

      <DevSection title="Insight & charts">
        <InsightBanner
          text="You're 12% under last cycle's feed cost. Nice work this month."
          onClick={() => showToast('Coming soon')}
        />
        <div className="rounded-card bg-card p-4">
          <DonutChart data={sampleSlices} total={71800} />
        </div>
        <div className="rounded-card bg-card p-4">
          <p className="mb-2 text-title">Spending trend</p>
          <SpendBarChart data={sampleBars} />
        </div>
        <div className="flex items-center gap-4 rounded-card bg-card p-4">
          <ProgressRing value={42} max={110} label="D42" />
          <p className="text-body text-muted">Pond 1 · Day 42 of 110</p>
        </div>
      </DevSection>

      <DevSection title="Categories">
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="flex flex-col items-center gap-1">
              <CategoryIcon category={category.id} />
              <span className="text-center text-[11px] text-muted">{category.label}</span>
            </div>
          ))}
        </div>
      </DevSection>

      <DevSection title="Empty & loading">
        <div className="rounded-card bg-card">
          <EmptyState
            icon={Wheat}
            title="No feed logs yet"
            description="Add the first bag when you reach the pond."
          />
        </div>
        <SkeletonHero />
        <SkeletonRows count={3} />
      </DevSection>

      <DevSection title="Bottom nav">
        <div className="relative h-24 overflow-hidden rounded-card bg-surface">
          <BottomNav embedded onFabClick={openQuickAdd} />
        </div>
      </DevSection>
    </>
  );
}

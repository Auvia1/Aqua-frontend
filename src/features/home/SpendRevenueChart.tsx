import { useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatINRCompact } from '@/lib/format';
import type { DayPoint } from '@/types';

interface SpendRevenueChartProps {
  data: DayPoint[];
}

interface ChartRow {
  label: string;
  date: string;
  spend: number;
  revenueBar: number;
}

interface BarHit {
  x?: number | string;
  width?: number | string;
  payload?: ChartRow;
}

function niceMax(value: number): number {
  if (value <= 25000) return 30000;
  if (value <= 55000) return 60000;
  if (value <= 95000) return 100000;
  return Math.ceil(value / 20000) * 20000;
}

export function SpendRevenueChart({ data }: SpendRevenueChartProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [anchor, setAnchor] = useState(0);
  const chartData = useMemo<ChartRow[]>(
    () =>
      data.map((point) => ({
        label: point.label,
        date: point.date,
        spend: point.spend,
        revenueBar: point.revenue,
      })),
    [data],
  );
  const peak = Math.max(...chartData.flatMap((point) => [point.spend, point.revenueBar]), 1);
  const domainMax = niceMax(peak);
  const ticks = [0, domainMax / 4, domainMax / 2, (domainMax * 3) / 4, domainMax];
  const selected = active == null ? null : chartData[active];

  const select = (bar: BarHit, side: 'spend' | 'revenue') => {
    const row = bar.payload;
    if (!row) return;
    const index = chartData.findIndex((item) => item.date === row.date);
    const x = Number(bar.x) || 0;
    const width = Number(bar.width) || 12;
    const center = side === 'spend' ? x + width + 2 : x - 2;
    const box = boxRef.current?.clientWidth ?? 320;
    setActive(index);
    setAnchor(Math.min(Math.max(center, 78), box - 78));
  };

  return (
    <div ref={boxRef} className="relative h-44 w-full">
      {selected ? (
        <div
          className="pointer-events-none absolute top-0.5 z-10 -translate-x-1/2 whitespace-nowrap rounded-pill bg-forest-800 px-2.5 py-1 text-[11px] font-semibold leading-4 text-white"
          style={{ left: anchor }}
        >
          <span className="text-white/70">− {formatINRCompact(selected.spend)}</span>
          <span className="mx-1.5 text-white/35">·</span>
          <span className="text-lime-300">+ {formatINRCompact(selected.revenueBar)}</span>
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={4} barCategoryGap="28%" margin={{ top: 28, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E6E3DA" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#7B867F', fontSize: 12 }} />
          <YAxis
            orientation="right"
            axisLine={false}
            tickLine={false}
            width={0}
            domain={[0, domainMax]}
            ticks={ticks}
            tick={false}
          />
          <Bar
            dataKey="spend"
            barSize={10}
            radius={[6, 6, 6, 6]}
            cursor="pointer"
            isAnimationActive={false}
            onClick={(bar) => select(bar as BarHit, 'spend')}
            onMouseEnter={(bar) => select(bar as BarHit, 'spend')}
          >
            {chartData.map((point, index) => (
              <Cell key={point.date} fill={index === active ? '#164232' : '#9CC9A8'} />
            ))}
          </Bar>
          <Bar
            dataKey="revenueBar"
            barSize={10}
            radius={[6, 6, 6, 6]}
            cursor="pointer"
            isAnimationActive={false}
            onClick={(bar) => select(bar as BarHit, 'revenue')}
            onMouseEnter={(bar) => select(bar as BarHit, 'revenue')}
          >
            {chartData.map((point, index) => (
              <Cell key={`${point.date}-rev`} fill={index === active ? '#6FB584' : '#D5EBB5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

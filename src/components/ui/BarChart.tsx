import { useState } from 'react';
import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { formatINR } from '@/lib/format';
import type { BarPoint } from '@/types';

interface SpendBarChartProps {
  data: BarPoint[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
}

export function SpendBarChart({
  data,
  selectedIndex,
  onSelect,
  formatValue = (value) => formatINR(value, { withPaise: false }),
  formatTick = (value) => `${Math.round(value / 1000)}k`,
}: SpendBarChartProps) {
  const [internal, setInternal] = useState(Math.max(data.length - 1, 0));
  const active = selectedIndex ?? internal;
  const selected = data[active];

  return (
    <div className="relative h-44 w-full">
      {selected ? (
        <div className="pointer-events-none absolute left-0 right-10 top-0 z-10 flex justify-center">
          <span className="rounded-pill bg-forest-800 px-2.5 py-1 text-caption font-semibold text-white">
            {formatValue(selected.value)}
          </span>
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBar data={data} barSize={18} margin={{ top: 28, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E6E3DA" strokeDasharray="0" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7B867F', fontSize: 12 }}
          />
          <YAxis
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7B867F', fontSize: 12 }}
            tickFormatter={formatTick}
            width={32}
          />
          <Bar
            dataKey="value"
            radius={[8, 8, 8, 8]}
            cursor="pointer"
            isAnimationActive={false}
            onClick={(_next, index) => {
              setInternal(index);
              onSelect?.(index);
            }}
          >
            {data.map((point, index) => (
              <Cell key={point.label} fill={index === active ? '#164232' : '#C9DFC6'} />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}

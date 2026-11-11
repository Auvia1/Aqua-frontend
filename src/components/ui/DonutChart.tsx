import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatINRCompact } from '@/lib/format';
import type { ChartSlice } from '@/types';

interface DonutChartProps {
  data: ChartSlice[];
  total: number;
  label?: string;
  onSliceClick?: (name: string) => void;
}

export function DonutChart({ data, total, label = 'Total spent', onSliceClick }: DonutChartProps) {
  const sum = data.reduce((acc, slice) => acc + slice.value, 0);

  return (
    <div>
      <div className="relative mx-auto h-52 w-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={3}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
              onClick={(item) => {
                const name = (item as ChartSlice | undefined)?.name;
                if (name) onSliceClick?.(name);
              }}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-title font-bold tabular-nums text-ink">{formatINRCompact(total)}</p>
          <p className="mt-0.5 text-caption text-muted">{label}</p>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((slice) => {
          const percent = sum === 0 ? 0 : Math.round((slice.value / sum) * 100);
          return (
            <li key={slice.name}>
              <button
                type="button"
                onClick={() => onSliceClick?.(slice.name)}
                className="flex w-full items-center gap-2 text-left text-caption text-ink"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="min-w-0 flex-1 truncate text-muted">{slice.name}</span>
                <span className="font-semibold">{percent}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

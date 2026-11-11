import { CartesianGrid, Line, LineChart as RechartsLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatAxis, formatINRCompact } from '@/lib/format';
import type { LinePoint } from '@/services/reports';

export function DualLineChart({ data }: { data: LinePoint[] }) {
  return (
    <div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLine data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E6E3DA" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#7B867F', fontSize: 12 }} />
            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              width={32}
              tick={{ fill: '#7B867F', fontSize: 12 }}
              tickFormatter={formatAxis}
            />
            <Tooltip
              cursor={{ stroke: '#C9DFC6', strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const spend = payload.find((item) => item.dataKey === 'spend')?.value;
                const revenue = payload.find((item) => item.dataKey === 'revenue')?.value;
                return (
                  <div className="rounded-input bg-card px-3 py-2 shadow-soft">
                    <p className="text-caption text-muted">{label}</p>
                    <p className="text-caption text-ink">Spend {formatINRCompact(Number(spend ?? 0))}</p>
                    <p className="text-caption text-leaf-500">Revenue {formatINRCompact(Number(revenue ?? 0))}</p>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="spend" stroke="#164232" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="revenue" stroke="#4E9A6B" strokeWidth={2} dot={false} isAnimationActive={false} />
          </RechartsLine>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-center gap-4">
        <LegendDot color="#164232" label="Cumulative spend" />
        <LegendDot color="#4E9A6B" label="Cumulative revenue" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-caption text-muted">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

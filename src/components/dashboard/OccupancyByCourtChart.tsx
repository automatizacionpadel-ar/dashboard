'use client';
// components/dashboard/OccupancyByCourtChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const MOCK_DATA = [
  { name: 'C1', occupancy: 70 },
  { name: 'C2', occupancy: 95 },
  { name: 'C3', occupancy: 55 },
  { name: 'C4', occupancy: 82 },
];

interface Props {
  data?: { name: string; occupancy: number }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#222] border border-white/10 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-400">Cancha {label}</p>
        <p className="text-sm font-semibold text-green-400">
          {payload[0].value}% ocupación
        </p>
      </div>
    );
  }
  return null;
};

export default function OccupancyByCourtChart({ data = MOCK_DATA }: Props) {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white">Ocupación por Cancha</h3>
        <span className="text-xs text-gray-400">Semana actual</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="occupancy" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.occupancy >= 80 ? '#22c55e' : '#374151'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

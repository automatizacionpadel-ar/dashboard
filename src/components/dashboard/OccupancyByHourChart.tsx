'use client';
// components/dashboard/OccupancyByHourChart.tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MOCK_DATA = [
  { hour: '08:00', occupancy: 20 },
  { hour: '10:00', occupancy: 35 },
  { hour: '12:00', occupancy: 60 },
  { hour: '14:00', occupancy: 45 },
  { hour: '16:00', occupancy: 85 },
  { hour: '18:00', occupancy: 95 },
  { hour: '20:00', occupancy: 78 },
  { hour: '22:00', occupancy: 55 },
  { hour: '00:00', occupancy: 90 },
];

interface Props {
  data?: { hour: string; occupancy: number }[];
  dailyAverage?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#222] border border-white/10 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-green-400">
          {payload[0].value}% ocupación
        </p>
      </div>
    );
  }
  return null;
};

export default function OccupancyByHourChart({
  data = MOCK_DATA,
  dailyAverage = 78,
}: Props) {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white">Ocupación por Hora</h3>
        <span className="text-xs text-gray-400">
          Promedio diario:{' '}
          <span className="text-white font-medium">{dailyAverage}%</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="occupancy"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#greenGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

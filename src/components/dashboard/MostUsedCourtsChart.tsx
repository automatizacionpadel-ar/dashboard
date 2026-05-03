'use client';
// components/dashboard/MostUsedCourtsChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CourtUsage {
  name: string;
  count: number;
}

interface Props {
  data: CourtUsage[];
}

export default function MostUsedCourtsChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="dashboard-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Canchas Más Usadas</h3>
        <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
          Sin datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Canchas Más Usadas</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value: number) => [`${value} reservas`, 'Total']}
          />
          <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

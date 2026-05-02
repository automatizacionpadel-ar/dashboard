// components/dashboard/StatCard.tsx
import { TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    label: string;
    variant: 'green' | 'gray';
  };
  change?: number;
  icon?: ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  badge,
  change,
}: StatCardProps) {
  return (
    <div className="dashboard-card p-5 flex flex-col gap-3">
      <p className="text-sm text-gray-400 font-medium">{title}</p>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-3xl font-bold text-white leading-none">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {change !== undefined && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <TrendingUp size={11} />
              +{change}%
            </span>
          )}
          {badge && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                badge.variant === 'green'
                  ? 'bg-green-400/15 text-green-400'
                  : 'bg-gray-500/15 text-gray-400'
              }`}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

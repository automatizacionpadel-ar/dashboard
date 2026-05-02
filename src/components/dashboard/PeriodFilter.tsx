'use client';
// components/dashboard/PeriodFilter.tsx
import { useState } from 'react';
import clsx from 'clsx';

const periods = ['Hoy', 'Esta Semana', 'Este Mes'] as const;
type Period = (typeof periods)[number];

interface Props {
  onChange?: (period: Period) => void;
}

export default function PeriodFilter({ onChange }: Props) {
  const [active, setActive] = useState<Period>('Hoy');

  const handleClick = (period: Period) => {
    setActive(period);
    onChange?.(period);
  };

  return (
    <div className="flex items-center gap-1 bg-[#1a1a1a] border border-white/5 rounded-lg p-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => handleClick(period)}
          className={clsx(
            'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
            active === period
              ? 'bg-green-500 text-black'
              : 'text-gray-400 hover:text-white'
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );
}

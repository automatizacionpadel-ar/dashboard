'use client';
// components/dashboard/ReservasCalendar.tsx
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReservaCal {
  id: number;
  fecha: string;
  hora: string;
  cliente: string;
  cancha: string;
  estado: string;
}

interface Props {
  reservas: ReservaCal[];
}

function parseFecha(fecha: string): Date {
  const [d, m, y] = fecha.split('/');
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatFecha(fecha: string): string {
  const date = parseFecha(fecha);
  if (isNaN(date.getTime())) return fecha;
  return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d;
}

function getWeekDates(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateKey(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

export default function ReservasCalendar({ reservas }: Props) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const reservasByDateCourt = useMemo(() => {
    const map = new Map<string, ReservaCal>();
    for (const r of reservas) {
      const key = `${r.fecha}|${r.cancha}|${r.hora.substring(0, 5)}`;
      map.set(key, r);
    }
    return map;
  }, [reservas]);

  const canchas = useMemo(() => {
    const set = new Set(reservas.map((r) => r.cancha));
    return Array.from(set).sort();
  }, [reservas]);

  function prevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function nextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Calendario de Reservas</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-400 min-w-[120px] text-center">
            {formatFecha(formatDateKey(weekDates[0]))} – {formatFecha(formatDateKey(weekDates[6]))}
          </span>
          <button
            onClick={nextWeek}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="py-2 px-1 text-gray-500 font-medium w-12" />
              {weekDates.map((date) => (
                <th
                  key={date.toISOString()}
                  className={`py-2 px-1 text-center font-medium ${
                    formatDateKey(date) === formatDateKey(today)
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="text-[10px]">
                    {date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')}
                  </div>
                  <div className="text-xs">{date.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-t border-white/[0.03]">
                <td className="py-2 px-1 text-gray-600 text-[10px] align-top">{hour}</td>
                {weekDates.map((date) => {
                  const dateKey = formatDateKey(date);
                  const reservasEnHora = canchas
                    .map((cancha) => reservasByDateCourt.get(`${dateKey}|${cancha}|${hour}`))
                    .filter(Boolean);

                  return (
                    <td key={dateKey} className="py-1 px-0.5 align-top min-w-[70px]">
                      <div className="flex flex-col gap-0.5">
                        {reservasEnHora.map((r) => (
                          <div
                            key={r!.id}
                            className={`rounded px-1.5 py-0.5 text-[10px] leading-tight truncate cursor-default ${
                              r!.estado === 'Pagado'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}
                            title={`${r!.cliente} - ${r!.cancha}`}
                          >
                            {r!.cancha} {r!.cliente}
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

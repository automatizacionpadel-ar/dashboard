'use client';
// app/admin/AdminPanel.tsx
import { useState, useMemo } from 'react';
import { AdminStats } from '@/lib/types';
import {
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  stats: AdminStats[];
  rubros: string[];
}

export default function AdminPanel({ stats, rubros }: Props) {
  const [rubroFilter, setRubroFilter] = useState<string>('all');
  const [expandedRubros, setExpandedRubros] = useState<Set<string>>(
    new Set(rubros)
  );

  const filtered = useMemo(() => {
    if (rubroFilter === 'all') return stats;
    return stats.filter((s) => s.rubro === rubroFilter);
  }, [stats, rubroFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminStats[]>();
    for (const s of filtered) {
      const key = s.rubro;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [filtered]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, s) => ({
        reservas: acc.reservas + s.total_reservas,
        ingresos: acc.ingresos + s.ingreso_proyectado,
        nuevos: acc.nuevos + s.nuevos_clientes,
        clientes: acc.clientes + s.total_clientes,
      }),
      { reservas: 0, ingresos: 0, nuevos: 0, clientes: 0 }
    );
  }, [filtered]);

  function toggleRubro(rubro: string) {
    setExpandedRubros((prev) => {
      const next = new Set(prev);
      if (next.has(rubro)) next.delete(rubro);
      else next.add(rubro);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
          <p className="text-sm text-gray-400 mt-1">
            Vista general de todos los negocios por rubro
          </p>
        </div>
        <select
          value={rubroFilter}
          onChange={(e) => setRubroFilter(e.target.value)}
          className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-green-500"
        >
          <option value="all">Todos los rubros</option>
          {rubros.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Building2 size={14} />
            Negocios Activos
          </div>
          <div className="text-2xl font-bold text-white">{filtered.length}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Activity size={14} />
            Reservas Hoy
          </div>
          <div className="text-2xl font-bold text-white">{totals.reservas}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <DollarSign size={14} />
            Ingresos Hoy
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${totals.ingresos.toLocaleString('es-AR')}
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Users size={14} />
            Clientes Totales
          </div>
          <div className="text-2xl font-bold text-white">{totals.clientes}</div>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([rubro, negocios]) => (
        <div
          key={rubro}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggleRubro(rubro)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold capitalize">{rubro}</h3>
                <p className="text-xs text-gray-500">
                  {negocios.length} negocio{negocios.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {expandedRubros.has(rubro) ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>

          {expandedRubros.has(rubro) && (
            <div className="px-6 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 text-xs">
                      <th className="text-left py-3 font-medium">Negocio</th>
                      <th className="text-right py-3 font-medium">Reservas Hoy</th>
                      <th className="text-right py-3 font-medium">Ingresos Hoy</th>
                      <th className="text-right py-3 font-medium">Nuevos</th>
                      <th className="text-right py-3 font-medium">Clientes</th>
                      <th className="text-right py-3 font-medium">Ocupación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {negocios.map((n) => (
                      <tr
                        key={n.negocio_id}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3">
                          <span className="text-white font-medium">
                            {n.negocio_nombre}
                          </span>
                        </td>
                        <td className="text-right py-3 text-white">
                          {n.total_reservas}
                        </td>
                        <td className="text-right py-3 text-green-400">
                          ${n.ingreso_proyectado.toLocaleString('es-AR')}
                        </td>
                        <td className="text-right py-3 text-white">
                          {n.nuevos_clientes}
                        </td>
                        <td className="text-right py-3 text-white">
                          {n.total_clientes}
                        </td>
                        <td className="text-right py-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${n.ocupacion_promedio}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-xs w-8 text-right">
                              {n.ocupacion_promedio}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay datos para mostrar
        </div>
      )}
    </div>
  );
}

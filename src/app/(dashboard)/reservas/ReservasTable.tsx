'use client';
// app/(dashboard)/bookings/ReservasTable.tsx
import { useState, useEffect, useMemo } from 'react';
import { Negocio } from '@/lib/types';
import { Search, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReservaRow {
  id: number;
  fecha: string;
  hora: string;
  cliente: string;
  cancha: string;
  monto: number;
  estado: string;
  negocio: string;
  negocio_id: number;
}

interface Props {
  negocios: Negocio[];
  isAdmin: boolean;
  ownerNegocioId?: number;
}

export default function ReservasTable({ negocios, isAdmin, ownerNegocioId }: Props) {
  const [reservas, setReservas] = useState<ReservaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [negocioFilter, setNegocioFilter] = useState(ownerNegocioId ? String(ownerNegocioId) : 'all');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 50;

  useEffect(() => {
    async function fetchReservas() {
      try {
        const params = new URLSearchParams();
        const activeFilter = isAdmin ? negocioFilter : String(ownerNegocioId ?? '');
        if (activeFilter && activeFilter !== 'all') params.set('negocio_id', activeFilter);
        if (dateFilter) params.set('fecha', dateFilter);
        params.set('page', String(page));

        const res = await fetch(`/api/reservas?${params}`);
        if (res.ok) {
          const data = await res.json();
          setReservas(data.reservas);
          setTotal(data.total);
          setHasMore(data.hasMore);
        }
      } catch (err) {
        console.error('Error fetching reservas:', err);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    fetchReservas();
  }, [negocioFilter, dateFilter, page, isAdmin, ownerNegocioId]);

  const filtered = useMemo(() => {
    return reservas.filter((r) => {
      if (search && !r.cliente.toLowerCase().includes(search.toLowerCase())) return false;
      if (estadoFilter !== 'all' && r.estado !== estadoFilter) return false;
      return true;
    });
  }, [reservas, search, estadoFilter]);

  const totalIngresos = useMemo(() => {
    return filtered.reduce((sum, r) => sum + r.monto, 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservas</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filtered.length} reserva{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 w-52"
          />
        </div>
        {isAdmin && (
          <select
            value={negocioFilter}
            onChange={(e) => { setNegocioFilter(e.target.value); setPage(1); }}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          >
            <option value="all">Todos los negocios</option>
            {negocios.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre}
              </option>
            ))}
          </select>
        )}
        <select
          value={estadoFilter}
              onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
          className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-green-500"
        >
          <option value="all">Todos los estados</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
        <div className="relative">
          <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="DD/MM/AAAA"
            className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 w-36"
          />
        </div>
        <div className="ml-auto text-sm text-gray-400">
          Ingresos: <span className="text-green-400 font-semibold">${totalIngresos.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Fecha</th>
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Hora</th>
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Cliente</th>
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Cancha</th>
                <th className="text-right text-xs font-medium text-gray-500 py-4 px-4">Monto</th>
                <th className="text-center text-xs font-medium text-gray-500 py-4 px-4">Estado</th>
                {isAdmin && (
                  <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Negocio</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: isAdmin ? 7 : 6 }).map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-gray-500">
                    No se encontraron reservas
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-white">{r.fecha}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-gray-300">{r.hora}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-white font-medium">{r.cliente}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-gray-300">{r.cancha}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm text-white">${r.monto.toLocaleString('es-AR')}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                          r.estado === 'Pagado'
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-yellow-500/15 text-yellow-400'
                        }`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <span className="text-sm text-gray-400">{r.negocio}</span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500">
            Página {page} de {Math.ceil(total / pageSize)} ({total} resultados)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="p-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

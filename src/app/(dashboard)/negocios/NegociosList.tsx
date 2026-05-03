'use client';
// app/(dashboard)/negocios/NegociosList.tsx
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Negocio } from '@/lib/types';
import { Search, Plus } from 'lucide-react';

interface Props {
  negocios: Negocio[];
  rubros: string[];
}

export default function NegociosList({ negocios, rubros }: Props) {
  const [rubroFilter, setRubroFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return negocios.filter((n) => {
      if (rubroFilter !== 'all' && n.rubro !== rubroFilter) return false;
      if (search && !n.nombre.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [negocios, rubroFilter, search]);

  async function handleToggle(negocioId: number, currentActive: boolean) {
    setToggling(negocioId);
    try {
      await fetch('/api/negocios/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: negocioId, activo: !currentActive }),
      });
    } catch (err) {
      console.error('Error toggling negocio:', err);
    } finally {
      setToggling(null);
    }
  }

  function formatVencimiento(date: string | null): string {
    if (!date) return '—';
    if (date.includes('/')) return date;
    const [y, m, d] = date.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }

  function isVencido(date: string | null): boolean {
    if (!date) return false;
    if (date.includes('/')) {
      const [d, m, y] = date.split('/');
      return new Date(`${y}-${m}-${d}`) < new Date();
    }
    return new Date(date.split('T')[0]) < new Date();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Negocios</h1>
          <p className="text-sm text-gray-400 mt-1">
            {negocios.length} negocio{negocios.length !== 1 ? 's' : ''} registrado{negocios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar negocio..."
              className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 w-52"
            />
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
          <Link
            href="/negocios/nuevo"
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition-colors text-sm"
          >
            <Plus size={16} />
            Nuevo
          </Link>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-6">Negocio</th>
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-6">Rubro</th>
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-6">Vencimiento</th>
                <th className="text-center text-xs font-medium text-gray-500 py-4 px-6">Suspendido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((negocio) => {
                const vencido = isVencido(negocio.vencimiento);
                return (
                  <tr
                    key={negocio.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      !negocio.activo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: negocio.activo ? `${negocio.color_primario}20` : '#333' }}
                        >
                          {negocio.logo_url ? (
                            <img src={negocio.logo_url} alt={negocio.nombre} className="w-full h-full object-cover" />
                          ) : (
                            negocio.logo_emoji
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${negocio.activo ? 'text-white' : 'text-gray-500'}`}>
                            {negocio.nombre}
                          </p>
                          <p className={`text-xs truncate ${negocio.activo ? 'text-gray-500' : 'text-gray-600'}`}>
                            {negocio.descripcion}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-sm capitalize ${negocio.activo ? 'text-gray-300' : 'text-gray-600'}`}>
                        {negocio.rubro}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-sm ${negocio.activo ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatVencimiento(negocio.vencimiento)}
                      </span>
                      {vencido && negocio.activo && (
                        <span className="ml-2 text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                          Vencido
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggle(negocio.id, negocio.activo)}
                        disabled={toggling === negocio.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          negocio.activo
                            ? 'bg-green-500'
                            : 'bg-red-500/60'
                        } ${toggling === negocio.id ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            negocio.activo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron negocios
          </div>
        )}
      </div>
    </div>
  );
}

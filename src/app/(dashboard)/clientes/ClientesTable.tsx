'use client';
// app/(dashboard)/customers/ClientesTable.tsx
import { useState, useEffect, useMemo } from 'react';
import { Negocio } from '@/lib/types';
import { Search, Phone } from 'lucide-react';

interface ClienteRow {
  id: number;
  nombre: string;
  celular: string;
  totalReservas: number;
  negocio: string;
  negocio_id: number;
}

interface Props {
  negocios: Negocio[];
  isAdmin: boolean;
  ownerNegocioId?: number;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
];

export default function ClientesTable({ negocios, isAdmin, ownerNegocioId }: Props) {
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [negocioFilter, setNegocioFilter] = useState(ownerNegocioId ? String(ownerNegocioId) : 'all');

  useEffect(() => {
    async function fetchClientes() {
      try {
        const params = new URLSearchParams();
        const activeFilter = isAdmin ? negocioFilter : String(ownerNegocioId ?? '');
        if (activeFilter && activeFilter !== 'all') params.set('negocio_id', activeFilter);

        const res = await fetch(`/api/clientes?${params}`);
        if (res.ok) {
          const data = await res.json();
          setClientes(data.clientes);
        }
      } catch (err) {
        console.error('Error fetching clientes:', err);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    fetchClientes();
  }, [negocioFilter, isAdmin, ownerNegocioId]);

  const filtered = useMemo(() => {
    return clientes.filter((c) => {
      if (search && !c.nombre.toLowerCase().includes(search.toLowerCase()) && !c.celular.includes(search)) return false;
      return true;
    });
  }, [clientes, search]);

  const totalReservas = useMemo(() => {
    return filtered.reduce((sum, c) => sum + c.totalReservas, 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
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
            onChange={(e) => setNegocioFilter(e.target.value)}
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
        <div className="ml-auto text-sm text-gray-400">
          Total reservas: <span className="text-white font-semibold">{totalReservas}</span>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Cliente</th>
                <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Teléfono</th>
                <th className="text-right text-xs font-medium text-gray-500 py-4 px-4">Reservas</th>
                {isAdmin && (
                  <th className="text-left text-xs font-medium text-gray-500 py-4 px-4">Negocio</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: isAdmin ? 4 : 3 }).map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="text-center py-12 text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            AVATAR_COLORS[i % AVATAR_COLORS.length]
                          } flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {getInitials(c.nombre)}
                        </div>
                        <span className="text-sm text-white font-medium">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Phone size={12} />
                        {c.celular}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`text-sm font-semibold ${c.totalReservas > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {c.totalReservas}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <span className="text-sm text-gray-400">{c.negocio}</span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

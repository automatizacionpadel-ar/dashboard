// lib/baserow.ts
import {
  RawReserva,
  RawCliente,
  RawNegocio,
  RawUsuario,
  Booking,
  Customer,
  CourtOccupancy,
  HourlyOccupancy,
  Negocio,
  Usuario,
  AdminStats,
} from './types';

const BASE_URL = process.env.BASEROW_API_URL ?? 'https://baserow.srv1334062.hstgr.cloud/api';
const TOKEN = process.env.BASEROW_TOKEN!;

const TABLE_IDS = {
  reservas: 560,
  clientes: 874,
  negocios: 876,
  // La tabla usuarios será creada manualmente en Baserow. Actualizar este ID.
  usuarios: 877,
};

// ─── Generic fetcher ─────────────────────────────────────────────────────────

async function fetchTable<T>(
  tableId: number,
  params: Record<string, string> = {}
): Promise<T[]> {
  const qs = new URLSearchParams({ user_field_names: 'true', ...params });
  const url = `${BASE_URL}/database/rows/table/${tableId}/?${qs}`;

  const res = await fetch(url, {
    headers: { Authorization: `Token ${TOKEN}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Baserow error ${res.status} on table ${tableId}: ${body}`);
  }

  const json = await res.json();
  return json.results as T[];
}

async function fetchTableAll<T>(
  tableId: number,
  params: Record<string, string> = {}
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  while (true) {
    const qs = new URLSearchParams({
      user_field_names: 'true',
      size: '200',
      page: String(page),
      ...params,
    });
    const url = `${BASE_URL}/database/rows/table/${tableId}/?${qs}`;
    const res = await fetch(url, {
      headers: { Authorization: `Token ${TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) break;
    const json = await res.json();
    all.push(...json.results);
    if (!json.next) break;
    page++;
  }
  return all;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeStatus(raw: string | null): 'paid' | 'pending' {
  return raw?.toLowerCase() === 'pagado' ? 'paid' : 'pending';
}

function getNombre(raw: { id: number; value: string }[]): string {
  return raw?.[0]?.value ?? 'Sin nombre';
}

function getLinkId(raw: { id: number; value: string }[] | null | undefined): number {
  return raw?.[0]?.id ?? 0;
}

function formatDateBaserow(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function todayBaserow(): string {
  return formatDateBaserow(new Date());
}

function yesterdayBaserow(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateBaserow(d);
}

function calculateChange(today: number, yesterday: number): number {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return Math.round(((today - yesterday) / yesterday) * 100);
}

// ─── Negocios ────────────────────────────────────────────────────────────────

export async function getNegocios(): Promise<Negocio[]> {
  const rows = await fetchTableAll<RawNegocio>(TABLE_IDS.negocios);
  return rows
    .map((r) => ({
      id: r.id,
      nombre: r.nombre,
      rubro: r.rubro,
      slug: r.slug,
      color_primario: r.color_primario,
      color_dark: r.color_dark,
      logo_emoji: r.logo_emoji,
      descripcion: r.descripcion,
      activo: r.activo,
      vencimiento: r.Vencimiento ?? null,
    }));
}

export async function getNegocioById(id: number): Promise<Negocio | null> {
  const negocios = await getNegocios();
  return negocios.find((n) => n.id === id) ?? null;
}

export async function toggleNegocioActivo(
  negocioId: number,
  activo: boolean
): Promise<boolean> {
  const url = `${BASE_URL}/database/rows/table/${TABLE_IDS.negocios}/${negocioId}/?user_field_names=true`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Token ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activo }),
  });
  return res.ok;
}

// ─── Usuarios ────────────────────────────────────────────────────────────────

export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  try {
    const rows = await fetchTable<RawUsuario>(TABLE_IDS.usuarios, {
      filter__Email__equal: email,
      size: '1',
    });
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      email: r.Email,
      password_hash: r.Password,
      rol: r.Rol as 'admin' | 'owner',
      negocio_id: getLinkId(r.Negocio) || null,
      negocio_nombre: r.Negocio?.[0]?.value ?? null,
    };
  } catch {
    return null;
  }
}

// ─── Reservas (con filtro opcional por negocio) ─────────────────────────────

export async function getReservasHoy(negocioId?: number): Promise<RawReserva[]> {
  const all = await fetchTableAll<RawReserva>(TABLE_IDS.reservas);
  const today = todayBaserow();

  return all
    .filter((r) => {
      if (r.Fecha_Reserva !== today) return false;
      if (negocioId && getLinkId(r.Negocio) !== negocioId) return false;
      return true;
    })
    .sort((a, b) => (a.Hora_Reserva ?? '').localeCompare(b.Hora_Reserva ?? ''));
}

export async function getUltimasReservas(limit = 5, negocioId?: number): Promise<Booking[]> {
  const params: Record<string, string> = {
    size: String(limit * 3),
    order_by: '-Fecha_Reserva,-Hora_Reserva',
  };
  if (negocioId) {
    params['filter__Negocio__link_row_has'] = String(negocioId);
  }

  const rows = await fetchTable<RawReserva>(TABLE_IDS.reservas, params);

  return rows
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      customer_name: getNombre(r.Nombre),
      court: `Cancha ${r.Cancha}`,
      time: r.Hora_Reserva ?? '',
      amount: parseInt(r.Monto_Sena ?? '0', 10),
      status: normalizeStatus(r.Estado_Pago),
      date: r.Fecha_Reserva,
      negocio_id: getLinkId(r.Negocio),
    }));
}

// ─── Clientes (con filtro opcional por negocio) ─────────────────────────────

export async function getTopClientes(limit = 5, negocioId?: number): Promise<Customer[]> {
  const params: Record<string, string> = {
    size: String(limit),
    order_by: '-Total_Reservas',
  };
  if (negocioId) {
    params['filter__Negocio__link_row_has'] = String(negocioId);
  }

  const rows = await fetchTable<RawCliente>(TABLE_IDS.clientes, params);

  return rows.map((r) => ({
    id: r.id,
    name: r.Nombre,
    phone: r.Celular,
    total_bookings: parseInt(r.Total_Reservas ?? '0', 10),
    negocio_id: getLinkId(r.Negocio),
  }));
}

// ─── Stats agregados ─────────────────────────────────────────────────────────

export async function getDashboardStats(negocioId?: number) {
  const today = todayBaserow();
  const yesterday = yesterdayBaserow();

  const reservasBaseParams: Record<string, string> = { size: '200' };
  if (negocioId) {
    reservasBaseParams['filter__Negocio__link_row_has'] = String(negocioId);
  }

  const [reservasHoy, reservasAyer, ultimasReservasRaw, topClientes] = await Promise.all([
    fetchTable<RawReserva>(TABLE_IDS.reservas, {
      ...reservasBaseParams,
      filter__Fecha_Reserva__equal: today,
    }),
    fetchTable<RawReserva>(TABLE_IDS.reservas, {
      ...reservasBaseParams,
      filter__Fecha_Reserva__equal: yesterday,
    }),
    fetchTable<RawReserva>(TABLE_IDS.reservas, {
      ...reservasBaseParams,
      size: '5',
      order_by: '-Fecha_Reserva,-Hora_Reserva',
    }),
    getTopClientes(100, negocioId),
  ]);

  const reservasHoySorted = [...reservasHoy].sort((a, b) =>
    (a.Hora_Reserva ?? '').localeCompare(b.Hora_Reserva ?? '')
  );

  const ingresoHoy = reservasHoy.reduce((sum, r) => sum + parseInt(r.Monto_Sena ?? '0', 10), 0);
  const ingresoAyer = reservasAyer.reduce((sum, r) => sum + parseInt(r.Monto_Sena ?? '0', 10), 0);

  const totalReservasHoy = reservasHoy.length;
  const totalReservasAyer = reservasAyer.length;

  const clientesIdsHoy = new Set(reservasHoy.map((r) => r.Nombre?.[0]?.id).filter(Boolean));
  const clientesIdsAyer = new Set(reservasAyer.map((r) => r.Nombre?.[0]?.id).filter(Boolean));

  const nuevosClientesHoy = topClientes.filter(
    (c) => c.total_bookings === 1 && clientesIdsHoy.has(c.id)
  ).length;
  const nuevosClientesAyer = topClientes.filter(
    (c) => c.total_bookings === 1 && clientesIdsAyer.has(c.id)
  ).length;

  const canchaCount: Record<string, number> = {};
  for (const r of reservasHoy) {
    const c = r.Cancha?.trim() || '?';
    canchaCount[c] = (canchaCount[c] ?? 0) + 1;
  }
  const maxPorCancha = Math.max(...Object.values(canchaCount), 1);
  const courtOccupancy: CourtOccupancy[] = Object.entries(canchaCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({
      name: `C${name}`,
      occupancy: Math.round((count / maxPorCancha) * 100),
    }));

  const hourCount: Record<string, number> = {};
  for (const r of reservasHoySorted) {
    const hour = r.Hora_Reserva?.substring(0, 5) || '00:00';
    hourCount[hour] = (hourCount[hour] ?? 0) + 1;
  }
  const maxPorHora = Math.max(...Object.values(hourCount), 1);
  const hourlyOccupancy: HourlyOccupancy[] = Object.entries(hourCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({
      hour,
      occupancy: Math.round((count / maxPorHora) * 100),
    }));

  const ultimasReservas: Booking[] = ultimasReservasRaw.map((r) => ({
    id: r.id,
    customer_name: getNombre(r.Nombre),
    court: `Cancha ${r.Cancha}`,
    time: r.Hora_Reserva ?? '',
    amount: parseInt(r.Monto_Sena ?? '0', 10),
    status: normalizeStatus(r.Estado_Pago),
    date: r.Fecha_Reserva,
    negocio_id: getLinkId(r.Negocio),
  }));

  return {
    totalReservas: totalReservasHoy,
    totalReservasChange: calculateChange(totalReservasHoy, totalReservasAyer),
    ingresoProyectado: ingresoHoy,
    ingresoProyectadoChange: calculateChange(ingresoHoy, ingresoAyer),
    nuevosClientes: nuevosClientesHoy,
    nuevosClientesChange: calculateChange(nuevosClientesHoy, nuevosClientesAyer),
    aiUsage: 92,
    aiUsageChange: 5,
    ultimasReservas,
    topClientes: topClientes.slice(0, 5),
    courtOccupancy,
    hourlyOccupancy,
  };
}

// ─── Admin Stats (todos los negocios) ───────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats[]> {
  const today = todayBaserow();

  const [negocios, allReservas, allClientes] = await Promise.all([
    getNegocios(),
    fetchTableAll<RawReserva>(TABLE_IDS.reservas),
    fetchTableAll<RawCliente>(TABLE_IDS.clientes),
  ]);

  return negocios
    .filter((n) => n.activo)
    .map((negocio) => {
      const reservasNegocio = allReservas.filter(
        (r) => getLinkId(r.Negocio) === negocio.id
      );
      const reservasHoy = reservasNegocio.filter(
        (r) => r.Fecha_Reserva === today
      );
      const clientesNegocio = allClientes.filter(
        (c) => getLinkId(c.Negocio) === negocio.id
      );

      const ingresoProyectado = reservasHoy.reduce(
        (sum, r) => sum + parseInt(r.Monto_Sena ?? '0', 10),
        0
      );

      const nuevosHoy = reservasHoy.filter(
        (r) =>
          clientesNegocio.some(
            (c) => c.id === r.Nombre?.[0]?.id && parseInt(c.Total_Reservas ?? '0') === 1
          )
      ).length;

      const canchasUsadas = new Set(reservasHoy.map((r) => r.Cancha)).size;
      const ocupacionPromedio = canchasUsadas > 0
        ? Math.round((reservasHoy.length / (canchasUsadas * 18)) * 100)
        : 0;

      return {
        negocio_id: negocio.id,
        negocio_nombre: negocio.nombre,
        rubro: negocio.rubro,
        total_reservas: reservasHoy.length,
        ingreso_proyectado: ingresoProyectado,
        nuevos_clientes: nuevosHoy,
        total_clientes: clientesNegocio.length,
        ocupacion_promedio: Math.min(ocupacionPromedio, 100),
      };
    });
}
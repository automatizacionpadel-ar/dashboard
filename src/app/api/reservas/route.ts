// app/api/reservas/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const BASE_URL = process.env.BASEROW_API_URL ?? 'https://baserow.srv1334062.hstgr.cloud/api';
const TOKEN = process.env.BASEROW_TOKEN!;
const TABLE_RESERVAS = 560;

export async function GET(request: Request) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const isAdmin = session.rol === 'admin';
  const { searchParams } = new URL(request.url);
  const negocioId = isAdmin ? searchParams.get('negocio_id') : String(session.negocio_id ?? '');
  const fecha = searchParams.get('fecha');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = 50;

  const params = new URLSearchParams({
    user_field_names: 'true',
    size: String(pageSize),
    page: String(page),
    order_by: '-Fecha_Reserva,-Hora_Reserva',
  });

  if (negocioId && negocioId !== 'all' && negocioId !== 'undefined') {
    params.set('filter__Negocio__link_row_has', negocioId);
  }
  if (fecha) {
    params.set('filter__Fecha_Reserva__equal', fecha);
  }

  try {
    const res = await fetch(
      `${BASE_URL}/database/rows/table/${TABLE_RESERVAS}/?${params}`,
      {
        headers: { Authorization: `Token ${TOKEN}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Error fetching reservas' }, { status: 500 });
    }

    const data = await res.json();

    const reservas = data.results.map((r: Record<string, unknown>) => ({
      id: r.id,
      fecha: r.Fecha_Reserva ?? '',
      hora: r.Hora_Reserva ?? '',
      cliente: (r.Nombre as Array<{ value: string }>)?.[0]?.value ?? 'Sin nombre',
      cancha: `Cancha ${r.Cancha ?? '?'}`,
      monto: parseInt((r.Monto_Sena as string) ?? '0', 10),
      estado: r.Estado_Pago ?? 'Pendiente',
      negocio: (r.Negocio as Array<{ value: string }>)?.[0]?.value ?? 'Sin asignar',
      negocio_id: (r.Negocio as Array<{ id: number }>)?.[0]?.id ?? 0,
    }));

    return NextResponse.json({
      reservas,
      total: data.count,
      page,
      pageSize,
      hasMore: data.next !== null,
    });
  } catch (err) {
    console.error('Error fetching reservas:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

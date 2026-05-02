// app/api/clientes/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const BASE_URL = process.env.BASEROW_API_URL ?? 'https://baserow.srv1334062.hstgr.cloud/api';
const TOKEN = process.env.BASEROW_TOKEN!;
const TABLE_CLIENTES = 874;

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

  const params = new URLSearchParams({
    user_field_names: 'true',
    size: '200',
    order_by: '-Total_Reservas',
  });

  if (negocioId) {
    params.set('filter__Negocio__link_row_has', negocioId);
  }

  try {
    const res = await fetch(
      `${BASE_URL}/database/rows/table/${TABLE_CLIENTES}/?${params}`,
      {
        headers: { Authorization: `Token ${TOKEN}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Error fetching clientes' }, { status: 500 });
    }

    const data = await res.json();

    const clientes = data.results.map((r: Record<string, unknown>) => ({
      id: r.id,
      nombre: r.Nombre ?? '',
      celular: r.Celular ?? '',
      totalReservas: parseInt((r.Total_Reservas as string) ?? '0', 10),
      negocio: (r.Negocio as Array<{ value: string }>)?.[0]?.value ?? 'Sin asignar',
      negocio_id: (r.Negocio as Array<{ id: number }>)?.[0]?.id ?? 0,
    }));

    return NextResponse.json({ clientes });
  } catch (err) {
    console.error('Error fetching clientes:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

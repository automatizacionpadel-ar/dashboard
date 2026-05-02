// app/api/negocios/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const BASE_URL = process.env.BASEROW_API_URL ?? 'https://baserow.srv1334062.hstgr.cloud/api';
const TOKEN = process.env.BASEROW_TOKEN!;
const TABLE_NEGOCIOS = 876;

export async function POST(request: Request) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  if (!session || session.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();
  const { nombre, rubro, descripcion, logo_emoji, color_primario, color_dark, horarios, bienvenida, vencimiento, webhook_url } = body;

  if (!nombre || !rubro) {
    return NextResponse.json({ error: 'Nombre y rubro son requeridos' }, { status: 400 });
  }

  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const payload: Record<string, unknown> = {
    nombre: nombre.trim(),
    rubro: rubro.trim().toLowerCase(),
    slug,
    descripcion: descripcion?.trim() ?? '',
    logo_emoji: logo_emoji?.trim() ?? '🏢',
    color_primario: color_primario?.trim() ?? '#22c55e',
    color_dark: color_dark?.trim() ?? '#16a34a',
    horarios: horarios?.trim() ?? '',
    bienvenida: bienvenida?.trim() ?? '',
    webhook_url: webhook_url?.trim() ?? '',
    activo: true,
  };

  if (vencimiento) {
    payload.Vencimiento = vencimiento;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/database/rows/table/${TABLE_NEGOCIOS}/?user_field_names=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Baserow create error:', err);
      return NextResponse.json({ error: 'Error al crear el negocio en Baserow' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error('Create negocio error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

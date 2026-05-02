// app/api/negocios/toggle/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { toggleNegocioActivo } from '@/lib/baserow';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  if (!session || session.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id, activo } = await request.json();

  if (typeof id !== 'number' || typeof activo !== 'boolean') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const ok = await toggleNegocioActivo(id, activo);

  if (!ok) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

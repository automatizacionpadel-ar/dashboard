// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(sessionCookie.value);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: payload.id,
      email: payload.email,
      rol: payload.rol,
      negocio_nombre: payload.negocio_nombre,
    },
  });
}

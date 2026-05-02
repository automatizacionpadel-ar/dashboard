// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getUsuarioByEmail } from '@/lib/baserow';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const usuario = await getUsuarioByEmail(email);

    if (!usuario) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    if (usuario.password_hash !== password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = await signToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      negocio_id: usuario.negocio_id,
      negocio_nombre: usuario.negocio_nombre,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        negocio_nombre: usuario.negocio_nombre,
      },
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

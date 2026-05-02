// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
);

const PUBLIC_ROUTES = ['/login'];

async function getUserFromToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as {
      id: number;
      email: string;
      rol: 'admin' | 'owner';
      negocio_id: number | null;
      negocio_nombre: string | null;
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = await getUserFromToken(sessionCookie.value);

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/panel') && user.rol !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname === '/' && user.rol === 'admin') {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};

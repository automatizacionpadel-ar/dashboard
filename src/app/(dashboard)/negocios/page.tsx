// app/(dashboard)/negocios/page.tsx
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getNegocios } from '@/lib/baserow';
import { redirect } from 'next/navigation';
import NegociosList from './NegociosList';
import { Negocio } from '@/lib/types';

export default async function NegociosPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  if (!session || session.rol !== 'admin') {
    redirect('/');
  }

  let negocios: Negocio[] = [];

  try {
    negocios = await getNegocios();
  } catch (err) {
    console.error('Error fetching negocios:', err);
  }

  const rubros = [...new Set(negocios.map((n) => n.rubro))].sort();

  return <NegociosList negocios={negocios} rubros={rubros} />;
}

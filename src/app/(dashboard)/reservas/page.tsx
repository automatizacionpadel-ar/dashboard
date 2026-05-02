// app/(dashboard)/bookings/page.tsx
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getNegocios } from '@/lib/baserow';
import { redirect } from 'next/navigation';
import { Negocio } from '@/lib/types';
import ReservasTable from './ReservasTable';

export default async function BookingsPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  if (!session) {
    redirect('/');
  }

  const isAdmin = session.rol === 'admin';
  const ownerNegocioId = isAdmin ? undefined : session.negocio_id ?? undefined;

  let negocios: Negocio[] = [];
  if (isAdmin) {
    try {
      negocios = await getNegocios();
    } catch (err) {
      console.error('Error fetching negocios:', err);
    }
  }

  return (
    <ReservasTable
      negocios={negocios}
      isAdmin={isAdmin}
      ownerNegocioId={ownerNegocioId}
    />
  );
}

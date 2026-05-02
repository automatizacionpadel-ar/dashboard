// app/admin/page.tsx
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAdminStats } from '@/lib/baserow';
import { redirect } from 'next/navigation';
import AdminPanel from './AdminPanel';

import { AdminStats } from '@/lib/types';

export default async function AdminPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  if (!session || session.rol !== 'admin') {
    redirect('/');
  }

  let stats: AdminStats[] = [];
  try {
    stats = await getAdminStats();
  } catch (err) {
    console.error('Error fetching admin stats:', err);
  }

  const rubros = [...new Set(stats.map((s) => s.rubro))].sort();

  return <AdminPanel stats={stats} rubros={rubros} />;
}

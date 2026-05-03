// app/page.tsx
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getDashboardStats, getReservasDashboard } from '@/lib/baserow';
import StatCard from '@/components/dashboard/StatCard';
import OccupancyByHourChart from '@/components/dashboard/OccupancyByHourChart';
import OccupancyByCourtChart from '@/components/dashboard/OccupancyByCourtChart';
import LoyalPlayersTable from '@/components/dashboard/LoyalPlayersTable';
import RecentBookings from '@/components/dashboard/RecentBookings';
import MostUsedCourtsChart from '@/components/dashboard/MostUsedCourtsChart';
import ReservasCalendar from '@/components/dashboard/ReservasCalendar';
import PeriodFilter from '@/components/dashboard/PeriodFilter';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  const negocioId = session?.negocio_id ?? undefined;
  const negocioNombre = session?.negocio_nombre ?? 'Complejo';

  let stats;
  let extraData: { courtUsage: { name: string; count: number }[]; reservas: any[] } = {
    courtUsage: [],
    reservas: [],
  };

  try {
    [stats, extraData] = await Promise.all([
      getDashboardStats(negocioId),
      getReservasDashboard(negocioId),
    ]);
  } catch (err) {
    console.error('Error fetching Baserow data:', err);
    stats = {
      totalReservas: 0,
      totalReservasChange: 0,
      ingresoProyectado: 0,
      ingresoProyectadoChange: 0,
      nuevosClientes: 0,
      nuevosClientesChange: 0,
      aiUsage: 0,
      aiUsageChange: 0,
      ultimasReservas: [],
      topClientes: [],
      courtOccupancy: [],
      hourlyOccupancy: [],
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ¡Hola, {negocioNombre}! 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Aquí tienes el resumen de tu complejo para hoy.
          </p>
        </div>
        <PeriodFilter />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Reservas Totales"
          value={stats.totalReservas}
          change={stats.totalReservasChange}
        />
        <StatCard
          title="Ingresos Proyectados"
          value={`$${stats.ingresoProyectado.toLocaleString('es-AR')}`}
          subtitle="ARS"
          change={stats.ingresoProyectadoChange}
        />
        <StatCard
          title="Nuevos Clientes"
          value={stats.nuevosClientes}
          change={stats.nuevosClientesChange}
        />
        <StatCard
          title="Uso de la IA"
          value={`${stats.aiUsage}%`}
          change={stats.aiUsageChange}
          badge={{ label: 'Óptimo', variant: 'green' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OccupancyByHourChart data={stats.hourlyOccupancy} />
        <MostUsedCourtsChart data={extraData.courtUsage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OccupancyByCourtChart data={stats.courtOccupancy} />
        <ReservasCalendar reservas={extraData.reservas} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LoyalPlayersTable customers={stats.topClientes} />
        <RecentBookings bookings={stats.ultimasReservas} />
      </div>
    </div>
  );
}

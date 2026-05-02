// lib/types.ts

// ─── Baserow raw rows ────────────────────────────────────────────────────────

export interface RawReserva {
  id: number;
  Nombre: { id: number; value: string }[];
  Fecha_Reserva: string;
  Hora_Reserva: string;
  Cancha: string;
  Monto_Sena: string;
  Estado_Pago: string | null;
  Link_Pago: string;
  UUID: string;
  Negocio: { id: number; value: string }[];
}

export interface RawCliente {
  id: number;
  Nombre: string;
  Celular: string;
  Total_Reservas: string;
  Negocio: { id: number; value: string }[];
}

export interface RawNegocio {
  id: number;
  nombre: string;
  rubro: string;
  slug: string;
  color_primario: string;
  color_dark: string;
  logo_emoji: string;
  descripcion: string;
  horarios: string;
  bienvenida: string;
  webhook_url: string;
  activo: boolean;
  Vencimiento: string | null;
}

export interface RawUsuario {
  id: number;
  Email: string;
  Password: string;
  Rol: string;
  Negocio: { id: number; value: string }[];
}

// ─── Normalized shapes for components ───────────────────────────────────────

export interface Booking {
  id: number;
  customer_name: string;
  court: string;
  time: string;
  amount: number;
  status: 'paid' | 'pending';
  date: string;
  negocio_id: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  total_bookings: number;
  negocio_id: number;
}

export interface CourtOccupancy {
  name: string;
  occupancy: number;
}

export interface HourlyOccupancy {
  hour: string;
  occupancy: number;
}

export interface Negocio {
  id: number;
  nombre: string;
  rubro: string;
  slug: string;
  color_primario: string;
  color_dark: string;
  logo_emoji: string;
  descripcion: string;
  activo: boolean;
  vencimiento: string | null;
}

export interface Usuario {
  id: number;
  email: string;
  password_hash: string;
  rol: 'admin' | 'owner';
  negocio_id: number | null;
  negocio_nombre: string | null;
}

export interface AdminStats {
  negocio_id: number;
  negocio_nombre: string;
  rubro: string;
  total_reservas: number;
  ingreso_proyectado: number;
  nuevos_clientes: number;
  total_clientes: number;
  ocupacion_promedio: number;
}
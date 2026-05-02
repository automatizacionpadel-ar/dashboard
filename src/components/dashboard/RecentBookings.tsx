// components/dashboard/RecentBookings.tsx
import { Clock } from 'lucide-react';
import { Booking } from '@/lib/types';

interface Props {
  bookings: Booking[];
}

export default function RecentBookings({ bookings }: Props) {
  return (
    <div className="dashboard-card p-5">
      <h3 className="text-sm font-semibold text-white mb-5">
        Últimas Reservas Confirmadas
      </h3>

      <div className="space-y-1">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
          >
            {/* Clock icon */}
            <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <Clock size={15} className="text-green-400" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {booking.customer_name}
              </p>
              <p className="text-xs text-gray-500">
                {booking.court} • {booking.time}
              </p>
            </div>

            {/* Status + Amount */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm tracking-wide ${
                  booking.status === 'paid'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {booking.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
              </span>
              <span className="text-sm font-semibold text-white">
                ${booking.amount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

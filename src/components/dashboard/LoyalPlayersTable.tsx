// components/dashboard/LoyalPlayersTable.tsx
import { Customer } from '@/lib/types';

interface Props {
  customers: Customer[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
];

export default function LoyalPlayersTable({ customers }: Props) {
  return (
    <div className="dashboard-card p-5">
      <h3 className="text-sm font-semibold text-white mb-5">
        Ranking de Jugadores Fieles
      </h3>

      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs font-medium text-gray-500 pb-3 uppercase tracking-wider">
              Nombre
            </th>
            <th className="text-left text-xs font-medium text-gray-500 pb-3 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="text-right text-xs font-medium text-gray-500 pb-3 uppercase tracking-wider">
              Reservas
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {customers.map((customer, index) => (
            <tr key={customer.id} className="group">
              <td className="py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${
                      AVATAR_COLORS[index % AVATAR_COLORS.length]
                    } flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {getInitials(customer.name)}
                  </div>
                  <span className="text-sm text-gray-200 font-medium">
                    {customer.name}
                  </span>
                </div>
              </td>
              <td className="py-3.5">
                <span className="text-sm text-gray-400">{customer.phone}</span>
              </td>
              <td className="py-3.5 text-right">
                <span className="text-sm font-semibold text-white">
                  {customer.total_bookings}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

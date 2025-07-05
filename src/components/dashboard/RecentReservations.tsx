
import React from 'react';
import { reservations, getCustomerByCpf, getVehicleByPlate, formatDate } from '@/data/mockData';
import StatusBadge from '../common/StatusBadge';
import SectionTitle from '../common/SectionTitle';
import { Button } from '@/components/ui/button';

// Define valid statuses to avoid type errors
type ValidStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'maintenance' | 
  'open' | 'available' | 'rented' | 'scheduled' | 'in_progress' | 'resolved' | 'closed';

const RecentReservations: React.FC = () => {
  // Get only confirmed or pending reservations
  const recentReservations = reservations
    .filter(res => ['confirmed', 'pending'].includes(res.status))
    .slice(0, 4);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <SectionTitle 
        title="Reservas Recentes" 
        action={
          <Button variant="link" className="text-sigac-blue text-sm px-0">
            Ver todas
          </Button>
        }
      />
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentReservations.map((reservation) => {
              const customer = getCustomerByCpf(reservation.customer_cpf);
              const vehicle = getVehicleByPlate(reservation.vehicle_plate);
              
              const startDate = formatDate(reservation.start_date);
              const endDate = formatDate(reservation.end_date);
              
              return (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {customer?.name}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {vehicle?.brand} {vehicle?.model}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {startDate} - {endDate}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={reservation.status as ValidStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentReservations;

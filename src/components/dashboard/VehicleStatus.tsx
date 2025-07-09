
import React from 'react';
import { vehicles } from '@/data/mockData';
import { Car } from 'lucide-react';
import SectionTitle from '../common/SectionTitle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define valid statuses to avoid type errors
type ValidStatus = 'available' | 'rented' | 'maintenance';

const VehicleStatusItem: React.FC<{ brand: string; model: string; plate: string; status: string }> = ({ brand, model, plate, status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'rented':
        return 'text-red-600';
      case 'maintenance':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'rented':
        return 'Alugado';
      case 'maintenance':
        return 'Manutenção';
      default:
        return status;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0">
      <div className={cn(
        'p-2 rounded-full',
        status === 'available' ? 'bg-green-100' : 
        status === 'rented' ? 'bg-red-100' : 'bg-yellow-100'
      )}>
        <Car size={24} className={cn(
          status === 'available' ? 'text-green-600' : 
          status === 'rented' ? 'text-red-600' : 'text-yellow-600'
        )} />
      </div>

      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{brand} {model}</h4>
        <p className="text-sm text-gray-500">{plate}</p>
      </div>

      <div className={cn('font-medium', getStatusStyle())}>
        {getStatusText()}
      </div>
    </div>
  );
};

const VehicleStatus: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <SectionTitle 
        title="Status dos Veículos" 
        action={
          <Button variant="link" className="text-sigac-blue text-sm px-0">
            Ver todos
          </Button>
        }
      />

      <div className="space-y-0 -mx-4">
        {vehicles.map((vehicle) => (
          <VehicleStatusItem
            key={vehicle.plate}
            brand={vehicle.brand}
            model={vehicle.model}
            plate={vehicle.plate}
            status={vehicle.status as ValidStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default VehicleStatus;

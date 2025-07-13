import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export type VehicleReport = {
  totalVehicles: number;
  availableVehicles: number;
  inUseVehicles: number;
  inMaintenanceVehicles: number;
  statusPercentages: Record<string, number>;
  latestMaintenances: Array<{
    id: number;
    scheduledDate: string;
    performedDate: string;
    description: string;
    type: string;
    status: string;
    cost: string;
    employeeUserCpf: string;
    employeeName: string;
    vehiclePlate: string;
    vehicleModel: string;
    vehicleBrand: string;
  }>;
};

export const useVehicleReport = () => {
  return useQuery({
    queryKey: ['vehicleReport'],
    queryFn: async () => {
      const response = await api.get('/api/vehicles/report');
      return response.data.data as VehicleReport;
    },
  });
};

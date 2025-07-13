import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export type ReservationReport = {
  totalReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  latestReservations: Array<{
    id: number;
    startDate: string;
    endDate: string;
    reservationDate: string;
    status: string;
    promotionCode: number;
    clientUserCpf: string;
    clientName: string;
    employeeUserCpf: string;
    employeeName: string;
    vehiclePlate: string;
    vehicleModel: string;
    vehicleBrand: string;
    amount: number;
  }>;
  statusPercentages: Record<string, number>;
};

export const useReservationReport = () => {
  return useQuery({
    queryKey: ['reservationReport'],
    queryFn: async () => {
      const response = await api.get('/api/reservations/report');
      return response.data.data as ReservationReport;
    },
  });
};

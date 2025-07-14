import { Maintenance, Vehicle, Reservation } from "@/types";
import { api } from "@/services/api";

export interface DashboardSummaryDTO {
    totalVeiculos: number;
    totalClientes: number;
    totalReservas: number;
    receitaBruta: number;
    reservasRecentes: Reservation[];
    veiculosRecentes: Vehicle[];
    manutencoesRecentes: Maintenance[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryDTO> {
    try {
        const response = await api.get<DashboardSummaryDTO>('/api/dashboard/summary');
        return response.data as DashboardSummaryDTO;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao carregar dados do dashboard');
    }
}

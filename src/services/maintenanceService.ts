import { api } from './api';
import {MaintenanceRecord, ApiResponse, MaintenancePage} from '@/types';
import {MaintenanceForm} from "@/pages/Maintenance.tsx";

export interface MaintenanceApiItem {
    id: number | string;
    vehiclePlate: string;
    type?: string;
    description?: string;
    scheduledDate: string;
    performedDate?: string;
    cost?: string | number;
    status: string;
    employeeUserCpf?: string;
}

const toDateTimeString = (dateLike: string) => {
    return `${dateLike}T08:00:00`;
};

const mapToBackendPayload = (d: MaintenanceForm) => ({
    vehiclePlate: d.vehiclePlate,
    description: d.description,
    scheduledDate: toDateTimeString(d.scheduledDate),
    performedDate: d.completedDate ? toDateTimeString(d.completedDate) : null,
    cost: d.cost !== undefined ? d.cost.toFixed(2) : undefined,
    type: d.type === 'preventive' ? 'PREVENTIVA' : 'CORRETIVA',
    status:
        d.status === 'scheduled'
            ? 'AGENDADA'
            : d.status === 'in_progress'
                ? 'EM_ANDAMENTO'
                : d.status === 'completed'
                    ? 'CONCLUIDA'
                    : 'CANCELADA',
    employeeUserCpf: d.employeeUserCpf || '',
});

export class MaintenanceService {

    /**
     * Get all maintenance records (optionally paginated)
     */
    static async getMaintenances(page = 0, size = 100): Promise<ApiResponse<MaintenancePage>> {
        const response = await api.get(`/api/maintenances?page=${page}&size=${size}`);
        return response.data as ApiResponse<MaintenancePage>;
    }

    static async createMaintenance(data: MaintenanceForm): Promise<MaintenanceRecord> {
        const backendPayload = mapToBackendPayload(data);
        const response = await api.post('/api/maintenances', backendPayload);
        return response.data as MaintenanceRecord;
    }

    static async updateMaintenance(id: string, data: MaintenanceForm): Promise<MaintenanceRecord> {
        const backendPayload = mapToBackendPayload(data);
        const response = await api.put(`/api/maintenances/${id}`, backendPayload);
        return response.data as MaintenanceRecord;
    }

    /**
     * Delete maintenance record by ID
     */
    static async deleteMaintenance(id: string): Promise<void> {
        await api.delete(`/api/maintenances/${id}`);
    }


    /**
     * Update the status of a maintenance record
     */
    static async updateMaintenanceStatus(
        id: string,
        status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA',
        cost?: number
    ): Promise<MaintenanceRecord> {
        const body = { status };
        if (cost !== undefined) {
            Object.assign(body, { cost });
        }
        const response = await api.patch(`/api/maintenances/${id}/status`, body);
        return response.data as MaintenanceRecord;
    }
}
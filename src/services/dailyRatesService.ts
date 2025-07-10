/**
 * DailyRates Service
 * API methods for managing daily rates using Spring WebFlux backend
 */

import { api } from './api';
import {ApiResponse, DailyRate} from '@/types';

export interface CreateDailyRateRequest {
    plate: string;
    value: number;
}

interface DailyRatesApiResponse {
    data: {
        content: DailyRate[];
    };
}

export class DailyRatesService {
    /**
     * Get all daily rates (optionally paginated)
     */
    static async getDailyRates(page = 0, size = 100): Promise<ApiResponse<DailyRate[]>> {
        const response = await api.get(`/api/dailyrates?page=${page}&size=${size}`);
        const data = response.data as { data: { content: DailyRate[] } };
        return {
            message: "", timestamp: "",
            ...data,
            data: data.data.content
        };
    }

    /**
     * Get all daily rates for a specific vehicle
     */
    static async getDailyRatesByVehiclePlate(plate: string): Promise<ApiResponse<DailyRate[]>> {
        const response = await api.get(`/api/dailyrates/vehicle/${plate}`);
        return response.data as ApiResponse<DailyRate[]>;
    }

    /**
     * Get the most recent daily rate for a specific vehicle
     */
    static async getCurrentDailyRateByVehicle(plate: string): Promise<ApiResponse<DailyRate>> {
        const response = await api.get(`/api/dailyrates/vehicle/${plate}/current`);
        return response.data as ApiResponse<DailyRate>;
    }

    /**
     * Create a new daily rate
     */
    static async createDailyRate(data: {
        vehiclePlate: string;
        dateTime: string;
        amount: number
    }): Promise<ApiResponse<DailyRate>> {
        const response = await api.post(`/api/dailyrates`, data);
        return response.data as ApiResponse<DailyRate>;
    }

    /**
     * Delete a daily rate by ID
     */
    static async deleteDailyRate(id: number): Promise<ApiResponse<void>> {
        const response = await api.delete(`/api/dailyrates/${id}`);
        return response.data as ApiResponse<void>;
    }
}

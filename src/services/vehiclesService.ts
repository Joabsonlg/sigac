/**
 * Vehicles Service
 * API methods for vehicle management using Spring WebFlux backend
 */

import { api } from './api';
import {ApiResponse, Vehicle, VehiclePage} from '@/types';

export interface CreateVehicleRequest {
  model: string;
  brand: string;
  year: number;
  plate: string;
  status: VehicleStatus;
  imageUrl?: string;
  dailyRate: number;
}

export enum VehicleStatus {
  DISPONIVEL = 'DISPONIVEL',
  ALUGADO = 'ALUGADO',
  MANUTENCAO = 'MANUTENCAO',
  INDISPONIVEL = 'INDISPONIVEL'
}

export type UpdateVehicleRequest = Partial<CreateVehicleRequest>

export class VehiclesService {
  /**
   * Get all vehicles (optionally paginated)
   */
  static async getVehicles(page = 0, size = 100): Promise<ApiResponse<VehiclePage>> {
    const response = await api.get(`/api/vehicles?page=${page}&size=${size}`);
    return response.data as ApiResponse<VehiclePage>;
  }

  /**
   * Get vehicle by license plate
   */
  static async getVehicleByPlate(plate: string): Promise<Vehicle> {
    const response = await api.get(`/api/vehicles/${plate}`);
    const data = response.data;

    if (typeof data === 'object' && data !== null && 'plate' in data) {
      return data as Vehicle;
    }

    throw new Error('Resposta da API não contém um veículo válido');
  }

  /**
   * Create new vehicle
   */
  static async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/api/vehicles', data);
    return response.data as Vehicle;
  }

  /**
   * Update existing vehicle by plate
   */
  static async updateVehicle(plate: string, data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await api.put(`/api/vehicles/${plate}`, data);
    return response.data as Vehicle;
  }


  /**
   * Delete vehicle by plate
   */
  static async deleteVehicle(plate: string): Promise<void> {
    await api.delete(`/api/vehicles/${plate}`);
  }

  /**
   * Check if vehicle exists by plate
   */
  static async vehicleExists(plate: string): Promise<boolean> {
    const response = await api.get(`/api/vehicles/${plate}/exists`);
    const data = response.data;

    if (typeof data === 'boolean') {
      return data;
    }

    throw new Error('Resposta inválida para verificação de existência');
  }
}

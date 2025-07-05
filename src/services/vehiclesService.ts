/**
 * Vehicles Service
 * API methods for vehicle management
 */

import { api } from './api';
import { Vehicle } from '@/types';

export interface CreateVehicleRequest {
  model: string;
  brand: string;
  year: number;
  license_plate: string;
  status: 'available' | 'rented' | 'maintenance';
  image_url?: string;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  id: string;
}

export interface VehiclesListResponse {
  data: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class VehiclesService {
  /**
   * Get paginated list of vehicles
   */
  static async getVehicles(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<VehiclesListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await api.get<VehiclesListResponse>(`/vehicles?${params}`);
    return response.data;
  }

  /**
   * Get vehicle by ID
   */
  static async getVehicleById(id: string): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  }

  /**
   * Get vehicle by license plate
   */
  static async getVehicleByPlate(plate: string): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`/vehicles/plate/${plate}`);
    return response.data;
  }

  /**
   * Create new vehicle
   */
  static async createVehicle(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/vehicles', vehicleData);
    return response.data;
  }

  /**
   * Update vehicle
   */
  static async updateVehicle(id: string, vehicleData: Partial<UpdateVehicleRequest>): Promise<Vehicle> {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, vehicleData);
    return response.data;
  }

  /**
   * Delete vehicle
   */
  static async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  }

  /**
   * Update vehicle status
   */
  static async updateVehicleStatus(id: string, status: 'available' | 'rented' | 'maintenance'): Promise<Vehicle> {
    const response = await api.patch<Vehicle>(`/vehicles/${id}/status`, { status });
    return response.data;
  }

  /**
   * Get available vehicles for date range
   */
  static async getAvailableVehicles(startDate: string, endDate: string): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>(`/vehicles/available`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  /**
   * Upload vehicle image
   */
  static async uploadVehicleImage(vehicleId: string, imageFile: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post<{ imageUrl: string }>(`/vehicles/${vehicleId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  /**
   * Get vehicle statistics
   */
  static async getVehicleStats(): Promise<{
    total: number;
    available: number;
    rented: number;
    maintenance: number;
  }> {
    const response = await api.get<{
      total: number;
      available: number;
      rented: number;
      maintenance: number;
    }>('/vehicles/stats');
    return response.data;
  }
}

export default VehiclesService;

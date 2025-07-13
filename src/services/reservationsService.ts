/**
 * Reservations Service
 * API methods for reservation management following FRONTEND_GUIDE_RESERVATIONS.md
 */

import { api } from './api';

export interface CreateReservationRequest {
  startDate: string;
  endDate: string;
  clientUserCpf: string;
  employeeUserCpf: string;
  vehiclePlate: string;
  promotionCode?: number;
}

export interface UpdateReservationRequest {
  startDate?: string;
  endDate?: string;
  status?: ReservationStatus;
  promotionCode?: number;
  employeeUserCpf?: string;
  vehiclePlate?: string;
}

export type ReservationStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ReservationResponse {
  id: number;
  startDate: string;
  endDate: string;
  reservationDate: string;
  status: ReservationStatus;
  promotionCode?: number;
  clientUserCpf: string;
  clientName: string;
  employeeUserCpf: string;
  employeeName: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleBrand: string;
}

export class ReservationsService {
  /**
   * Calcula o valor da reserva
   */
  static async calculateAmount({ startDate, endDate, vehiclePlate, promotionCode }: {
    startDate: string;
    endDate: string;
    vehiclePlate: string;
    promotionCode?: number;
  }): Promise<number> {
    const response = await api.post('/api/reservations/calculate-amount', {
      startDate,
      endDate,
      vehiclePlate,
      promotionCode: promotionCode ?? null
    });
    const data = response.data.data
    return typeof data === 'number' ? data : 0;
  }
  
  /**
   * Get paginated list of reservations
   */
  static async getReservations(
    page: number = 0, 
    size: number = 20, 
    status?: ReservationStatus,
    query?: string
  ): Promise<any> {
    let url = `/api/reservations?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get all reservations without pagination
   */
  static async getAllReservations(): Promise<any> {
    const response = await api.get('/api/reservations');
    return response.data;
  }

  /**
   * Get reservation by ID
   */
  static async getReservationById(id: number): Promise<any> {
    const response = await api.get(`/api/reservations/${id}`);
    return response.data;
  }

  /**
   * Create new reservation
   */
  static async createReservation(reservationData: CreateReservationRequest): Promise<any> {
    const response = await api.post('/api/reservations', reservationData);
    return response.data;
  }

  /**
   * Update reservation data
   */
  static async updateReservation(id: number, reservationData: UpdateReservationRequest): Promise<any> {
    const response = await api.put(`/api/reservations/${id}`, reservationData);
    return response.data;
  }

  /**
   * Update reservation status
   */
  static async updateReservationStatus(id: number, status: ReservationStatus): Promise<any> {
    const response = await api.patch(`/api/reservations/${id}/status?status=${status}`);
    return response.data;
  }

  /**
   * Delete reservation
   */
  static async deleteReservation(id: number): Promise<any> {
    const response = await api.delete(`/api/reservations/${id}`);
    return response.data;
  }

  /**
   * Get reservations by client CPF
   */
  static async getReservationsByClient(cpf: string): Promise<any> {
    const response = await api.get(`/api/reservations/client/${cpf}`);
    return response.data;
  }

  /**
   * Get reservations by vehicle plate
   */
  static async getReservationsByVehicle(plate: string): Promise<any> {
    const response = await api.get(`/api/reservations/vehicle/${plate}`);
    return response.data;
  }

  /**
   * Get reservations by status
   */
  static async getReservationsByStatus(status: ReservationStatus): Promise<any> {
    const response = await api.get(`/api/reservations/status/${status}`);
    return response.data;
  }

  /**
   * Get status display text
   */
  static getStatusText(status: ReservationStatus): string {
    const statusMap = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmada',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Finalizada',
      'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status: ReservationStatus): string {
    const colorMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Check if status can be updated
   */
  static canUpdateStatus(currentStatus: ReservationStatus, newStatus: ReservationStatus): boolean {
    const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}

export default ReservationsService;

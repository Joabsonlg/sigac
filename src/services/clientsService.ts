/**
 * Clients Service
 * API methods for client management following FRONTEND_GUIDE_CLIENTS.md
 */

import { Customer } from '@/types';
import { api } from './api';

export interface CreateClientRequest {
  cpf: string;
  email: string;
  name: string;
  password: string;
  address: string;
  phone: string;
}

export interface UpdateClientRequest {
  email: string;
  name: string;
  address: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class ClientsService {
  
  /**
   * Get paginated list of clients
   */
  static async getClients(page: number = 0, size: number = 10): Promise<any> {
    const response = await api.get(`/api/clients?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Get all clients without pagination
   */
  static async getAllClients(): Promise<any> {
    const response = await api.get('/api/clients');
    return response.data;
  }

  /**
   * Get client by CPF
   */
  static async getClientByCpf(cpf: string): Promise<any> {
    const response = await api.get(`/api/clients/${cpf}`);
    return response.data;
  }

  /**
   * Get client by email
   */
  static async getClientByEmail(email: string): Promise<any> {
    const response = await api.get(`/api/clients/email/${email}`);
    return response.data;
  }

  /**
   * Create new client
   */
  static async createClient(clientData: CreateClientRequest): Promise<any> {
    const response = await api.post('/api/clients', clientData);
    return response.data;
  }

  /**
   * Convert existing user to client
   */
  static async convertUserToClient(cpf: string): Promise<any> {
    const response = await api.post(`/api/clients/${cpf}/convert`);
    return response.data;
  }

  /**
   * Update client data
   */
  static async updateClient(cpf: string, clientData: UpdateClientRequest): Promise<any> {
    const response = await api.put(`/api/clients/${cpf}`, clientData);
    return response.data;
  }

  /**
   * Change client password
   */
  static async changeClientPassword(cpf: string, passwordData: ChangePasswordRequest): Promise<any> {
    const response = await api.patch(`/api/clients/${cpf}/password`, passwordData);
    return response.data;
  }

  /**
   * Delete client
   */
  static async deleteClient(cpf: string): Promise<any> {
    const response = await api.delete(`/api/clients/${cpf}`);
    return response.data;
  }

  /**
   * Check if client exists by CPF
   */
  static async clientExists(cpf: string): Promise<any> {
    const response = await api.get(`/api/clients/${cpf}/exists`);
    return response.data;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<any> {
    const response = await api.get(`/api/clients/email/${email}/exists`);
    return response.data;
  }
}

export default ClientsService;

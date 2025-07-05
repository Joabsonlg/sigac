/**
 * Users Service
 * API methods for user and employee management following FRONTEND_GUIDE_USERS_EMPLOYEES.md
 */

import { User, Employee, ApiResponse, PaginatedResponse } from '@/types';
import { api } from './api';

export interface CreateEmployeeRequest {
  cpf: string;
  email: string;
  name: string;
  password: string;
  address: string;
  phone: string;
  role: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class UsersService {
  // ===== USER METHODS =====
  
  /**
   * Get paginated list of users
   */
  static async getUsers(page: number = 0, size: number = 10): Promise<any> {
    const response = await api.get(`/api/users?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Get user by CPF
   */
  static async getUserByCpf(cpf: string): Promise<any> {
    const response = await api.get(`/api/users/${cpf}`);
    return response.data;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<any> {
    const response = await api.get(`/api/users/email/${email}`);
    return response.data;
  }

  /**
   * Check if user exists by CPF
   */
  static async userExists(cpf: string): Promise<any> {
    const response = await api.get(`/api/users/${cpf}/exists`);
    return response.data;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<any> {
    const response = await api.get(`/api/users/email/${email}/exists`);
    return response.data;
  }

  /**
   * Change user password
   */
  static async changeUserPassword(cpf: string, passwordData: ChangePasswordRequest): Promise<any> {
    const response = await api.patch(`/api/users/${cpf}/password`, passwordData);
    return response.data;
  }

  /**
   * Delete user
   */
  static async deleteUser(cpf: string): Promise<any> {
    const response = await api.delete(`/api/users/${cpf}`);
    return response.data;
  }

  // ===== EMPLOYEE METHODS =====
  
  /**
   * Get paginated list of employees
   */
  static async getEmployees(page: number = 0, size: number = 10): Promise<any> {
    const response = await api.get(`/api/users/employees?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Get employee by CPF
   */
  static async getEmployeeByCpf(cpf: string): Promise<any> {
    const response = await api.get(`/api/users/employees/${cpf}`);
    return response.data;
  }

  /**
   * Get employees by role
   */
  static async getEmployeesByRole(role: string, page: number = 0, size: number = 10): Promise<any> {
    const response = await api.get(`/api/users/employees/role/${role}?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Create new employee
   */
  static async createEmployee(employeeData: CreateEmployeeRequest): Promise<any> {
    const response = await api.post('/api/users/employees', employeeData);
    return response.data;
  }

  /**
   * Check if user is employee
   */
  static async isEmployee(cpf: string): Promise<any> {
    const response = await api.get(`/api/users/employees/${cpf}/exists`);
    return response.data;
  }
}

export default UsersService;

/**
 * Custom hooks for Users and Employees API integration
 * Following the FRONTEND_GUIDE_USERS_EMPLOYEES.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Employee } from '@/types';
import { api } from '@/services/api';

// ===== USER HOOKS =====

/**
 * Get all users with pagination
 */
export const useUsers = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: ['users', page, size],
    queryFn: async () => {
      const response = await api.get(`/api/users?page=${page}&size=${size}`);
      return response.data;
    },
  });
};

/**
 * Get user by CPF
 */
export const useUserByCpf = (cpf: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', 'cpf', cpf],
    queryFn: async () => {
      const response = await api.get(`/api/users/${cpf}`);
      return response.data;
    },
    enabled: enabled && !!cpf,
  });
};

/**
 * Get user by email
 */
export const useUserByEmail = (email: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', 'email', email],
    queryFn: async () => {
      const response = await api.get(`/api/users/email/${email}`);
      return response.data;
    },
    enabled: enabled && !!email,
  });
};

/**
 * Check if user exists by CPF
 */
export const useUserExistsByCpf = (cpf: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', 'exists', 'cpf', cpf],
    queryFn: async () => {
      const response = await api.get(`/api/users/${cpf}/exists`);
      return response.data;
    },
    enabled: enabled && !!cpf,
  });
};

/**
 * Check if user exists by email
 */
export const useUserExistsByEmail = (email: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', 'exists', 'email', email],
    queryFn: async () => {
      const response = await api.get(`/api/users/email/${email}/exists`);
      return response.data;
    },
    enabled: enabled && !!email,
  });
};

/**
 * Update user password
 */
export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cpf, password }: { cpf: string; password: string }) => {
      const response = await api.put(`/api/users/${cpf}/password`, { password });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Delete user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cpf: string) => {
      const response = await api.delete(`/api/users/${cpf}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// ===== EMPLOYEE HOOKS =====

/**
 * Get all employees with pagination
 */
export const useEmployees = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: ['employees', page, size],
    queryFn: async () => {
      const response = await api.get(`/api/users/employees?page=${page}&size=${size}`);
      return response.data;
    },
  });
};

/**
 * Get employee by CPF
 */
export const useEmployeeByCpf = (cpf: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['employee', 'cpf', cpf],
    queryFn: async () => {
      const response = await api.get(`/api/users/employees/${cpf}`);
      return response.data;
    },
    enabled: enabled && !!cpf,
  });
};

/**
 * Get employees by role with pagination
 */
export const useEmployeesByRole = (role: string, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: ['employees', 'role', role, page, size],
    queryFn: async () => {
      const response = await api.get(`/api/users/employees/role/${role}?page=${page}&size=${size}`);
      return response.data;
    },
    enabled: !!role,
  });
};

/**
 * Check if employee exists by CPF
 */
export const useEmployeeExistsByCpf = (cpf: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['employee', 'exists', 'cpf', cpf],
    queryFn: async () => {
      const response = await api.get(`/api/users/employees/${cpf}/exists`);
      return response.data;
    },
    enabled: enabled && !!cpf,
  });
};

/**
 * Create employee - takes a User and adds employee role
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await api.post('/api/users/employees', employee);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Convert user to employee with specific role
 */
export const useConvertUserToEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cpf, role }: { cpf: string; role: string }) => {
      const response = await api.put(`/api/users/employees/${cpf}/convert?role=${role}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Change employee role
 */
export const useChangeEmployeeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cpf, role }: { cpf: string; role: string }) => {
      const response = await api.put(`/api/users/employees/${cpf}/role?role=${role}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Remove employee role (convert back to regular user)
 */
export const useRemoveEmployeeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cpf: string) => {
      const response = await api.delete(`/api/users/employees/${cpf}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Delete employee (removes both employee role and user account)
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cpf: string) => {
      const response = await api.delete(`/api/users/employees/${cpf}/with-user`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Authentication Service - 100% Cookie Based
 * Handles login, logout, registration and authentication state using SIGAC API v2.0.0
 */

import { api } from './api';
import { User } from '@/types';

export interface LoginCredentials {
  cpf: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  password: string;
  phone: string;
}

export interface ApiResponse<T> {
  timestamp: string;
  message: string;
  data: T;
}

// Updated interface for cookie-based auth response
export interface CookieAuthData {
  message: string;
  user: {
    cpf: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CookieAuthResponse extends ApiResponse<CookieAuthData> {}

export interface PasswordResetRequest {
  email?: string;
  cpf?: string;
}

export class AuthService {
  /**
   * Login user with CPF and password - 100% Cookie Based
   * No manual token storage needed, all handled via cookies
   */
  static async login(credentials: LoginCredentials): Promise<CookieAuthData> {
    try {
      const response = await api.post('/auth/login', credentials);
      const responseData = response.data as CookieAuthResponse;
      
      // 🎉 No need to store tokens! Everything is handled via cookies automatically
      // The server sets sigac_access_token and sigac_refresh_token cookies
      
      return responseData.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<void> {
    try {
      await api.post('/api/clients/register', userData);
      // Registration doesn't automatically log in, user needs to login after
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar usuário';
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user - 100% Cookie Based
   * Server automatically clears cookies
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint - cookies are automatically sent and cleared by server
      await api.post('/auth/logout');
      // 🎉 Cookies are automatically cleared by the server!
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, try to clear any client state if needed
    }
  }

  /**
   * Request password reset by email
   */
  static async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      await api.post('/auth/password-reset', data);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.response?.data?.message || 'Erro ao solicitar recuperação de senha');
    }
  }

  /**
   * Request password reset by CPF
   */
  static async requestPasswordResetByCpf(cpf: string): Promise<void> {
    try {
      await api.post('/auth/password-reset-cpf', { cpf });
    } catch (error: any) {
      console.error('Password reset by CPF error:', error);
      throw new Error(error.response?.data?.message || 'Erro ao solicitar recuperação de senha');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/password-reset/confirm', {
        token,
        password: newPassword,
      });
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      throw new Error(error.response?.data?.message || 'Erro ao redefinir senha');
    }
  }

  /**
   * Get current user from server - 100% Cookie Based
   * Uses /auth/me endpoint which automatically validates cookies
   */
  static async getCurrentUser(): Promise<{ cpf: string; name: string; email: string; role: string } | null> {
    try {
      // 🎉 Request automatically includes cookies
      const response = await api.get('/auth/me');
      const responseData = response.data as ApiResponse<{ cpf: string; name: string; email: string; role: string }>;
      return responseData.data;
    } catch (error: any) {
      // Silently handle 401 errors (user not authenticated)
      if (error.response?.status === 401) {
        return null;
      }
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated - 100% Cookie Based
   * Uses server validation via cookies
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      // 🎉 Server validates authentication via cookies automatically
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Verify token validity - 100% Cookie Based
   * Server validates cookies automatically
   */
  static async verifyToken(): Promise<boolean> {
    try {
      // Using /auth/me instead of /auth/verify for simplicity
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  /**
   * Refresh token - 100% Cookie Based
   * Server handles refresh automatically via cookies
   */
  static async refreshToken(): Promise<boolean> {
    try {
      // 🎉 Refresh automatically handled via cookies
      await api.post('/auth/refresh');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      await api.get('/auth/health');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export default AuthService;

/**
 * API Service Configuration - 100% Cookie Based Authentication
 * Centralized HTTP client following SIGAC API v2.0.0 Cookie-Based Auth
 */

import axios from 'axios';
import { toast } from 'sonner';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // 🔑 ESSENTIAL for automatic cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for error handling and automatic refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors with automatic refresh (except for auth/me on initialization)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh on auth/me endpoint (user might not be logged in)
      if (originalRequest.url?.includes('/auth/me')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      try {
        // Attempt automatic refresh via cookies
        await apiClient.post('/auth/refresh');
        
        // Retry original request (new cookies will be sent automatically)
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        toast.error('Sessão expirada. Faça login novamente.');
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other common errors (but not 401 on auth/me)
    if (error.response?.status === 403) {
      toast.error('Acesso negado. Você não tem permissão para esta ação.');
    } else if (error.response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Erro de conexão. Verifique sua internet.');
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods with cookie support
export const api = {
  get: <T>(url: string, config?: any) =>
    apiClient.get(url, config),
  
  post: <T>(url: string, data?: any, config?: any) =>
    apiClient.post(url, data, config),
  
  put: <T>(url: string, data?: any, config?: any) =>
    apiClient.put(url, data, config),
  
  patch: <T>(url: string, data?: any, config?: any) =>
    apiClient.patch(url, data, config),
  
  delete: <T>(url: string, config?: any) =>
    apiClient.delete(url, config),
};

export default apiClient;

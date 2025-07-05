/**
 * Authentication Context - 100% Cookie Based
 * Provides authentication state and methods using SIGAC API v2.0.0 Cookie-Based Auth
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import AuthService, { LoginCredentials, RegisterData } from '@/services/authService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Initialize authentication state on app load - 100% Cookie Based
   * Server validates authentication via cookies automatically
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // 🎉 Check authentication via cookies automatically
        const currentUser = await AuthService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function - 100% Cookie Based
   */
  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await AuthService.login(credentials);
      
      // 🎉 No need to manually store anything, cookies handle it all
      setUser(authResponse.user);
      setIsAuthenticated(true);
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registration function
   */
  const handleRegister = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.register(userData);
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao fazer cadastro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function - 100% Cookie Based
   */
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // 🎉 Server automatically clears cookies
      await AuthService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      toast.error('Erro ao fazer logout, mas você foi desconectado localmente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request password reset
   */
  const handleRequestPasswordReset = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.requestPasswordReset({ email });
      toast.success('Solicitação de recuperação de senha enviada!');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast.error(error.message || 'Erro ao solicitar recuperação de senha');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data - 100% Cookie Based
   */
  const refreshUser = async (): Promise<void> => {
    try {
      // 🎉 Get fresh user data via cookies
      const currentUser = await AuthService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    requestPasswordReset: handleRequestPasswordReset,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao cadastrar usuário');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server request fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request password reset
   */
  const handlePasswordReset = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.requestPasswordReset({ email });
      toast.success('Instruções de recuperação enviadas para seu email!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Erro ao solicitar recuperação de senha');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data from localStorage
   */
  const refreshUser = (): void => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    requestPasswordReset: handlePasswordReset,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;

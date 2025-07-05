/**
 * Custom hooks for API operations
 * Provides convenient hooks for common API operations with loading/error states
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface MutationState {
  loading: boolean;
  error: string | null;
}

/**
 * Hook for GET requests with automatic loading and error handling
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { immediate = true, onSuccess, onError } = options;

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Hook for mutation operations (POST, PUT, DELETE) with loading and error handling
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: string, variables: TVariables) => void;
    showSuccessToast?: boolean | string;
    showErrorToast?: boolean;
  } = {}
): {
  mutate: (variables: TVariables) => Promise<TData | null>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
} & MutationState {
  const [state, setState] = useState<MutationState>({
    loading: false,
    error: null,
  });

  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  const mutate = async (variables: TVariables): Promise<TData | null> => {
    try {
      setState({ loading: true, error: null });
      const result = await mutationFn(variables);
      setState({ loading: false, error: null });
      
      onSuccess?.(result, variables);
      
      if (showSuccessToast) {
        const message = typeof showSuccessToast === 'string' 
          ? showSuccessToast 
          : 'Operação realizada com sucesso!';
        toast.success(message);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      setState({ loading: false, error: errorMessage });
      
      onError?.(errorMessage, variables);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      return null;
    }
  };

  const mutateAsync = async (variables: TVariables): Promise<TData> => {
    const result = await mutate(variables);
    if (result === null) {
      throw new Error(state.error || 'Mutation failed');
    }
    return result;
  };

  const reset = () => {
    setState({ loading: false, error: null });
  };

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}

/**
 * Hook for paginated data with search and filtering
 */
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number, search?: string, filters?: Record<string, any>) => Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>,
  options: {
    initialPage?: number;
    pageSize?: number;
    immediate?: boolean;
  } = {}
): {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  search: string;
  filters: Record<string, any>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  refetch: () => Promise<void>;
} {
  const { initialPage = 1, pageSize = 10, immediate = true } = options;
  
  const [state, setState] = useState({
    data: [] as T[],
    total: 0,
    page: initialPage,
    totalPages: 0,
    loading: false,
    error: null as string | null,
  });
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiCall(state.page, pageSize, search, filters);
      setState(prev => ({
        ...prev,
        ...result,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao carregar dados';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [apiCall, state.page, pageSize, search, filters]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setState(prev => ({ ...prev, page: 1 }));
  }, [search, filters]);

  const setPage = (page: number) => {
    setState(prev => ({ ...prev, page }));
  };

  return {
    ...state,
    search,
    filters,
    setPage,
    setSearch,
    setFilters,
    refetch: fetchData,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  initialData: T[],
  mutationFn: (item: Partial<T>) => Promise<T>
): {
  data: T[];
  update: (item: Partial<T>) => Promise<void>;
  loading: boolean;
} {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);

  const update = async (item: Partial<T>) => {
    const tempId = 'temp-' + Date.now();
    const optimisticItem = { ...item, id: tempId } as T;
    
    // Optimistically update UI
    setData(prev => [...prev, optimisticItem]);
    setLoading(true);

    try {
      const updatedItem = await mutationFn(item);
      // Replace optimistic item with real item
      setData(prev => prev.map(i => 
        (i as any).id === tempId ? updatedItem : i
      ));
    } catch (error) {
      // Revert optimistic update on error
      setData(prev => prev.filter(i => (i as any).id !== tempId));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, update, loading };
}

export default {
  useApi,
  useMutation,
  usePaginatedApi,
  useOptimisticUpdate,
};

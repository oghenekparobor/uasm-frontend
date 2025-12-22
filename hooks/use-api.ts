import { useState, useEffect, useCallback } from 'react';
import { mapApiError } from '@/lib/api-client';
import type { AsyncState } from '@/types/api';

export function useApi<T>(
  apiCall: () => Promise<{ data: T }>,
  dependencies: any[] = []
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await apiCall();
      setState({ data: response.data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: mapApiError(err).message,
      });
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<{ data: { data: T[]; meta: any } }>,
  initialParams: any = {}
) {
  const [params, setParams] = useState(initialParams);
  const [state, setState] = useState<AsyncState<T[]>>({
    data: null,
    loading: true,
    error: null,
  });
  const [meta, setMeta] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await apiCall(params);
      setState({ data: response.data.data, loading: false, error: null });
      setMeta(response.data.meta);
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: mapApiError(err).message,
      });
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    meta,
    setParams,
    refetch: fetchData,
  };
}


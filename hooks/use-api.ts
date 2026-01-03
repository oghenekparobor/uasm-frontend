import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [state, setState] = useState<AsyncState<T[]>>({
    data: null,
    loading: true,
    error: null,
  });
  const [meta, setMeta] = useState<any>(null);
  const paramsRef = useRef(initialParams);
  const paramsStringRef = useRef<string>(JSON.stringify(initialParams));
  const apiCallRef = useRef(apiCall);
  const [trigger, setTrigger] = useState(0);

  // Update refs when they change
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  // Check if params actually changed (by value, not reference) and trigger fetch
  useEffect(() => {
    const currentParamsString = JSON.stringify(initialParams);
    if (paramsStringRef.current !== currentParamsString) {
      paramsStringRef.current = currentParamsString;
      paramsRef.current = initialParams;
      setTrigger((prev) => prev + 1); // Trigger re-fetch
    }
  }, [initialParams]);

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await apiCallRef.current(paramsRef.current);
      setState({ data: response.data.data, loading: false, error: null });
      // Transform meta to match frontend interface (hasPrevious -> hasPrev)
      const transformedMeta = response.data.meta
        ? {
            ...response.data.meta,
            hasPrev: response.data.meta.hasPrevious ?? response.data.meta.hasPrev,
          }
        : null;
      setMeta(transformedMeta);
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: mapApiError(err).message,
      });
    }
  }, []);

  // Fetch when trigger changes (which happens when params actually change)
  useEffect(() => {
    fetchData();
  }, [trigger, fetchData]);

  return {
    ...state,
    meta,
    setParams: (newParams: any) => {
      paramsRef.current = newParams;
      paramsStringRef.current = JSON.stringify(newParams);
      setTrigger((prev) => prev + 1);
    },
    refetch: fetchData,
  };
}


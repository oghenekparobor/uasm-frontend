import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper to serialize array parameters for NestJS
const paramsSerializer = (params: any): string => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null) {
      return;
    }
    
    if (Array.isArray(value)) {
      // For arrays, send multiple query params with the same key
      value.forEach((item) => {
        searchParams.append(key, String(item));
      });
    } else {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For httpOnly cookies
  paramsSerializer,
});

// Request interceptor: Inject access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Skip processing for blob responses (file downloads)
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip token refresh for blob requests (file downloads)
    if (originalRequest.responseType === 'blob') {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints (login, refresh) to avoid infinite loops
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until token refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Lazy import to avoid circular dependency
        const { useAuthStore } = await import('@/store/auth-store');
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          // No refresh token available, logout user
          processQueue(new Error('No refresh token') as AxiosError, null);
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(new Error('No refresh token'));
        }

        // Attempt to refresh token
        const response = await axios.post<{ accessToken: string }>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        setAccessToken(accessToken);

        processQueue(null, accessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError as AxiosError, null);
        
        // Only logout if refresh token is invalid/expired (401 or 403)
        // Don't logout on network errors or other temporary issues
        const status = refreshError?.response?.status;
        const isAuthError = status === 401 || status === 403;
        
        if (isAuthError || !refreshError?.response) {
          // Refresh token is invalid/expired, or network error (no response)
          // Only logout on actual auth errors, not network issues
          if (isAuthError) {
            // Lazy import to avoid circular dependency
            const { useAuthStore } = await import('@/store/auth-store');
            useAuthStore.getState().clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Don't redirect, let the component handle it
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Standard error mapping
export const mapApiError = (error: unknown): { message: string; status?: number } => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return {
      message:
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'An error occurred',
      status: axiosError.response?.status,
    };
  }
  return { message: 'An unexpected error occurred' };
};

export default apiClient;


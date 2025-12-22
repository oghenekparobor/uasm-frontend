import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, clearAuth } = useAuthStore();

  // Verify token on mount
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      return;
    }

    const verifyAuth = async () => {
      try {
        await apiClient.get('/auth/me');
      } catch (error) {
        // Token invalid, clear auth
        clearAuth();
        router.push('/login');
      }
    };

    verifyAuth();
  }, [isLoading, isAuthenticated, router, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: useAuthStore.getState().logout,
  };
}


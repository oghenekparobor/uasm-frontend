import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthenticatedUser, LoginResponse } from '@/types/auth';
import apiClient from '@/lib/api-client';

interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: LoginResponse) => void;
  setUser: (user: AuthenticatedUser) => void;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

// In-memory storage for access token (not persisted)
let memoryAccessToken: string | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // Start as true during hydration

      setAuth: (data: LoginResponse) => {
        // Store access token in memory only
        memoryAccessToken = data.accessToken;
        
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user: AuthenticatedUser) => {
        set({ user });
      },

      logout: async () => {
        try {
          // Call logout endpoint to invalidate refresh token on server
          // This ensures proper cleanup on the backend
          // Call even if access token is missing (might have expired)
          const state = get();
          if (state.isAuthenticated || state.refreshToken) {
            try {
              await apiClient.post('/auth/logout');
            } catch (error) {
              // Log error but continue with local cleanup
              // Network errors or expired tokens shouldn't prevent logout
              console.warn('Logout endpoint call failed (continuing with local cleanup):', error);
            }
          }
        } catch (error) {
          // Ignore errors on logout - always clear local state
          console.warn('Logout error:', error);
        } finally {
          // Always clear local auth state, even if endpoint call fails
          memoryAccessToken = null;
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearAuth: () => {
        memoryAccessToken = null;
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist refresh token and user, not access token
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return async (state) => {
          // Defer state updates to next tick to ensure store is fully initialized
          await new Promise(resolve => setTimeout(resolve, 0));
          
          // After rehydration, handle token refresh if needed
          if (!state) {
            useAuthStore.setState({ isLoading: false });
            return;
          }
          
          // If we have a refresh token, try to refresh automatically
          if (state.refreshToken && typeof window !== 'undefined') {
            try {
              const { refreshAccessToken } = await import('@/lib/token-refresh');
              const newToken = await refreshAccessToken();
              
              // If refresh failed, clear auth
              if (!newToken) {
                useAuthStore.setState({
                  user: null,
                  isAuthenticated: false,
                  refreshToken: null,
                  isLoading: false,
                });
                return;
              }
            } catch (error) {
              console.error('Failed to refresh token on rehydration:', error);
              // Clear auth on refresh failure
              useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                refreshToken: null,
                isLoading: false,
              });
              return;
          }
        }
          
          // Always set loading to false after rehydration completes
          useAuthStore.setState({ isLoading: false });
        };
      },
    }
  )
);

// Get access token from memory
export const getAccessToken = (): string | null => {
  return memoryAccessToken || useAuthStore.getState().accessToken;
};

// Set access token in memory
export const setAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
  useAuthStore.setState({ accessToken: token });
};

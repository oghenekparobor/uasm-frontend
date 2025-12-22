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
      isLoading: false, // Start as false, will be set during rehydration

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
      onRehydrateStorage: () => async (state) => {
        // After rehydration, set loading to false and update isAuthenticated
        if (state) {
          state.isLoading = false;
          // Set isAuthenticated based on persisted user
          if (state.user) {
            state.isAuthenticated = true;
          }
          
          // If we have a refresh token but no access token, try to refresh automatically
          if (state.refreshToken && !state.accessToken && typeof window !== 'undefined') {
            // Import and call refresh function
            try {
              const { refreshAccessToken } = await import('@/lib/token-refresh');
              await refreshAccessToken();
            } catch (error) {
              console.error('Failed to refresh token on rehydration:', error);
            }
          }
        }
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

import axios from 'axios';
import { useAuthStore, setAccessToken } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Attempts to refresh the access token using the refresh token
 * This is called automatically when the app initializes and we have a refresh token but no access token
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = useAuthStore.getState().refreshToken;
    
    if (!refreshToken) {
      console.log('No refresh token available');
      return null;
    }

    const response = await axios.post<{ accessToken: string }>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );

    const { accessToken } = response.data;
    setAccessToken(accessToken);
    
    console.log('Access token refreshed successfully');
    return accessToken;
  } catch (error: any) {
    console.error('Failed to refresh access token:', error);
    
    // If refresh token is invalid/expired, clear auth
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      console.log('Refresh token invalid, clearing auth');
      useAuthStore.getState().clearAuth();
    }
    
    return null;
  }
}

/**
 * Checks if we need to refresh the token and does so automatically
 * Call this on app initialization
 */
export async function ensureAccessToken(): Promise<boolean> {
  const { accessToken, refreshToken, isAuthenticated } = useAuthStore.getState();
  
  // If we're not authenticated, no need to refresh
  if (!isAuthenticated || !refreshToken) {
    return false;
  }
  
  // Check if we have an access token in memory
  const currentToken = useAuthStore.getState().accessToken;
  if (currentToken) {
    return true;
  }
  
  // Try to refresh the token
  const newToken = await refreshAccessToken();
  return newToken !== null;
}

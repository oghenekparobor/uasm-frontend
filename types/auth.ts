export type AppRole =
  | 'super_admin'
  | 'admin'
  | 'worker'
  | 'platoon_leader'
  | 'assistant_platoon_leader'
  | 'children_teacher'
  | 'kitchen'
  | 'distribution';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: AppRole;
  workerId?: string | null;
  platoonIds: string[];
  roles?: string[]; // Additional roles from backend
  platoons?: Array<{
    id: string;
    name: string;
    type: string;
    role: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


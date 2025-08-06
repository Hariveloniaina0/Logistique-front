//src\types\auth.types.ts
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface User {
  idUser: number;
  userName: string;
  emailAddress: string;
  userRole: UserRole;
  isActive: boolean;
  lastLoginAt: Date;
  store?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
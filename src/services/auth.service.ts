// src/services/auth.service.ts
import { LoginRequest, LoginResponse, User } from '../types';
import { apiService } from './api';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    return apiService.post<void>('/auth/logout');
  }

  async refreshToken(): Promise<{ accessToken: string; user: User }> {
    const tokenResponse = await apiService.get<{ access_token: string }>('/auth/refresh');
    const profileResponse = await apiService.get<{ user: User }>('/auth/profile');
    return {
      accessToken: tokenResponse.access_token,
      user: profileResponse.user,
    };
  }

  async getProfile(): Promise<{ user: User }> {
    return apiService.get<{ user: User }>('/auth/profile');
  }

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    return apiService.patch<void>('/auth/change-password', data);
  }

  async logoutAll(): Promise<void> {
    return apiService.post<void>('/auth/logout-all');
  }
}

export const authService = new AuthService();
import { getStoredRefreshToken } from '~/utils';
import { LoginRequest, LoginResponse, User } from '../types';
import { apiService } from './api';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Attempting login...');
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials);
      console.log('Login successful');
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('Attempting logout...');
    try {
      await apiService.post<void>('/auth/logout');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    console.log('Refreshing token via API...');
    try {
      // Vérifier d'abord si on a un refresh token
      const storedRefreshToken = await getStoredRefreshToken();
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const tokenResponse = await apiService.get<{ access_token: string; refresh_token: string }>('/auth/refresh');
      console.log('Token refresh API call successful');
      
      const profileResponse = await apiService.get<{ user: User }>('/auth/profile');
      console.log('Profile fetch successful');
      
      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        user: profileResponse.user,
      };
    } catch (error) {
      console.error('Token refresh service error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<{ user: User }> {
    console.log('Fetching user profile...');
    try {
      const response = await apiService.get<{ user: User }>('/auth/profile');
      console.log('Profile fetch successful');
      return response;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      throw error;
    }
  }

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    return apiService.patch<void>('/auth/change-password', data);
  }

  async logoutAll(): Promise<void> {
    return apiService.post<void>('/auth/logout-all');
  }
}

export const authService = new AuthService();
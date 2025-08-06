// src/services/auth.service.ts
import { getStoredRefreshToken, storeRefreshToken, storeToken, storeUserData } from '~/utils';
import { LoginRequest, LoginResponse, User } from '../types';
import { apiService } from './api';

class AuthService {
async login(credentials: LoginRequest): Promise<LoginResponse> {
  console.log('Attempting login with credentials:', { email: credentials.email });
  try {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    console.log('Login response:', {
      access_token: response.access_token ? 'Present' : 'Missing',
      refresh_token: response.refresh_token ? 'Present' : 'Missing',
      message: response.message,
    });
    if (!response.access_token) {
      throw new Error('No access token in login response');
    }
    if (!response.refresh_token) {
      throw new Error('No refresh token in login response');
    }
    await storeToken(response.access_token);
    console.log('Access token stored successfully');
    await storeRefreshToken(response.refresh_token);
    console.log('Refresh token stored successfully');
    const profileResponse = await authService.getProfile();
    await storeUserData(profileResponse.user);
    console.log('User data stored:', { email: profileResponse.user.emailAddress, role: profileResponse.user.userRole });
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
      console.log('Continuing with local cleanup despite logout error');
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    console.log('Auth service: Refreshing token via API...');
    try {
      const storedRefreshToken = await getStoredRefreshToken();
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('Auth service: Making refresh API call...');
      const tokenResponse = await apiService.get<{ access_token: string; refresh_token: string }>('/auth/refresh');
      console.log('Auth service: Token refresh API call successful');
      
      console.log('Auth service: Fetching updated profile...');
      const profileResponse = await apiService.get<{ user: User }>('/auth/profile');
      console.log('Auth service: Profile fetch successful');
      
      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        user: profileResponse.user,
      };
    } catch (error: any) {
      console.error('Auth service: Token refresh error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('User not found or inactive');
      }
      
      if (error.message === 'Authentication failed') {
        throw new Error('Authentication failed');
      }
      
      // Pour les autres erreurs
      throw new Error(error.message || 'Token refresh failed');
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
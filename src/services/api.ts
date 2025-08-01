// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@env';
import { APP_CONFIG, STORAGE_KEYS } from '../constants';
import { getStoredToken, removeStoredToken, getStoredRefreshToken, removeStoredRefreshToken, removeUserData, storeRefreshToken, storeToken } from '../utils/storage';

class ApiService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: APP_CONFIG.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await getStoredToken();
        const refreshToken = await getStoredRefreshToken();
        
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        
        if (token && config.url !== '/auth/refresh') {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (refreshToken && config.url === '/auth/refresh') {
          config.headers['x-refresh-token'] = refreshToken;
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`Response ${response.status} for ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        console.error(`Response error ${error.response?.status} for ${originalRequest?.url}`);
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('Attempting token refresh due to 401...');
            const response = await this.instance.get('/auth/refresh');
            const newToken = response.data.access_token;
            
            await storeToken(newToken);
            if (response.data.refresh_token) {
              await storeRefreshToken(response.data.refresh_token);
            }
            
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.instance(originalRequest);
            
          } catch (refreshError) {
            console.error('Token refresh failed in interceptor:', refreshError);
            this.processQueue(refreshError, null);
            await removeStoredToken();
            await removeStoredRefreshToken();
            await removeUserData();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.instance.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post(url, data, {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
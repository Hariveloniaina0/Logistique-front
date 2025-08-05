// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@env';
import { APP_CONFIG } from '../constants';
import { 
  getStoredToken, 
  removeStoredToken, 
  getStoredRefreshToken, 
  removeStoredRefreshToken, 
  removeUserData, 
  storeRefreshToken, 
  storeToken 
} from '../utils/storage';

class ApiService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
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

  private async performTokenRefresh(): Promise<string> {
    console.log('Performing token refresh...');
    
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Faire la requête de refresh avec le refresh token dans le header
      const response = await this.instance.get('/auth/refresh', {
        headers: {
          'x-refresh-token': refreshToken
        }
      });
      
      const newToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;
      
      if (!newToken) {
        throw new Error('No access token in refresh response');
      }
      
      // Sauvegarder les nouveaux tokens
      await storeToken(newToken);
      if (newRefreshToken) {
        await storeRefreshToken(newRefreshToken);
      }
      
      console.log('Token refresh successful in API service');
      return newToken;
      
    } catch (error: any) {
      console.error('Token refresh failed in API service:', error);
      
      // Si c'est une 401, le refresh token est invalide
      if (error.response?.status === 401) {
        await this.clearAuthData();
        throw new Error('Authentication failed');
      }
      
      throw error;
    }
  }

  private async clearAuthData() {
    await removeStoredToken();
    await removeStoredRefreshToken();
    await removeUserData();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await getStoredToken();
        const refreshToken = await getStoredRefreshToken();
        
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        
        // Pour les requêtes normales, utiliser le Bearer token
        if (token && config.url !== '/auth/refresh') {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Pour le refresh, utiliser le refresh token dans le header x-refresh-token
        if (refreshToken && config.url === '/auth/refresh') {
          config.headers['x-refresh-token'] = refreshToken;
          // Ne pas inclure le Bearer token pour le refresh
          delete config.headers.Authorization;
        }

        // Pour les requêtes multipart/form-data, laisser axios gérer le Content-Type
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
          console.log('FormData detected, letting axios handle Content-Type');
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`Response ${response.status} for ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        console.error(`Response error ${error.response?.status} for ${originalRequest?.url}`, error.response?.data);
        
        // Gérer les erreurs 401 (token expiré) - mais seulement pour les requêtes non-refresh
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            originalRequest?.url !== '/auth/refresh') {
          
          originalRequest._retry = true;

          // Si un refresh est déjà en cours, attendre qu'il se termine
          if (this.isRefreshing && this.refreshPromise) {
            try {
              const newToken = await this.refreshPromise;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          // Si aucun refresh en cours, en démarrer un
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            
            this.refreshPromise = this.performTokenRefresh()
              .then((newToken) => {
                this.processQueue(null, newToken);
                return newToken;
              })
              .catch((refreshError) => {
                this.processQueue(refreshError, null);
                throw refreshError;
              })
              .finally(() => {
                this.isRefreshing = false;
                this.refreshPromise = null;
              });

            try {
              const newToken = await this.refreshPromise;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          // Si un refresh est en cours, mettre en queue
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ 
              resolve: (token) => {
                if (token) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(this.instance(originalRequest));
                } else {
                  reject(error);
                }
              }, 
              reject 
            });
          });
        }
        
        // Pour les erreurs de refresh token (401 sur /auth/refresh)
        if (error.response?.status === 401 && originalRequest?.url === '/auth/refresh') {
          console.log('Refresh token is invalid, clearing auth data');
          await this.clearAuthData();
          return Promise.reject(new Error('Authentication failed'));
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
    let config: any = {};

    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
      console.log('Sending FormData request to:', url);
      
      if (__DEV__ || process.env.NODE_ENV === 'development') {
        try {
          console.log('Sending FormData with keys (entries not available in RN)');
        } catch (error) {
          console.log('FormData logging skipped');
        }
      }
    }

    const response = await this.instance.post(url, data, config);
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
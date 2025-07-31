import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@env';
import { APP_CONFIG, STORAGE_KEYS } from '../constants';
import { getStoredToken, removeStoredToken } from '../utils/storage';

class ApiService {
  private instance: AxiosInstance;

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

  private setupInterceptors() {
    // Request interceptor pour ajouter le token
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor pour gérer les erreurs
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expiré, nettoyer le storage
          await removeStoredToken();
          // Rediriger vers login (sera géré par le context global)
        }
        return Promise.reject(error);
      }
    );
  }

  // Méthodes HTTP génériques
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.instance.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post(url, data);
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
import { apiService } from './api';
import { ApiResponse } from '../types';
import { FtpConfig } from '../types/ftp.types';

class FtpService {
    async getFtpConfig(): Promise<ApiResponse<FtpConfig>> {
        console.log('Fetching FTP configuration...');
        try {
            const response = await apiService.get<ApiResponse<FtpConfig>>('/ftp');
            console.log('FTP config fetch successful:', response);
            return response;
        } catch (error: any) {
            console.error('FTP config fetch failed:', error);
            
            if (error.response?.status === 404) {
                return { 
                    data: null,
                    message: 'No configuration found',
                    success: true
                } as ApiResponse<FtpConfig>;
            }
            
            throw error;
        }
    }

    async createFtpConfig(config: FtpConfig): Promise<ApiResponse<FtpConfig>> {
        console.log('Creating FTP configuration:', config);
        try {
            const response = await apiService.post<ApiResponse<FtpConfig>>('/ftp', config);
            console.log('FTP config creation successful:', response);
            
            if (!response.data) {
                throw new Error('Failed to create FTP config: No data returned from server');
            }
            
            return response;
        } catch (error: any) {
            console.error('FTP config creation failed:', error);
            throw error;
        }
    }

    async updateFtpConfig(id: number, config: FtpConfig): Promise<ApiResponse<FtpConfig>> {
        console.log('Updating FTP configuration:', config);
        try {
            const response = await apiService.put<ApiResponse<FtpConfig>>(`/ftp/${id}`, config);
            console.log('FTP config update successful:', response);
            
            if (!response.data) {
                throw new Error('Failed to update FTP config: No data returned from server');
            }
            
            return response;
        } catch (error: any) {
            console.error('FTP config update failed:', error);
            throw error;
        }
    }

    async deleteFtpConfig(): Promise<ApiResponse<void>> {
        console.log('Deleting FTP configuration...');
        try {
            const response = await apiService.delete<ApiResponse<void>>('/ftp');
            console.log('FTP config deletion successful:', response);
            return response;
        } catch (error: any) {
            console.error('FTP config deletion failed:', error);
            throw error;
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        console.log('Testing FTP connection...');
        try {
            const response = await apiService.get<{ success: boolean; message: string }>('/ftp/test');
            console.log('FTP connection test result:', response);
            return response;
        } catch (error: any) {
            console.error('FTP connection test failed:', error);
            throw error;
        }
    }
}

export const ftpService = new FtpService();
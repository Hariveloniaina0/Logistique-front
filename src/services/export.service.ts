import { apiService } from './api';
import { ApiResponse, LabelExportData } from '../types';


class ExportService {
    async exportLabels(data: LabelExportData): Promise<ApiResponse<string>> {
        console.log('Exporting labels:', data);
        try {
            const response = await apiService.post<ApiResponse<string>>('/export/labels', {
                ...data,
                format: data.format || 'csv' 
            });
            console.log('Label export successful:', response);
            return response;
        } catch (error: any) {
            console.error('Label export failed:', error);
            throw error;
        }
    }
}
export const exportService = new ExportService();
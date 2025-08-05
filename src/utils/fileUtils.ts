// src/utils/fileUtils.ts
import * as DocumentPicker from 'expo-document-picker';

export const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return 'Taille inconnue';

    const sizes = ['Bytes', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const validateFileType = (file: DocumentPicker.DocumentPickerAsset): boolean => {
    const allowedTypes = [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];

    if (file.mimeType && allowedTypes.includes(file.mimeType)) {
        return true;
    }

    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const extension = file.name.toLowerCase().split('.').pop();
    if (extension) {
        return allowedExtensions.includes(`.${extension}`);
    }
    return false;
};

export const getFileExtension = (filename: string): string => {
    return filename.toLowerCase().split('.').pop() || '';
};
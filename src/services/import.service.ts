import { apiService } from './api';
import * as DocumentPicker from 'expo-document-picker';
import { FieldMapping, ImportHeaders, ImportResult } from '../types/import.types';

class ImportService {
  async extractHeaders(file: DocumentPicker.DocumentPickerAsset): Promise<ImportHeaders> {
    console.log('Extracting headers for file:', {
      name: file.name,
      uri: file.uri,
      mimeType: file.mimeType,
      size: file.size,
    });
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'text/csv',
    } as any);
    console.log('FormData prepared for /import/headers');
    try {
      const response = await apiService.post<ImportHeaders>('/import/headers', formData);
      console.log('Headers received from backend:', response.headers);
      return response;
    } catch (error) {
      console.error('Header extraction error:', error);
      throw new Error('Failed to extract headers from server');
    }
  }

  async importProducts(file: File | any, mappings: FieldMapping): Promise<ImportResult> {
    const formData = new FormData();

    if (file.uri) {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);
    } else {
      formData.append('file', file);
    }

    formData.append('mappings', JSON.stringify(mappings));

    console.log('Starting import with mappings:', mappings);
    const response = await apiService.post<ImportResult>('/import/products', formData);
    console.log('Import completed:', response);
    return response;
  }

  validateMappings(mappings: FieldMapping): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = ['productCode', 'barcodeValue', 'productName'];
    const mappedValues = Object.values(mappings).filter(value => value !== '');

    for (const field of requiredFields) {
      if (!mappedValues.includes(field)) {
        errors.push(`Le champ obligatoire "${field}" doit être mappé`);
      }
    }

    const duplicates = mappedValues.filter((value, index) =>
      mappedValues.indexOf(value) !== index && value !== ''
    );

    if (duplicates.length > 0) {
      errors.push(`Les champs suivants sont mappés plusieurs fois: ${duplicates.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getAvailableFields(): Array<{ value: string; label: string; required: boolean }> {
    return [
      { value: 'productCode', label: 'Code Produit', required: true },
      { value: 'barcodeValue', label: 'Code-barres', required: true },
      { value: 'productName', label: 'Nom du Produit', required: true },
      { value: 'stockQuantity', label: 'Quantité de Stock', required: false },
      { value: 'priceCaisse', label: 'Prix Caisse', required: false },
      { value: 'priceGestcom', label: 'Prix Gestcom', required: false },
      { value: 'storeName', label: 'Nom du Magasin', required: false },
      { value: 'warehouseName', label: 'Nom de l\'Entrepôt', required: false },
      { value: 'supplierName', label: 'Nom du Fournisseur', required: false },
    ];
  }
}

export const importService = new ImportService();

export { ImportResult, FieldMapping, ImportHeaders };

export * from './auth.types';
export * from './api.types';

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface Supplier {
  idSupplier: number;
  supplierName: string;
}



export interface LabelExportData {
  barcode: string;
  labelQuantity: number;
  format?: 'csv' | 'excel';
}
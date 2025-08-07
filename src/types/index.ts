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

export interface Warehouse {
  idWarehouse: number;
  warehouseName: string;
}

export interface Store {
  idStore: number;
  storeName: string;
}
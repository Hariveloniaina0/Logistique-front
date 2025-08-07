// src/store/types/index.ts
import { ProductState } from '~/types/product.types';
import { AuthState, Store, Supplier, Warehouse } from '../../types';
import { FtpState } from '~/types/ftp.types';

export interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
}

export interface WarehouseState {
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
}

export interface StoreState {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  products: ProductState;
  ftp: FtpState;
  suppliers: SupplierState;
  warehouses: WarehouseState;
  stores: StoreState;
}

export { AuthState, ProductState, FtpState };
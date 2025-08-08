// src/store/types/index.ts
import { ProductState } from '~/types/product.types';
import { AuthState, Supplier } from '../../types';
import { FtpState } from '~/types/ftp.types';
import { Warehouse } from '~/types/warehouse.types';
import { Store } from '~/types/store.types';

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
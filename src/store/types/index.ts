// src/store/types/index.ts
import { ProductState } from '~/types/product.types';
import { AuthState } from '../../types';
import { FtpState } from '~/types/ftp.types';

export interface RootState {
  auth: AuthState;
  products: ProductState;
    ftp: FtpState;

}

export { AuthState,ProductState,FtpState };

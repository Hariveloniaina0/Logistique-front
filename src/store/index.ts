// src/store/index.ts
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import ftpReducer from './slices/ftpSlice';
import supplierReducer from './slices/supplierSlice';
import warehouseReducer from './slices/warehouseSlice';
import storeReducer from './slices/storeSlice';
import ordersReducer from './slices/orderSlice';
import stockReducer from './slices/stock.slice';

import { AuthState, ProductState, FtpState } from './types';

const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'accessToken', 'isAuthenticated', 'refreshToken'],
};

const productPersistConfig: PersistConfig<ProductState> = {
  key: 'products',
  storage: AsyncStorage,
  whitelist: [],
};

const ftpPersistConfig: PersistConfig<FtpState> = {
  key: 'ftp',
  storage: AsyncStorage,
  whitelist: ['config'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedProductReducer = persistReducer(productPersistConfig, productReducer);
const persistedFtpReducer = persistReducer(ftpPersistConfig, ftpReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    products: persistedProductReducer,
    ftp: persistedFtpReducer,
    suppliers: supplierReducer,
    warehouses: warehouseReducer,
    stores: storeReducer,
    orders: ordersReducer,
    stock: stockReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.user.lastLoginAt'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
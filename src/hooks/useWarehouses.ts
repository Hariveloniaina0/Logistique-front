// src/hooks/useWarehouses.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchWarehouses } from '../store/slices/warehouseSlice';

export const useWarehouses = () => {
  const dispatch = useAppDispatch();
  const { warehouses, isLoading, error } = useAppSelector((state) => state.warehouses);

  const loadWarehouses = useCallback(async () => {
    await dispatch(fetchWarehouses());
  }, [dispatch]);

  return {
    warehouses,
    isLoading,
    error,
    loadWarehouses,
  };
};
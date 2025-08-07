// src/hooks/useSuppliers.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchSuppliers } from '../store/slices/supplierSlice';

export const useSuppliers = () => {
  const dispatch = useAppDispatch();
  const { suppliers, isLoading, error } = useAppSelector((state) => state.suppliers);

  const loadSuppliers = useCallback(async () => {
    await dispatch(fetchSuppliers());
  }, [dispatch]);

  return {
    suppliers,
    isLoading,
    error,
    loadSuppliers,
  };
};
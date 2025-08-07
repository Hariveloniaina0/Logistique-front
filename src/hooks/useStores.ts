// src/hooks/useStores.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchStores } from '../store/slices/storeSlice';

export const useStores = () => {
  const dispatch = useAppDispatch();
  const { stores, isLoading, error } = useAppSelector((state) => state.stores);

  const loadStores = useCallback(async () => {
    await dispatch(fetchStores());
  }, [dispatch]);

  return {
    stores,
    isLoading,
    error,
    loadStores,
  };
};


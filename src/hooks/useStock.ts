import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchStocks, clearError } from '../store/slices/stock.slice';
import { Stock, StockFilter } from '../types/stock.types';

export const useStock = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stocks, loading, error } = useSelector((state: RootState) => state.stock);

  const loadStocks = async (filter: StockFilter = {}) => {
    await dispatch(fetchStocks(filter));
  };

  const clearStockError = () => {
    dispatch(clearError());
  };

  return {
    stocks,
    loading,
    error,
    loadStocks,
    clearStockError,
  };
};
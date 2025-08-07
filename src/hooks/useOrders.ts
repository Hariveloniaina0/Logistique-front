import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders, clearError, updateOrder, deleteOrder } from '../store/slices/orderSlice';
import { Order } from '../types/order.types';

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading, error } = useAppSelector((state) => state.orders);

  const fetchOrdersData = useCallback(async () => {
    try {
      await dispatch(fetchOrders()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const updateOrderData = useCallback(async (id: number, data: Partial<Order>) => {
    try {
      await dispatch(updateOrder({ id, data })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const deleteOrderData = useCallback(async (id: number) => {
    try {
      await dispatch(deleteOrder(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const clearOrdersError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders: fetchOrdersData,
    updateOrder: updateOrderData,
    deleteOrder: deleteOrderData,
    clearError: clearOrdersError,
  };
};
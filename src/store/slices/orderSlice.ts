import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { Order } from '../../types/order.types';

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null | undefined;
}

const initialState: OrdersState = {
  orders: [],
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Order[]>('/orders');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to fetch orders');
    }
  }
);

export const updateOrder = createAsyncThunk<Order, { id: number; data: Partial<Order> }, { rejectValue: string }>(
  'orders/updateOrder',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Order>(`/orders/${id}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to update order');
    }
  }
);

export const deleteOrder = createAsyncThunk<number, number, { rejectValue: string }>(
  'orders/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/orders/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to delete order');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex((order) => order.idOrders === action.payload.idOrders);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter((order) => order.idOrders !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
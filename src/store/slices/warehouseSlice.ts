import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { Warehouse } from '../../types/warehouse.types';

interface WarehouseState {
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  isLoading: false,
  error: null,
};

export const fetchWarehouses = createAsyncThunk('warehouses/fetchWarehouses', async () => {
  const response = await apiService.get<Warehouse[]>('/warehouses');
  return response;
});

const warehouseSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Échec du chargement des entrepôts';
      });
  },
});

export default warehouseSlice.reducer;
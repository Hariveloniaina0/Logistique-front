// src/store/slices/supplierSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { Supplier } from '../../types';

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  isLoading: false,
  error: null,
};

export const fetchSuppliers = createAsyncThunk('suppliers/fetchSuppliers', async () => {
  const response = await apiService.get<Supplier[]>('/suppliers');
  return response;
});

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Échec du chargement des fournisseurs';
      });
  },
});

export default supplierSlice.reducer;
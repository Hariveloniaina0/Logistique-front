import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { Store } from '../../types/store.types';

interface StoreState {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  stores: [],
  isLoading: false,
  error: null,
};

export const fetchStores = createAsyncThunk('stores/fetchStores', async () => {
  const response = await apiService.get<Store[]>('/stores');
  return response;
});

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Échec du chargement des magasins';
      });
  },
});

export default storeSlice.reducer;
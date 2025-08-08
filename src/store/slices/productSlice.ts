// src/store/slices/productSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types/product.types';
import { apiService } from '../../services/api';
import { ProductState } from '../types';
import { Order } from '~/types/order.types';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const initialState: ProductState = {
  products: [],
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  hasNextPage: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  searchTerm: '',
  searchResults: [],
  isSearching: false,
  selectedProduct: null,
  pendingOrders: [],
};

// Thunks
export const fetchProducts = createAsyncThunk<
  PaginatedResult<Product>,
  { page: number; limit?: number; search?: string; refresh?: boolean },
  { rejectValue: string }
>('products/fetchProducts', async ({ page, limit = 20, search }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await apiService.get<PaginatedResult<Product>>(`/products/paginated?${params}`);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des produits');
  }
});

export const searchProducts = createAsyncThunk<
  Product[],
  string,
  { rejectValue: string }
>('products/searchProducts', async (searchTerm, { rejectWithValue }) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }
    const response = await apiService.get<Product[]>(`/products/search?term=${encodeURIComponent(searchTerm.trim())}`);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur lors de la recherche');
  }
});

export const getProductById = createAsyncThunk<
  Product,
  number,
  { rejectValue: string }
>('products/getProductById', async (id, { rejectWithValue }) => {
  try {
    const response = await apiService.get<Product>(`/products/${id}`);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Produit non trouvé');
  }
});

export const getProductByBarcode = createAsyncThunk<
  Product | null,
  string,
  { rejectValue: string }
>('products/getProductByBarcode', async (barcode, { rejectWithValue }) => {
  try {
    const response = await apiService.get<Product | null>(`/products/barcode/${barcode}`);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Produit non trouvé');
  }
});

export const getPendingOrdersForProduct = createAsyncThunk<
  Order[],
  number,
  { rejectValue: string }
>('products/getPendingOrdersForProduct', async (productId, { rejectWithValue }) => {
  try {
    const response = await apiService.get<Order[]>(`/products/${productId}/pending-orders`);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des commandes');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchTerm = '';
      state.isSearching = false;
    },
    resetProducts: (state) => {
      state.products = [];
      state.currentPage = 0;
      state.totalPages = 0;
      state.totalItems = 0;
      state.hasNextPage = false;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state, action) => {
        if (action.meta.arg.page === 1 || action.meta.arg.refresh) {
          state.isLoading = true;
          state.products = [];
        } else {
          state.isLoadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { data, meta } = action.payload;
        const isFirstPage = action.meta.arg.page === 1 || action.meta.arg.refresh;

        if (isFirstPage) {
          state.products = data;
          state.isLoading = false;
        } else {
          // Éviter les doublons lors du chargement de plus
          const existingIds = new Set(state.products.map(p => p.idProduct));
          const newProducts = data.filter(p => !existingIds.has(p.idProduct));
          state.products = [...state.products, ...newProducts];
          state.isLoadingMore = false;
        }

        state.currentPage = meta.page;
        state.totalPages = meta.totalPages;
        state.totalItems = meta.total;
        state.hasNextPage = meta.hasNextPage;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
      })

      // Get pending orders for product
      .addCase(getPendingOrdersForProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPendingOrdersForProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingOrders = action.payload; 
      })
      .addCase(getPendingOrdersForProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
    .addCase(searchProducts.fulfilled, (state, action) => {
      state.isSearching = false;
      state.searchResults = action.payload;
      state.error = null;
    })
    .addCase(searchProducts.rejected, (state, action) => {
      state.isSearching = false;
      state.error = action.payload as string;
    })

    // Get product by ID
    .addCase(getProductById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(getProductById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedProduct = action.payload;
      state.error = null;
    })
    .addCase(getProductById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Get product by barcode
    .addCase(getProductByBarcode.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(getProductByBarcode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedProduct = action.payload;
      state.error = null;
    })
    .addCase(getProductByBarcode.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
},
});

export const {
  clearError,
  setSearchTerm,
  clearSearchResults,
  resetProducts,
  setSelectedProduct
} = productSlice.actions;

export default productSlice.reducer;
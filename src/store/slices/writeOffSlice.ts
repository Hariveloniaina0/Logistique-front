import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { WriteOff, WriteOffState } from '../../types/writeOff.types';
import { RootState } from '../types';

const initialState: WriteOffState = {
    writeOffs: [],
    isLoading: false,
    isSearching: false,
    error: null,
    searchTerm: '',
    searchResults: [],
};

export const fetchWriteOffs = createAsyncThunk<
    WriteOff[],
    void,
    { rejectValue: string; state: RootState }
>('writeOff/fetchWriteOffs', async (_, { rejectWithValue }) => {
    try {
        const response = await apiService.get<any>('/writeoffs');
        if (Array.isArray(response)) {
            return response as WriteOff[];
        } else if (response.data && Array.isArray(response.data)) {
            return response.data as WriteOff[];
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des démarques';
        console.error('fetchWriteOffs error:', { errorMessage, status: error.response?.status, error });
        return rejectWithValue(errorMessage);
    }
});

export const searchWriteOffs = createAsyncThunk<
    WriteOff[],
    string,
    { rejectValue: string }
>('writeOff/searchWriteOffs', async (searchTerm, { rejectWithValue }) => {
    try {
        if (!searchTerm.trim()) {
            return [];
        }
        const response = await apiService.get<WriteOff[]>(`/writeoffs/search/comment?comment=${encodeURIComponent(searchTerm.trim())}`);
        return response;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la recherche des démarques';
        console.error('searchWriteOffs error:', { errorMessage, status: error.response?.status, error });
        return rejectWithValue(errorMessage);
    }
});

const writeOffSlice = createSlice({
    name: 'writeOff',
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
        // Nouveau reducer pour forcer le rechargement
        forceReload: (state) => {
            state.writeOffs = [];
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWriteOffs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWriteOffs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.writeOffs = action.payload;
                state.error = null;
            })
            .addCase(fetchWriteOffs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(searchWriteOffs.pending, (state) => {
                state.isSearching = true;
                state.error = null;
            })
            .addCase(searchWriteOffs.fulfilled, (state, action) => {
                state.isSearching = false;
                state.searchResults = action.payload;
                state.error = null;
            })
            .addCase(searchWriteOffs.rejected, (state, action) => {
                state.isSearching = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, setSearchTerm, clearSearchResults, forceReload } = writeOffSlice.actions;
export default writeOffSlice.reducer;
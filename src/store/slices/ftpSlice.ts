//src\store\slices\ftpSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FtpConfig, FtpState } from '../../types/ftp.types';
import { ftpService } from '../../services/ftp.service';

const initialState: FtpState = {
  config: null,
  isLoading: false,
  error: null,
};

export const fetchFtpConfig = createAsyncThunk<
  FtpConfig | null, 
  void,
  { rejectValue: string }
>('ftp/fetchConfig', async (_, { rejectWithValue }) => {
  try {
    const response = await ftpService.getFtpConfig();
    
    // Si pas de data, retourner null (pas une erreur)
    if (!response.data) {
      return null;
    }
    
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch FTP config');
  }
});

export const createFtpConfig = createAsyncThunk<
  FtpConfig,
  FtpConfig,
  { rejectValue: string }
>('ftp/createConfig', async (config, { rejectWithValue }) => {
  try {
    const response = await ftpService.createFtpConfig(config);
    if (!response.data) {
      return rejectWithValue('Failed to create FTP config: No data returned');
    }
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create FTP config');
  }
});

export const updateFtpConfig = createAsyncThunk<
  FtpConfig,
  FtpConfig,
  { rejectValue: string }
>('ftp/updateConfig', async (config, { rejectWithValue }) => {
  try {
    if (!config.idFtp) {
      return rejectWithValue('FTP config ID is required for update');
    }
    const response = await ftpService.updateFtpConfig(config.idFtp, config);
    if (!response.data) {
      return rejectWithValue('Failed to update FTP config: No data returned');
    }
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update FTP config');
  }
});

export const deleteFtpConfig = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('ftp/deleteConfig', async (_, { rejectWithValue }) => {
  try {
    await ftpService.deleteFtpConfig();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete FTP config');
  }
});

export const testFtpConnection = createAsyncThunk<
  { success: boolean; message: string },
  void,
  { rejectValue: string }
>('ftp/testConnection', async (_, { rejectWithValue }) => {
  try {
    const response = await ftpService.testConnection();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to test FTP connection');
  }
});

const ftpSlice = createSlice({
  name: 'ftp',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetFtpConfig: (state) => {
      state.config = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFtpConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFtpConfig.fulfilled, (state, action: PayloadAction<FtpConfig | null>) => {
        state.isLoading = false;
        state.config = action.payload; // Peut être null
      })
      .addCase(fetchFtpConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createFtpConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFtpConfig.fulfilled, (state, action: PayloadAction<FtpConfig>) => {
        state.isLoading = false;
        state.config = action.payload;
      })
      .addCase(createFtpConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateFtpConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFtpConfig.fulfilled, (state, action: PayloadAction<FtpConfig>) => {
        state.isLoading = false;
        state.config = action.payload;
      })
      .addCase(updateFtpConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFtpConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFtpConfig.fulfilled, (state) => {
        state.isLoading = false;
        state.config = null;
      })
      .addCase(deleteFtpConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(testFtpConnection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testFtpConnection.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string }>) => {
        state.isLoading = false;
        state.error = action.payload.success ? null : action.payload.message;
      })
      .addCase(testFtpConnection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetFtpConfig } = ftpSlice.actions;
export default ftpSlice.reducer;
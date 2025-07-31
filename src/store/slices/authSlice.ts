// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginRequest, User } from '../../types';
import { authService } from '../../services/auth.service';
import { storeToken, removeStoredToken, storeUserData, removeUserData, getStoredToken, getStoredUserData } from '../../utils/storage';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
  { accessToken: string; user: User },
  LoginRequest,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    await storeToken(response.access_token);
    const profileResponse = await authService.getProfile();
    await storeUserData(profileResponse.user);
    return {
      accessToken: response.access_token,
      user: profileResponse.user,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    await removeStoredToken();
    await removeUserData();
  } catch (error: any) {
    await removeStoredToken();
    await removeUserData();
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const refreshToken = createAsyncThunk<
  { accessToken: string; user: User },
  void,
  { rejectValue: string }
>('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refreshToken();
    const profileResponse = await authService.getProfile();
    await storeToken(response.access_token);
    await storeUserData(profileResponse.user);
    return {
      accessToken: response.access_token,
      user: profileResponse.user,
    };
  } catch (error: any) {
    await removeStoredToken();
    await removeUserData();
    return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
  }
});

export const loadStoredAuth = createAsyncThunk<
  { accessToken: string; user: User } | null,
  void,
  { rejectValue: string }
>('auth/loadStored', async (_, { rejectWithValue }) => {
  try {
    const storedToken = await getStoredToken();
    const storedUser = await getStoredUserData();
    if (storedToken && storedUser) {
      return {
        accessToken: storedToken,
        user: storedUser,
      };
    }
    return null;
  } catch (error) {
    return rejectWithValue('Failed to load stored auth');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
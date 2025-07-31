// src/hooks/useAuth.ts
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, logoutUser, clearError } from '../store/slices/authSlice';
import { LoginRequest } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = async (credentials: LoginRequest) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearAuthError,
  };
};
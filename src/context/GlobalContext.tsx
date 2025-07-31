// src/context/GlobalContext.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loadStoredAuth, refreshToken } from '../store/slices/authSlice';
import { APP_CONFIG } from '../constants';
import { User } from '../types';

interface GlobalContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  initializeApp: () => Promise<void>;
  handleTokenRefresh: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, error, accessToken } = useAppSelector(
    (state) => state.auth
  );

  const initializeApp = async () => {
    try {
      // Load stored auth (Redux Persist handles rehydration)
      await dispatch(loadStoredAuth()).unwrap();
      if (accessToken) {
        await dispatch(refreshToken()).unwrap(); // Validate token on app start
      }
    } catch (error) {
      console.log('No stored auth found or invalid:', error);
    }
  };

  const handleTokenRefresh = async () => {
    try {
      await dispatch(refreshToken()).unwrap();
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const refreshInterval = setInterval(() => {
        handleTokenRefresh();
      }, APP_CONFIG.TOKEN_REFRESH_THRESHOLD);

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    initializeApp();
  }, []);

  const contextValue: GlobalContextType = {
    isAuthenticated,
    isLoading,
    user,
    error,
    initializeApp,
    handleTokenRefresh,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
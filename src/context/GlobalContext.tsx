import React, { createContext, useContext, useEffect, ReactNode, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loadStoredAuth, refreshToken, clearAuth } from '../store/slices/authSlice';
import { APP_CONFIG } from '../constants';
import { User } from '../types';
import { Alert } from 'react-native';

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
  
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [refreshInterval, setRefreshIntervalState] = useState<NodeJS.Timeout | null>(null);
  
  const MAX_REFRESH_ATTEMPTS = 3;
  const MIN_REFRESH_INTERVAL = 30000; // 30 secondes minimum entre les refresh

  const initializeApp = useCallback(async () => {
    try {
      const result = await dispatch(loadStoredAuth()).unwrap();
      if (result && result.accessToken) {
        console.log('Stored auth loaded successfully');
      }
    } catch (error) {
      console.log('No stored auth found or invalid:', error);
      dispatch(clearAuth());
    }
  }, [dispatch]);

  const handleTokenRefresh = useCallback(async () => {
    // Éviter les refresh trop fréquents
    const now = Date.now();
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      console.log('Refresh token skipped - too frequent');
      return;
    }

    // Éviter les refresh simultanés
    if (isRefreshing) {
      console.log('Refresh already in progress');
      return;
    }

    try {
      setIsRefreshing(true);
      setLastRefreshTime(now);
      console.log('Attempting token refresh...');
      
      await dispatch(refreshToken()).unwrap();
      console.log('Token refreshed successfully');
      setRefreshAttempts(0); // Reset attempts on success
      
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      const newAttempts = refreshAttempts + 1;
      setRefreshAttempts(newAttempts);
      
      // Si c'est une erreur 401 ou d'authentification, ne pas retry
      if (error?.includes('Session expired') || 
          error?.includes('User not found') || 
          error?.includes('Authentication failed')) {
        console.log('Authentication error detected, clearing auth');
        handleAuthError(error);
        return;
      }
      
      // Retry seulement si ce n'est pas une erreur d'auth et qu'on n'a pas dépassé le max
      if (newAttempts < MAX_REFRESH_ATTEMPTS) {
        console.log(`Retry attempt ${newAttempts}/${MAX_REFRESH_ATTEMPTS} in 5 seconds`);
        setTimeout(() => {
          if (!isRefreshing) { // Double check
            handleTokenRefresh();
          }
        }, 5000);
      } else {
        console.error('Max refresh attempts reached');
        handleAuthError('Maximum refresh attempts reached');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, refreshAttempts, isRefreshing, lastRefreshTime]);

  const handleAuthError = useCallback((errorMessage: string) => {
    // Clear interval first
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshIntervalState(null);
    }
    
    setRefreshAttempts(0);
    setIsRefreshing(false);
    
    Alert.alert(
      'Session expirée',
      'Votre session a expiré. Veuillez vous reconnecter.',
      [
        {
          text: 'OK',
          onPress: () => {
            dispatch(clearAuth());
          },
        },
      ]
    );
  }, [dispatch, refreshInterval]);

  // Initialiser l'app une seule fois
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Gérer le refresh automatique - DÉSACTIVÉ pour éviter les conflits avec l'intercepteur
  useEffect(() => {
    // Clear existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshIntervalState(null);
    }

    // NE PAS mettre en place le refresh automatique ici
    // Laisser l'intercepteur d'axios s'en occuper
    if (isAuthenticated && accessToken) {
      console.log('User authenticated, but letting axios interceptor handle token refresh');
    }

    return () => {
      if (refreshInterval) {
        console.log('Clearing token refresh interval');
        clearInterval(refreshInterval);
        setRefreshIntervalState(null);
      }
    };
  }, [isAuthenticated, accessToken]);

  // Reset refresh attempts when user logs in successfully
  useEffect(() => {
    if (isAuthenticated && user) {
      setRefreshAttempts(0);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user]);

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
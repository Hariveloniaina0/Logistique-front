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
  const MAX_REFRESH_ATTEMPTS = 3;

  const initializeApp = useCallback(async () => {
    try {
      const result = await dispatch(loadStoredAuth()).unwrap();
      if (result && result.accessToken) {
        // Optionnel: Vérifier immédiatement la validité du token
        console.log('Stored auth loaded successfully');
      }
    } catch (error) {
      console.log('No stored auth found or invalid:', error);
      // S'assurer que l'état est nettoyé si le chargement échoue
      dispatch(clearAuth());
    }
  }, [dispatch]);

  const handleTokenRefresh = useCallback(async () => {
    try {
      console.log('Attempting token refresh...');
      await dispatch(refreshToken()).unwrap();
      console.log('Token refreshed successfully');
      setRefreshAttempts(0);
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      const newAttempts = refreshAttempts + 1;
      setRefreshAttempts(newAttempts);
      
      if (newAttempts < MAX_REFRESH_ATTEMPTS) {
        console.log(`Retry attempt ${newAttempts}/${MAX_REFRESH_ATTEMPTS}`);
        setTimeout(() => handleTokenRefresh(), 2000);
      } else {
        console.error('Max refresh attempts reached, logging out');
        Alert.alert(
          'Session expirée',
          error || 'Votre session a expiré. Veuillez vous reconnecter.',
          [
            {
              text: 'OK',
              onPress: () => {
                dispatch(clearAuth());
                setRefreshAttempts(0);
              },
            },
          ]
        );
      }
    }
  }, [dispatch, refreshAttempts]);

  // Initialiser l'app une seule fois
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Gérer le refresh automatique
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;

    if (isAuthenticated && accessToken) {
      console.log('Setting up token refresh interval');
      refreshInterval = setInterval(() => {
        console.log('Auto-refreshing token...');
        handleTokenRefresh();
      }, APP_CONFIG.TOKEN_REFRESH_THRESHOLD);
    }

    return () => {
      if (refreshInterval) {
        console.log('Clearing token refresh interval');
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated, accessToken, handleTokenRefresh]);

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
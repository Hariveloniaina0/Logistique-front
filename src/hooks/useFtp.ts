import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchFtpConfig, createFtpConfig, updateFtpConfig, deleteFtpConfig, testFtpConnection, clearError, resetFtpConfig } from '../store/slices/ftpSlice';
import { FtpConfig } from '../types/ftp.types';

export const useFtp = () => {
  const dispatch = useAppDispatch();
  const { config, isLoading, error } = useAppSelector((state) => state.ftp);

  const fetchConfig = useCallback(async () => {
    try {
      const result = await dispatch(fetchFtpConfig()).unwrap();
      return { success: true, data: result };
    } catch (error) {
      if (typeof error === 'string' && (error === 'No FTP configuration found' || error.includes('No configuration found'))) {
        return { success: true, data: null };
      }
      // Gérer le cas où error est un objet avec une propriété message
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes('No configuration found')) {
          return { success: true, data: null };
        }
      }
      console.error('Fetch config error:', error);
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const createConfig = useCallback(async (config: FtpConfig) => {
    console.log('Données envoyées à l\'API pour création:', config);
    try {
      const result = await dispatch(createFtpConfig(config)).unwrap();
      console.log('Configuration créée avec succès:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Create config error:', error);
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const updateConfig = useCallback(async (config: FtpConfig) => {
    console.log('Données envoyées à l\'API pour mise à jour:', config);
    try {
      const result = await dispatch(updateFtpConfig(config)).unwrap();
      console.log('Configuration mise à jour avec succès:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Update config error:', error);
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const deleteConfig = useCallback(async () => {
    try {
      await dispatch(deleteFtpConfig()).unwrap();
      console.log('Configuration supprimée avec succès');
      return { success: true };
    } catch (error) {
      console.error('Delete config error:', error);
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const testConnection = useCallback(async () => {
    try {
      const result = await dispatch(testFtpConnection()).unwrap();
      console.log('Test de connexion:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Test connection error:', error);
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const clearFtpError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetConfig = useCallback(() => {
    dispatch(resetFtpConfig());
  }, [dispatch]);

  return {
    config,
    isLoading,
    error,
    fetchConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    testConnection,
    clearFtpError,
    resetConfig,
  };
};
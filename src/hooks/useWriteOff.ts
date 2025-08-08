import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchWriteOffs, searchWriteOffs, clearError, setSearchTerm, clearSearchResults, forceReload } from '../store/slices/writeOffSlice';
import { useCallback } from 'react';

export const useWriteOff = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { writeOffs, isLoading, isSearching, error, searchTerm, searchResults } = useSelector((state: RootState) => state.writeOff);

  const loadWriteOffs = useCallback(async () => {
    try {
      await dispatch(fetchWriteOffs()).unwrap();
    } catch (error) {
      console.error('Erreur lors du chargement des writeOffs:', error);
    }
  }, [dispatch]);

  const searchWriteOffsByComment = useCallback(async (comment: string) => {
    try {
      await dispatch(searchWriteOffs(comment)).unwrap();
    } catch (error) {
      console.error('Erreur lors de la recherche des writeOffs:', error);
    }
  }, [dispatch]);

  const clearWriteOffError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setWriteOffSearchTerm = useCallback((term: string) => {
    dispatch(setSearchTerm(term));
  }, [dispatch]);

  const clearWriteOffSearchResults = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const forceReloadWriteOffs = useCallback(() => {
    dispatch(forceReload());
  }, [dispatch]);

  return {
    writeOffs,
    isLoading,
    isSearching,
    error,
    searchTerm,
    searchResults,
    loadWriteOffs,
    searchWriteOffsByComment,
    clearWriteOffError,
    setWriteOffSearchTerm,
    clearWriteOffSearchResults,
    forceReloadWriteOffs,
  };
};
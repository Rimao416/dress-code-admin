// hooks/useCategories.ts

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getCategories } from '@/services/category.service';
import { useCategoryStore } from '@/store/categoryStore';

export const useCategories = () => {
  const { categories, setCategories, setError, setLoading } = useCategoryStore();

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Met à jour l'état de chargement dans le store
  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching]);

  // Met à jour les catégories dans le store
  useEffect(() => {
    if (data) {
      const formattedData = data.map(category => ({
        ...category,
        // createdAt: new Date(category.createdAt).toISOString(),
        // updatedAt: new Date(category.updatedAt).toISOString(),
      }));
      setCategories(formattedData);
    }
  }, [data]);

  // Gère les erreurs
  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      setError(message);
    }
  }, [error]);

  return {
    data: categories,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
